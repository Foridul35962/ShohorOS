import mongoose from "mongoose";
import { CATEGORY, PROJECT_STATUS } from "../constant/common.js";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import redis from "../config/redis.js";
import ApiResponse from "../helpers/ApiResponse.js";
import Projects from "../models/Project.model.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import Notifications from "../models/Notification.model.js";
import Users from "../models/Users.model.js";
import { NOTIFICATION_TYPES } from "../constant/notification.types.js";
import Issues from "../models/Issues.model.js";

export const getAllAllocatedProject = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { category } = req.query;

    const page = Number(req.query.page ?? 1);
    const limit = 15;

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiErrors(400, "Invalid page number");
    }

    if (category !== undefined && typeof category !== "string") {
        throw new ApiErrors(400, "Invalid category");
    }

    const normalizedCategory = category?.trim().toUpperCase();

    if (
        normalizedCategory &&
        !CATEGORY.includes(normalizedCategory as (typeof CATEGORY)[number])
    ) {
        throw new ApiErrors(400, "Invalid category");
    }

    const staffId = new mongoose.Types.ObjectId(userId.toString());
    const skip = (page - 1) * limit;

    const result = await Projects.aggregate([
        // Get only projects allocated to this staff
        {
            $match: {
                projectStaffId: staffId,
            },
        },

        // Get issue information
        {
            $lookup: {
                from: "issues",
                let: { issueId: "$issueId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$issueId"],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            category: 1,
                            description: 1,
                            district: 1,
                            address: 1,
                            status: 1,
                            priority: 1,
                            image: {
                                $map: {
                                    input: "$image",
                                    as: "img",
                                    in: "$$img.url",
                                },
                            },
                        },
                    },
                ],
                as: "issue",
            },
        },

        {
            $unwind: "$issue",
        },

        // Optional category filter
        ...(normalizedCategory
            ? [
                {
                    $match: {
                        "issue.category": normalizedCategory,
                    },
                },
            ]
            : []),

        // Sort active projects first and paginate
        {
            $addFields: {
                statusPriority: {
                    $switch: {
                        branches: [
                            {
                                case: { $eq: ["$status", "IN_PROGRESS"] },
                                then: 1,
                            },
                            {
                                case: { $eq: ["$status", "WORK_SUBMITTED"] },
                                then: 2,
                            },
                            {
                                case: { $eq: ["$status", "REVISION_REQUIRED"] },
                                then: 3,
                            },
                            {
                                case: { $eq: ["$status", "INSPECTION_FAILED"] },
                                then: 4,
                            },
                            {
                                case: { $eq: ["$status", "PLANNED"] },
                                then: 5,
                            },
                            {
                                case: { $eq: ["$status", "COMPLETED"] },
                                then: 6,
                            },
                            {
                                case: { $eq: ["$status", "CANCELLED"] },
                                then: 7,
                            },
                        ],
                        default: 8,
                    },
                },
            },
        },

        {
            $facet: {
                projects: [
                    {
                        $sort: {
                            statusPriority: 1,
                            updatedAt: -1,
                            _id: -1,
                        },
                    },
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                    {
                        $project: {
                            _id: 1,
                            auctionId: 1,
                            selectedBidId: 1,
                            plannedDurationDays: 1,
                            plannedStartDate: 1,
                            plannedEndDate: 1,
                            status: 1,
                            completedAt: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            issue: 1,
                        },
                    },
                ],

                totalCount: [
                    {
                        $count: "total",
                    },
                ],
            },
        },
    ]);

    const projects = result[0]?.projects ?? [];
    const totalProjects = result[0]?.totalCount[0]?.total ?? 0;
    const totalPages = Math.ceil(totalProjects / limit);

    const responseData = {
        projects,

        pagination: {
            currentPage: page,
            limit,
            totalProjects,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                responseData,
                "Allocated projects fetched successfully"
            )
        );
});

