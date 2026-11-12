import mongoose from "mongoose";
import redis from "../config/redis.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Projects from "../models/Project.model.js";
import Users from "../models/Users.model.js";
import Issues from "../models/Issues.model.js";
import Inspections from "../models/Inspection.model.js";
import Notifications from "../models/Notification.model.js";
import { NOTIFICATION_TYPES } from "../constant/notification.types.js";

export const getDepartmentProject = AsyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { projectId } = req.params
    if (typeof projectId !== "string" || !projectId) {
        throw new ApiErrors(400, "projectId is required")
    }

    if (!userId) {
        throw new ApiErrors(401, "user is unauthonticated")
    }

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiErrors(400, "Invalid projectId");
    }

    const redisKey = `officer:${userId}:${projectId}`
    const redisProject = await redis.get(redisKey)
    if (redisProject) {
        const projectDatas = JSON.parse(redisProject)

        const { inspections, ...projectData } = projectDatas;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { project: projectData, inspections, totalInspections: inspections.length },
                    "Project monitoring details fetched successfully"
                )
            );
    }

    const [user, project] = await Promise.all([
        Users.findById(userId)
            .select("departmentId"),

        Projects.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(projectId),
                },
            },
            {
                $lookup: {
                    from: Issues.collection.name,
                    localField: "issueId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                title: 1,
                                description: 1,
                                category: 1,
                                district: 1,
                                address: 1,
                                image: 1,
                                status: 1,
                                departmentId: 1,
                            },
                        },
                    ],
                    as: "issue",
                },
            },
            {
                $unwind: "$issue",
            },
            {
                $lookup: {
                    from: Users.collection.name,
                    localField: "contractorId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                phoneNumber: 1,
                                "profilePic.url": 1,
                            },
                        },
                    ],
                    as: "contractor",
                },
            },
            {
                $unwind: {
                    path: "$contractor",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: Inspections.collection.name,
                    localField: "_id",
                    foreignField: "projectId",
                    pipeline: [
                        {
                            $lookup: {
                                from: Users.collection.name,
                                localField: "inspectorId",
                                foreignField: "_id",
                                pipeline: [
                                    {
                                        $project: {
                                            name: 1,
                                            email: 1,
                                            phoneNumber: 1,
                                        },
                                    },
                                ],
                                as: "inspector",
                            },
                        },
                        {
                            $unwind: {
                                path: "$inspector",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $sort: {
                                visitDate: -1,
                            },
                        },
                    ],
                    as: "inspections",
                },
            },
            {
                $project: {
                    "issue.image.publicId": 0,
                    "progressUpdates.image.publicId": 0,
                    "completionSubmission.image.publicId": 0,
                    "inspections.image.publicId": 0,
                },
            },
        ])
    ])

    const projectDetails = Array.isArray(project) ? project[0] : project;

    if (!projectDetails) {
        throw new ApiErrors(404, "Project not found");
    }

    if (!projectDetails.issue || !projectDetails.issue.departmentId) {
        throw new ApiErrors(404, "project issue is not found")
    }

    if (user?.departmentId !== projectDetails.issue.departmentId) {
        throw new ApiErrors(400, "this project is not this officer department")
    }

    await redis.set(redisKey, JSON.stringify(projectDetails), "EX", 600)

    const { inspections, ...projectData } = projectDetails;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { project: projectData, inspections, totalInspections: inspections.length },
                "Project monitoring details fetched successfully"
            )
        );
});

export const viewAllAvailableInspector = AsyncHandler(async (req, res) => {
    const officerDistrict = req.user?.district;

    if (!officerDistrict) {
        throw new ApiErrors(400, "Officer district is not assigned");
    }

    const { name } = req.query;

    const busyInspectorIds = await Inspections.distinct("inspectorId", {
        result: null
    });

    // 2. Build query
    const query: Record<string, any> = {
        district: officerDistrict,
        role: "inspector",
        _id: {
            $nin: busyInspectorIds
        }
    };

    // 3. Search by name
    if (typeof name === "string" && name.trim()) {
        const escapedName = name
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        query.name = {
            $regex: escapedName,
            $options: "i"
        };
    }

    // 4. Fetch available inspectors
    const inspectors = await Users.find(query)
        .select("_id name profilePic.url phoneNumber")
        .sort({ name: 1 })
        .limit(5)
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            inspectors,
            "Available inspectors fetched successfully"
        )
    );
});

