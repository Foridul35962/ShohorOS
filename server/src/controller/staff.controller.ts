import mongoose from "mongoose";
import { CATEGORY } from "../constant/common.js";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import redis from "../config/redis.js";
import ApiResponse from "../helpers/ApiResponse.js";
import Projects from "../models/Project.model.js";

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

                issueId: 1,
                auctionId: 1,
                selectedBidId: 1,

                contractorId: 1,
                contractor: 1,

                companyId: 1,
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