export const getAllocatedProjectDetails = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { projectId } = req.params;

    if (
        typeof projectId !== "string" ||
        !mongoose.isValidObjectId(projectId)
    ) {
        throw new ApiErrors(400, "Invalid project ID");
    }

    const staffId = new mongoose.Types.ObjectId(userId.toString());
    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Redis cache key
    const cacheKey = `staff:project:${staffId}:${projectObjectId}`;

    // Check Redis
    const cachedProject = await redis.get(cacheKey);

    if (cachedProject) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(cachedProject),
                    "Project details fetched successfully"
                )
            );
    }

    // Aggregation
    const result = await Projects.aggregate([
        // Match project and verify staff ownership
        {
            $match: {
                _id: projectObjectId,
                projectStaffId: staffId,
            },
        },

        // Get issue information
        {
            $lookup: {
                from: "issues",
                let: { issueId: "$issueId" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$issueId"],
                            },
                        },
                    },

                    // Get department information
                    {
                        $lookup: {
                            from: "departments",
                            localField: "departmentId",
                            foreignField: "_id",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        name: 1,
                                        departmentCode: 1,
                                    },
                                },
                            ],
                            as: "department",
                        },
                    },

                    {
                        $unwind: {
                            path: "$department",
                            preserveNullAndEmptyArrays: true,
                        },
                    },

                    // Select required issue fields
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            description: 1,
                            category: 1,
                            district: 1,

                            address: 1,

                            "location.coordinates": 1,

                            image: {
                                $map: {
                                    input: "$image",
                                    as: "img",
                                    in: "$$img.url",
                                },
                            },

                            department: 1,
                            status: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ],
                as: "issue",
            },
        },

        {
            $unwind: "$issue",
        },

        // Get contractor information
        {
            $lookup: {
                from: "users",
                localField: "contractorId",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            email: 1,
                            phone: 1,
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

        // Get company information
        {
            $lookup: {
                from: "companies",
                localField: "companyId",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                        },
                    },
                ],
                as: "company",
            },
        },

        {
            $unwind: {
                path: "$company",
                preserveNullAndEmptyArrays: true,
            },
        },

        // Final response structure
        {
            $project: {
                _id: 1,

                contractor: 1,
                company: 1,

                plannedDurationDays: 1,
                plannedStartDate: 1,
                plannedEndDate: 1,

                status: 1,

                progressUpdates: {
                    $map: {
                        input: { $ifNull: ["$progressUpdates", []] },
                        as: "progress",
                        in: {
                            _id: "$$progress._id",
                            description: "$$progress.description",
                            image: {
                                $map: {
                                    input: "$$progress.image",
                                    as: "img",
                                    in: "$$img.url",
                                },
                            },
                            progressPercentage: "$$progress.progressPercentage",
                            workDate: "$$progress.workDate",
                            createdAt: "$$progress.createdAt",
                            updatedAt: "$$progress.updatedAt",
                        },
                    },
                },

                completionSubmission: {
                    image: {
                        $map: {
                            input: {
                                $ifNull: [
                                    "$completionSubmission.image",
                                    [],
                                ],
                            },
                            as: "img",
                            in: "$$img.url",
                        },
                    },
                    description: {
                        $ifNull: [
                            "$completionSubmission.description",
                            "",
                        ],
                    },
                    submittedAt: {
                        $ifNull: [
                            "$completionSubmission.submittedAt",
                            null,
                        ],
                    },
                },

                completedAt: 1,
                createdAt: 1,
                updatedAt: 1,

                issue: 1,
            },
        },
    ]);

    // Check project availability
    if (!result.length) {
        throw new ApiErrors(
            404,
            "Project not found or you are not authorized to access it"
        );
    }

    const project = result[0];

    // Store in Redis
    await redis.set(
        cacheKey,
        JSON.stringify(project),
        "EX", 600
    );

    // Response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                project,
                "Project details fetched successfully"
            )
        );
}
);