export const allocateInspectorForProject = AsyncHandler(async (req, res) => {
    const officerId = req.user?._id;

    if (!officerId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { projectId, inspectorId, date } = req.body;

    // 1. Validate required fields
    if (!projectId || !inspectorId || !date) {
        throw new ApiErrors(400, "All fields are required");
    }

    if (
        !mongoose.isValidObjectId(projectId) ||
        !mongoose.isValidObjectId(inspectorId)
    ) {
        throw new ApiErrors(400, "Invalid projectId or inspectorId");
    }

    // 2. Validate inspection date
    const visitDate = new Date(date);

    if (
        Number.isNaN(visitDate.getTime()) ||
        visitDate <= new Date()
    ) {
        throw new ApiErrors(400, "Please provide a valid future inspection date");
    }

    // 3. Fetch officer, project and inspector
    const [officer, project, inspector] = await Promise.all([
        Users.findById(officerId)
            .select("departmentId district"),

        Projects.findById(projectId)
            .populate({
                path: "issueId",
                select: "departmentId district"
            }),

        Users.findById(inspectorId)
            .select("_id name role district")
    ]);

    if (!officer) {
        throw new ApiErrors(404, "Officer not found");
    }

    if (!project) {
        throw new ApiErrors(404, "Project not found");
    }

    if (!inspector) {
        throw new ApiErrors(404, "Inspector not found");
    }

    // 4. Validate project issue
    const projectIssue = project.issueId as unknown as {
        departmentId: typeof officer.departmentId;
        district: string;
    } | null;

    if (!projectIssue) {
        throw new ApiErrors(404, "Project issue not found");
    }

    // 5. Department authorization
    if (
        !officer.departmentId ||
        String(officer.departmentId) !== String(projectIssue.departmentId)
    ) {
        throw new ApiErrors(
            403,
            "Officer does not belong to project department"
        );
    }

    // 6. Inspector validation
    if (inspector.role !== "inspector") {
        throw new ApiErrors(400, "Selected user is not an inspector");
    }

    if (inspector.district !== projectIssue.district) {
        throw new ApiErrors(
            400,
            "Inspector does not belong to project district"
        );
    }

    // 7. Validate project status
    if (project.status !== "WORK_SUBMITTED") {
        throw new ApiErrors(400, "Project work is not submitted");
    }

    // 8. Check existing project inspection
    const existingProjectInspection = await Inspections.findOne({
        projectId,
        result: null
    });

    if (existingProjectInspection) {
        throw new ApiErrors(
            409,
            "This project already has a pending inspection"
        );
    }

    // 9. Check inspector availability
    const existingInspectorAssignment = await Inspections.findOne({
        inspectorId,
        result: null
    });

    if (existingInspectorAssignment) {
        throw new ApiErrors(
            409,
            "Inspector is already assigned to another project"
        );
    }

    // 10. Create inspection
    let inspection;

    try {
        inspection = await Inspections.create({
            projectId,
            inspectorId,
            visitDate
        });
    } catch (error: any) {
        if (error?.code === 11000) {
            throw new ApiErrors(
                409,
                "Inspector or project already has a pending inspection"
            );
        }

        throw error;
    }

    // 11. Invalidate Redis cache
    await Promise.all([
        redis.del(`officer:${officerId}:${projectId}`),
        redis.del(`staff:project:${project.projectStaffId}:${projectId}`),
        redis.del(`contractor:project:${project.contractorId}:${projectId}`)
    ]);

    // 12. Prepare notifications
    const recipients = [
        {
            recipient: inspectorId,
            title: "New Inspection Assigned",
            message: "You have been assigned a new project inspection."
        },
        {
            recipient: project.contractorId,
            title: "Project Inspection Assigned",
            message: "An inspector has been assigned to inspect your project."
        },
        {
            recipient: project.projectStaffId,
            title: "Project Inspection Assigned",
            message: "An inspector has been assigned to your project."
        }
    ].filter(
        (item, index, arr) =>
            item.recipient &&
            arr.findIndex(
                x => String(x.recipient) === String(item.recipient)
            ) === index
    );

    const notifications = recipients.map(item => ({
        recipient: item.recipient,
        sender: officerId,
        type: NOTIFICATION_TYPES.INSPECTION_ASSIGNED,
        title: item.title,
        message: item.message,
        relatedId: projectId,
        relatedModel: "Project"
    }));

    // 13. Create notifications
    try {
        const createdNotifications = await Notifications.insertMany(
            notifications
        );

        const io = req.app.get("io");

        for (const noti of createdNotifications) {
            io.to(`user:${noti.recipient.toString()}`)
                .emit("updateNotification", noti);
        }
    } catch (error) {
        console.error("Inspection notification failed:", error);
    }

    // 14. Response
    return res.status(201).json(
        new ApiResponse(
            201,
            inspection,
            "Inspector allocated successfully"
        )
    );
});