import mongoose from "mongoose";
import { CATEGORY, PROJECT_STATUS } from "../constant/common.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Issues from "../models/Issues.model.js";
import Projects from "../models/Project.model.js";
import redis from "../config/redis.js";
import Users from "../models/Users.model.js";
import Notifications from "../models/Notification.model.js";
import { NOTIFICATION_TYPES } from "../constant/notification.types.js";

export const getAllMyProjects = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { category, projectStatus } = req.query;

    const page = Number(req.query.page ?? 1);
    const limit = 15;

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiErrors(400, "Invalid page number");
    }

    if (category !== undefined && typeof category !== "string") {
        throw new ApiErrors(400, "Invalid category");
    }

    if (
        projectStatus !== undefined &&
        typeof projectStatus !== "string"
    ) {
        throw new ApiErrors(400, "Invalid project status");
    }

    const normalizedCategory = category?.trim().toUpperCase();
    const normalizedProjectStatus = projectStatus
        ?.trim()
        .toUpperCase();

    if (
        normalizedCategory &&
        !CATEGORY.includes(normalizedCategory as (typeof CATEGORY)[number])
    ) {
        throw new ApiErrors(400, "Invalid category");
    }

    if (
        normalizedProjectStatus &&
        !PROJECT_STATUS.includes(
            normalizedProjectStatus as (typeof PROJECT_STATUS)[number]
        )
    ) {
        throw new ApiErrors(400, "Invalid project status");
    }

    const matchQuery: Record<string, unknown> = {
        contractorId: userId,
    };

    if (normalizedProjectStatus) {
        matchQuery.status = normalizedProjectStatus;
    }

    const skip = (page - 1) * limit;

    const result = await Projects.aggregate([
        //Only this contractor's projects
        {
            $match: matchQuery,
        },

        // Join issue details
        {
            $lookup: {
                from: Issues.collection.name,
                localField: "issueId",
                foreignField: "_id",
                as: "issue",
            },
        },

        // Each project should have its issue
        {
            $unwind: "$issue",
        },

        // Optional issue category filter
        ...(normalizedCategory
            ? [
                {
                    $match: {
                        "issue.category": normalizedCategory,
                    },
                },
            ]
            : []),

        // Paginated data and total count
        {
            $facet: {
                projects: [
                    {
                        $sort: {
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

                            issue: {
                                _id: "$issue._id",
                                title: "$issue.title",
                                category: "$issue.category",
                                district: "$issue.district",
                                address: "$issue.address",
                                status: "$issue.status",
                            },
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

    const finalResponse = {
        projects,
        pagination: {
            currentPage: page,
            limit,
            totalProjects,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1 && totalPages > 0,
        },
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, finalResponse, "Projects fetched successfully",
            )
        );
});

export const getProject = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { projectId } = req.params;

    if (!projectId || typeof projectId !== "string") {
        throw new ApiErrors(400, "Project ID is required");
    }

    if (!mongoose.isValidObjectId(projectId)) {
        throw new ApiErrors(400, "Invalid project ID");
    }

    const contractorId = new mongoose.Types.ObjectId(
        userId.toString()
    );

    const projectObjectId = new mongoose.Types.ObjectId(projectId);

    // Contractor-specific cache key
    const redisKey = `contractor:project:${contractorId}:${projectId}`;

    // 1. Check Redis cache
    const cachedProject = await redis.get(redisKey);

    if (cachedProject) {
        return res.status(200).json(
            new ApiResponse(
                200,
                JSON.parse(cachedProject),
                "Project fetched successfully"
            )
        );
    }

    // 2. Aggregate project and related issue/staff details
    const [project] = await Projects.aggregate([
        {
            $match: {
                _id: projectObjectId,
                contractorId,
            },
        },

        // Get related issue
        {
            $lookup: {
                from: Issues.collection.name,
                localField: "issueId",
                foreignField: "_id",
                as: "issue",
            },
        },
        {
            $unwind: {
                path: "$issue",
                preserveNullAndEmptyArrays: false,
            },
        },

        // Get assigned project staff's name and email only
        {
            $lookup: {
                from: Users.collection.name,
                let: {
                    staffId: "$projectStaffId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$staffId"],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            email: 1,
                        },
                    },
                ],
                as: "projectStaff",
            },
        },
        {
            $unwind: {
                path: "$projectStaff",
                preserveNullAndEmptyArrays: true,
            },
        },

        // Return only the required fields
        {
            $project: {
                _id: 1,
                plannedDurationDays: 1,
                plannedStartDate: 1,
                plannedEndDate: 1,
                status: 1,
                completedAt: 1,
                createdAt: 1,
                updatedAt: 1,

                // Assigned staff
                projectStaff: {
                    $cond: [
                        {
                            $ifNull: ["$projectStaff._id", false],
                        },
                        {
                            _id: "$projectStaff._id",
                            name: "$projectStaff.name",
                            email: "$projectStaff.email",
                        },
                        null,
                    ],
                },

                // Project progress history
                progressUpdates: {
                    $map: {
                        input: { $ifNull: ["$progressUpdates", []] },
                        as: "progress",
                        in: {
                            _id: "$$progress._id",
                            updatedBy: "$$progress.updatedBy",
                            description: "$$progress.description",
                            image: {
                                $map: {
                                    input: {
                                        $ifNull: ["$$progress.image", []],
                                    },
                                    as: "img",
                                    in: "$$img.url",
                                },
                            },
                            progressPercentage: "$$progress.progressPercentage",
                            workDate: "$$progress.workDate",
                            createdAt: "$$progress.createdAt",
                        },
                    },
                },

                // Contractor's final submission
                completionSubmission: {
                    $let: {
                        vars: {
                            submission: {
                                $ifNull: ["$completionSubmission", {}],
                            },
                        },
                        in: {
                            image: {
                                $map: {
                                    input: {
                                        $ifNull: ["$$submission.image", []],
                                    },
                                    as: "img",
                                    in: "$$img.url",
                                },
                            },
                            description: {
                                $ifNull: ["$$submission.description", ""],
                            },
                            submittedBy: "$$submission.submittedBy",
                            submittedAt: "$$submission.submittedAt",
                        },
                    },
                },

                // Issue details
                issue: {
                    _id: "$issue._id",
                    title: "$issue.title",
                    description: "$issue.description",
                    category: "$issue.category",
                    district: "$issue.district",
                    address: "$issue.address",
                    status: "$issue.status",

                    // URLs only, not publicId
                    image: {
                        $map: {
                            input: { $ifNull: ["$issue.image", []] },
                            as: "img",
                            in: "$$img.url",
                        },
                    },
                },
            },
        },
    ]);

    if (!project) {
        throw new ApiErrors(404, "Project not found");
    }

    await redis.set(
        redisKey,
        JSON.stringify(project),
        "EX",
        600
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            project,
            "Project fetched successfully"
        )
    );
});