export const projectProgressUpdates = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { projectId } = req.body;

    if (!userId) {
        throw new ApiErrors(401, "Unauthorized user");
    }

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiErrors(400, "Invalid project ID");
    }

    // Find project
    const project = await Projects.findOne({
        _id: projectId,
        projectStaffId: userId,
    });

    if (!project) {
        throw new ApiErrors(
            404,
            "Project not found or unauthorized access"
        );
    }

    // Check project status
    if (["COMPLETED", "CANCELLED"].includes(project.status)) {
        throw new ApiErrors(
            400,
            "Cannot update progress for this project"
        );
    }

    // Extract request body
    const { description, progressPercentage } = req.body;

    // Validate description
    if (
        typeof description !== "string" ||
        !description.trim()
    ) {
        throw new ApiErrors(400, "Description is required");
    }

    if (description.trim().length > 2000) {
        throw new ApiErrors(
            400,
            "Description cannot exceed 2000 characters"
        );
    }

    const lastProgressUpdate = project.progressUpdates[project.progressUpdates.length - 1];

    if (lastProgressUpdate && lastProgressUpdate.progressPercentage > progressPercentage) {
        throw new ApiErrors(400, "New progress must be greater than previous progress");
    }

    const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files ?? {}).flat();

    // Validate uploaded images
    if (!files.length || files.length > 5) {
        throw new ApiErrors(
            400,
            "Upload between 1 and 5 images"
        );
    }

    for (const file of files) {
        if (!file.mimetype?.startsWith("image/")) {
            throw new ApiErrors(400, "Only image files are allowed");
        }
    }

    // upload multiple images
    let uploadedImages = [];

    try {
        uploadedImages = await Promise.all(
            files.map(async (file) => {
                const uploaded = (await uploadToCloudinary(
                    file.buffer,
                    "ShohorOS",
                )) as { secure_url?: string; public_id?: string };

                if (!uploaded?.secure_url || !uploaded?.public_id) {
                    throw new Error("Invalid Cloudinary upload response");
                }

                return {
                    url: uploaded.secure_url,
                    publicId: uploaded.public_id,
                };
            }),
        );
    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        throw new ApiErrors(502, "Image upload failed");
    }


    // Validate progress percentage
    const percentage = Number(progressPercentage);

    if (
        progressPercentage === undefined ||
        progressPercentage === null ||
        progressPercentage === "" ||
        !Number.isFinite(percentage) ||
        percentage < 0 ||
        percentage > 100
    ) {
        throw new ApiErrors(
            400,
            "Progress percentage must be between 0 and 100"
        );
    }

    // Create progress update
    const progressUpdate = {
        updatedBy: userId,
        description: description.trim(),
        image: uploadedImages,
        progressPercentage,
        workDate: new Date(),
    };

    // Push progress update
    const updatedProject = await Projects.findOneAndUpdate(
        {
            _id: projectId,
            projectStaffId: userId,
            status: {
                $nin: ["COMPLETED", "CANCELLED"],
            },
        },
        {
            $push: {
                progressUpdates: progressUpdate,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!updatedProject) {
        throw new ApiErrors(
            409,
            "Project status changed or project is no longer available"
        );
    }

    await Promise.all([
        redis.del(`staff:project:${userId}:${projectId}`),
        redis.del(`contractor:project:${project.contractorId}:${projectId}`)
    ])

    const notification = await Notifications.create({
        recipient: project.contractorId,
        sender: userId,
        type: NOTIFICATION_TYPES.PROJECT_PROGRESS_UPDATED,
        title: "Project Progress Updated Successfully",
        message: "Your project progress updated successfully.",
        relatedId: projectId,
        relatedModel: "Project",
    })

    const io = req.app.get('io')
    io.to(`user:${notification.recipient.toString()}`)
        .emit("updateNotification", notification);

    const responseData = {
        ...progressUpdate,
        image: progressUpdate.image.map(({ url }) => url),
        createdAt: new Date(),
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                responseData,
                "Project progress updated successfully"
            )
        );
});

