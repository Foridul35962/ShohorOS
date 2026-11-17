import mongoose from "mongoose";
import { CATEGORY } from "../constant/common.js";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Inspections from "../models/Inspection.model.js";
import ApiResponse from "../helpers/ApiResponse.js";
import redis from "../config/redis.js";
import Projects from "../models/Project.model.js";
import Issues from "../models/Issues.model.js";
import Users from "../models/Users.model.js";

export const getAllocatedProject = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { category, reviewed } = req.query;

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

    if (
        reviewed !== undefined &&
        reviewed !== "true" &&
        reviewed !== "false"
    ) {
        throw new ApiErrors(400, "Invalid reviewed value");
    }

    const inspectorId = new mongoose.Types.ObjectId(userId.toString());
    const skip = (page - 1) * limit;

    const pipeline: mongoose.PipelineStage[] = [
        {
            $match: {
                inspectorId
            }
        },

        // Get project information
        {
            $lookup: {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project"
            }
        },
        {
            $unwind: "$project"
        },

        // Get related issue
        {
            $lookup: {
                from: "issues",
                localField: "project.issueId",
                foreignField: "_id",
                as: "issue"
            }
        },
        {
            $unwind: "$issue"
        },

        // Filter by category
        ...(normalizedCategory
            ? [
                {
                    $match: {
                        "issue.category": normalizedCategory
                    }
                }
            ]
            : []),

        // Find latest inspection with a result
        {
            $lookup: {
                from: "inspections",
                let: {
                    projectId: "$projectId",
                    inspectorId: "$inspectorId"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$projectId", "$$projectId"] },
                                    { $eq: ["$inspectorId", "$$inspectorId"] },
                                    { $ne: ["$result", null] }
                                ]
                            }
                        }
                    },
                    {
                        $sort: {
                            visitDate: -1
                        }
                    },
                    {
                        $limit: 1
                    },
                    {
                        $project: {
                            findings: 1,
                            image: 1,
                            result: 1,
                            correctionNote: 1,
                            reinspectionRequired: 1,
                            visitDate: 1
                        }
                    }
                ],
                as: "inspection"
            }
        },

        // Convert inspection array into object
        {
            $set: {
                inspection: {
                    $arrayElemAt: ["$inspection", 0]
                }
            }
        },

        // Filter by reviewed status
        ...(reviewed === "true"
            ? [
                {
                    $match: {
                        "inspection.result": { $exists: true }
                    }
                }
            ]
            : reviewed === "false"
                ? [
                    {
                        $match: {
                            inspection: null
                        }
                    }
                ]
                : []),

        // Return required fields only
        {
            $project: {
                _id: 1,
                projectId: 1,
                inspectorId: 1,
                visitDate: 1,

                project: 1,

                issue: {
                    _id: "$issue._id",
                    title: "$issue.title",
                    category: "$issue.category",
                    description: "$issue.description",
                    address: "$issue.address",
                    district: "$issue.district",
                    image: "$issue.image",
                    status: "$issue.status"
                },

                inspection: {
                    $ifNull: ["$inspection", null]
                }
            }
        },

        // Pagination and total count
        {
            $facet: {
                data: [
                    { $sort: { visitDate: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ],
                totalCount: [
                    { $count: "total" }
                ]
            }
        }
    ];

    const [result] = await Inspections.aggregate(pipeline);

    const projects = result?.data ?? [];
    const total = result?.totalCount?.[0]?.total ?? 0;

    const finalResponse = {
        projects,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                finalResponse,
                "Allocated projects fetched successfully"
            )
        );
});

export const getAllocatedProjectDetails = AsyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user?._id;

    if (
        typeof projectId !== "string" ||
        !mongoose.isValidObjectId(projectId)
    ) {
        throw new ApiErrors(400, "Invalid project ID");
    }

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId);
    const inspectorId = new mongoose.Types.ObjectId(userId.toString());

    //  Verify project ownership before accessing Redis cache
    const isAllocated = await Inspections.exists({
        projectId: projectObjectId,
        inspectorId
    });

    if (!isAllocated) {
        throw new ApiErrors(404, "Project not found");
    }

    // Check Redis cache
    const redisKey = `inspector:${userId}:project:${projectId}`;
    const redisProject = await redis.get(redisKey);

    if (redisProject) {
        const projectDatas = JSON.parse(redisProject);
        const { inspections = [], ...projectData } = projectDatas;

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    project: projectData,
                    inspections,
                    totalInspections: inspections.length
                },
                "Project monitoring details fetched successfully"
            )
        );
    }

    // Fetch project details
    const [project] = await Projects.aggregate([
        {
            $match: {
                _id: projectObjectId,
                inspectorId
            }
        },

        // Issue details
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
                            status: 1
                        }
                    }
                ],
                as: "issue"
            }
        },
        {
            $unwind: "$issue"
        },

        // Contractor details
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
                            phoneNumber: 1
                        }
                    }
                ],
                as: "contractor"
            }
        },
        {
            $unwind: {
                path: "$contractor",
                preserveNullAndEmptyArrays: true
            }
        },

        // Inspection history
        {
            $lookup: {
                from: Inspections.collection.name,
                localField: "_id",
                foreignField: "projectId",
                pipeline: [
                    // Inspector details
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
                                        phoneNumber: 1
                                    }
                                }
                            ],
                            as: "inspector"
                        }
                    },
                    {
                        $unwind: {
                            path: "$inspector",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $sort: {
                            visitDate: -1
                        }
                    },
                    {
                        $project: {
                            "image.publicId": 0
                        }
                    }
                ],
                as: "inspections"
            }
        },

        // Remove unnecessary public IDs
        {
            $project: {
                "issue.image.publicId": 0,
                "progressUpdates.image.publicId": 0,
                "completionSubmission.image.publicId": 0
            }
        }
    ]);

    if (!project) {
        throw new ApiErrors(404, "Project not found");
    }

    // Cache result
    await redis.set(
        redisKey,
        JSON.stringify(project),
        "EX",
        600
    );

    // Response
    const { inspections = [], ...projectData } = project;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                project: projectData,
                inspections,
                totalInspections: inspections.length
            },
            "Project monitoring details fetched successfully"
        )
    );
});