export const startProject = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { projectId, staffId, startDate } = req.body;

    if (!projectId || !staffId || !startDate) {
        throw new ApiErrors(400, "All fields are required");
    }

    if (
        !mongoose.isValidObjectId(projectId) ||
        !mongoose.isValidObjectId(staffId)
    ) {
        throw new ApiErrors(400, "Invalid project ID or staff ID");
    }

    // Validate start date
    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
        throw new ApiErrors(400, "Invalid start date");
    }

    const now = Date.now();
    const maxStartTime = now + 3 * 24 * 60 * 60 * 1000;
    const startTime = parsedStartDate.getTime();

    if (startTime < now || startTime > maxStartTime) {
        throw new ApiErrors(
            400,
            "Start date must be between now and the next 3 days"
        );
    }

    const [project, staff, existingProject, contractor] = await Promise.all([
        Projects.findOne({
            _id: projectId,
            contractorId: userId,
        }),

        Users.findOne({
            _id: staffId,
            role: "project-staff"
        }).select("_id name email companyId"),

        Projects.findOne({
            projectStaffId: staffId,
            status: { $ne: "COMPLETED" },
        }).select("_id"),

        Users.findById(userId)
            .select("companyId")
    ]);

    if (!project) {
        throw new ApiErrors(404, "Project not found");
    }

    if (!staff) {
        throw new ApiErrors(
            404,
            "Project staff not found in your company"
        );
    }

    if (project.projectStaffId) {
        throw new ApiErrors(
            400,
            "A staff member is already assigned to this project"
        );
    }

    if (existingProject) {
        throw new ApiErrors(
            400,
            "Staff is already assigned to another project"
        );
    }

    if (!contractor) {
        throw new ApiErrors(401, "user is not unauthorized")
    }

    if (contractor.companyId !== staff.companyId) {
        throw new ApiErrors(400, "staff in not belong to this company")
    }

    project.projectStaffId = staff._id;
    project.plannedStartDate = parsedStartDate;

    await project.save();

    // Invalidate the cached project
    await redis.del(
        `contractor:project:${userId}:${projectId}`
    );

    const notification = await Notifications.create({
        recipient: staff._id,
        sender: userId,
        type: NOTIFICATION_TYPES.PROJECT_STARTED,
        title: "Project Assignment",
        message: "You have been assigned to a project",
        relatedId: project._id,
        relatedModel: "Project",
    });

    const io = req.app.get("io");

    io.to(`user:${staff._id.toString()}`).emit(
        "updateNotification",
        notification
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                projectId: project._id,
                staff,
                startDate: project.plannedStartDate,
            },
            "Project started successfully"
        )
    );
});