export const submitProject = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { projectId } = req.body;

    if (!userId) {
        throw new ApiErrors(401, "Unauthorized user");
    }

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiErrors(400, "Invalid project ID");
    }

    // Find project
    const project = await Projects.findOne({
        _id: projectId,
        projectStaffId: userId,
    })
        .select("-auctionId -selectedBidId -companyId -plannedDurationDays -plannedStartDate -plannedEndDate")
        .populate({
            path: "issueId",
            select: "_id district"
        })

    if (!project) {
        throw new ApiErrors(
            404,
            "Project not found or unauthorized access"
        );
    }

    // Check project status
    if (project.status !== "IN_PROGRESS") {
        throw new ApiErrors(
            400,
            "Cannot submit this project"
        );
    }

    const lastProgressUpdate = project.progressUpdates[project.progressUpdates.length - 1];

    if (!lastProgressUpdate || lastProgressUpdate.progressPercentage !== 100) {
        throw new ApiErrors(400, "Project is not completed");
    }

    // Extract request body
    const { description } = req.body;

    // Validate description
    if (
        typeof description !== "string" ||
        !description.trim()
    ) {
        throw new ApiErrors(400, "Description is required");
    }

    if (description.trim().length > 2000) {
        throw new ApiErrors(
            400,
            "Description cannot exceed 2000 characters"
        );
    }

    const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files ?? {}).flat();

    // Validate uploaded images
    if (!files.length || files.length > 5) {
        throw new ApiErrors(
            400,
            "Upload between 1 and 5 images"
        );
    }

    for (const file of files) {
        if (!file.mimetype?.startsWith("image/")) {
            throw new ApiErrors(400, "Only image files are allowed");
        }
    }

    // upload multiple images
    let uploadedImages = [];

    try {
        uploadedImages = await Promise.all(
            files.map(async (file) => {
                const uploaded = (await uploadToCloudinary(
                    file.buffer,
                    "ShohorOS",
                )) as { secure_url?: string; public_id?: string };

                if (!uploaded?.secure_url || !uploaded?.public_id) {
                    throw new Error("Invalid Cloudinary upload response");
                }

                return {
                    url: uploaded.secure_url,
                    publicId: uploaded.public_id,
                };
            }),
        );
    } catch (error) {
        console.error("Cloudinary upload failed:", error);

        throw new ApiErrors(502, "Image upload failed");
    }


    const submitUpdate = {
        submittedBy: userId,
        description: description.trim(),
        image: uploadedImages,
        submittedAt: Date.now()
    };

    // Push progress update
    const submittedProject = await Projects.findOneAndUpdate(
        {
            _id: projectId,
            projectStaffId: userId,
            status: "IN_PROGRESS",
            "progressUpdates.0": { $exists: true },
            "progressUpdates.progressPercentage": 100,
        },
        {
            $set: {
                completionSubmission: submitUpdate,
                status: "WORK_SUBMITTED"
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!submittedProject) {
        throw new ApiErrors(
            409,
            "Project status changed or project is no longer available"
        );
    }

    const [, , , admins] = await Promise.all([
        redis.del(`staff:project:${userId}:${projectId}`),
        redis.del(`contractor:project:${project.contractorId}:${projectId}`),

        Issues.findByIdAndUpdate(project.issueId._id, {
            status: "AWAITING_INSPECTION"
        }),

        Users.find({
            role: "city-admin",
            district: (project.issueId as unknown as { district: string }).district,
        }).select("_id"),
    ]);

    const notifications = [
        {
            recipient: project.contractorId,
            sender: userId,
            type: NOTIFICATION_TYPES.PROJECT_COMPLETED,
            title: "Project Submitted Successfully",
            message: "Your project completion report has been submitted successfully and is awaiting inspection.",
            relatedId: projectId,
            relatedModel: "Project",
        },

        ...admins.map((admin) => ({
            recipient: admin._id,
            sender: userId,
            type: NOTIFICATION_TYPES.PROJECT_COMPLETED,
            title: "Project Submitted for Inspection",
            message: "A project has been submitted and is waiting for inspection assignment.",
            relatedId: projectId,
            relatedModel: "Project",
        }))
    ];

    const notification = await Notifications.insertMany(notifications);

    const io = req.app.get('io')
    for (const noti of notification) {
        io.to(`user:${noti.recipient.toString()}`)
            .emit("updateNotification", noti);
    }

    const responseData = {
        description: submitUpdate.description,
        image: submitUpdate.image.map(({ url }) => url),
        submittedAt: submitUpdate.submittedAt,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                responseData,
                "Project progress updated successfully"
            )
        );
});