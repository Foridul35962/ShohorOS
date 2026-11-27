import mongoose from "mongoose";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Issues from "../models/Issues.model.js";
import ApiResponse from "../helpers/ApiResponse.js";
import redis from "../config/redis.js";

export const citizenDashboard = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const userDistrict = req.user?.district;
    const userRole = req.user?.role

    if (!userId || !userDistrict || !userRole) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    if (userRole !== "citizen") {
        throw new ApiErrors(403, "Access denied");
    }

    const citizenId = new mongoose.Types.ObjectId(
        userId.toString()
    );

    const redisKey = `dashboard:${userId}`
    const redisDashboard = await redis.get(redisKey)
    if (redisDashboard) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    JSON.parse(redisDashboard),
                    "Citizen dashboard fetched successfully"
                )
            );
    }

    const dashboard = await Issues.aggregate([
        // Only logged-in citizen's issues
        {
            $match: {
                reportedBy: citizenId,
                district: userDistrict
            }
        },

        {
            $facet: {

                // 1. Dashboard statistics
                statistics: [
                    {
                        $group: {
                            _id: null,

                            totalIssues: {
                                $sum: 1
                            },

                            pendingIssues: {
                                $sum: {
                                    $cond: [
                                        {
                                            $in: [
                                                "$status",
                                                [
                                                    "REPORTED",
                                                    "UNDER_REVIEW",
                                                    "APPROVED",
                                                    "PROJECT_CREATED"
                                                ]
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },

                            inProgressIssues: {
                                $sum: {
                                    $cond: [
                                        {
                                            $in: [
                                                "$status",
                                                [
                                                    "IN_PROGRESS",
                                                    "AWAITING_INSPECTION",
                                                    "REVISION_REQUIRED"
                                                ]
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },

                            resolvedIssues: {
                                $sum: {
                                    $cond: [
                                        {
                                            $eq: [
                                                "$status",
                                                "RESOLVED"
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            },

                            rejectedIssues: {
                                $sum: {
                                    $cond: [
                                        {
                                            $in: [
                                                "$status",
                                                [
                                                    "REJECTED",
                                                    "CANCELLED"
                                                ]
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    },

                    {
                        $project: {
                            _id: 0,
                            totalIssues: 1,
                            pendingIssues: 1,
                            inProgressIssues: 1,
                            resolvedIssues: 1,
                            rejectedIssues: 1
                        }
                    }
                ],

                // 2. Recent issues
                recentIssues: [
                    {
                        $sort: {
                            createdAt: -1
                        }
                    },

                    {
                        $limit: 5
                    },

                    // Department information
                    {
                        $lookup: {
                            from: "departments",
                            localField: "departmentId",
                            foreignField: "_id",
                            pipeline: [
                                {
                                    $project: {
                                        name: 1,
                                        code: 1
                                    }
                                }
                            ],
                            as: "department"
                        }
                    },

                    {
                        $unwind: {
                            path: "$department",
                            preserveNullAndEmptyArrays: true
                        }
                    },

                    // Related project
                    {
                        $lookup: {
                            from: "projects",
                            let: {
                                projectId: "$projectId"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $ne: [
                                                        "$$projectId",
                                                        null
                                                    ]
                                                },
                                                {
                                                    $eq: [
                                                        "$_id",
                                                        "$$projectId"
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                },

                                {
                                    $project: {
                                        status: 1,
                                        plannedStartDate: 1,
                                        plannedEndDate: 1,
                                        completedAt: 1,

                                        // Latest 3 progress updates
                                        progressUpdates: {
                                            $slice: [
                                                "$progressUpdates",
                                                -3
                                            ]
                                        },

                                        completionSubmission: {
                                            description: 1,
                                            submittedAt: 1,
                                            image: 1
                                        }
                                    }
                                }
                            ],
                            as: "project"
                        }
                    },

                    {
                        $unwind: {
                            path: "$project",
                            preserveNullAndEmptyArrays: true
                        }
                    },

                    // Prepare public project information
                    {
                        $addFields: {
                            "project.currentProgress": {
                                $cond: [
                                    {
                                        $eq: [
                                            "$project.status",
                                            "COMPLETED"
                                        ]
                                    },
                                    100,
                                    {
                                        $ifNull: [
                                            {
                                                $arrayElemAt: [
                                                    "$project.progressUpdates.progressPercentage",
                                                    -1
                                                ]
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    },

                    // Final response projection
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            description: 1,
                            category: 1,
                            status: 1,
                            district: 1,
                            address: 1,
                            image: {
                                $map: {
                                    input: "$image",
                                    as: "img",
                                    in: {
                                        url: "$$img.url"
                                    }
                                }
                            },
                            createdAt: 1,
                            updatedAt: 1,

                            department: 1,

                            project: {
                                $cond: [
                                    {
                                        $ne: [
                                            "$project",
                                            null
                                        ]
                                    },
                                    {
                                        _id: "$project._id",
                                        status: "$project.status",
                                        currentProgress: "$project.currentProgress",
                                        plannedStartDate: "$project.plannedStartDate",
                                        plannedEndDate: "$project.plannedEndDate",
                                        completedAt: "$project.completedAt",

                                        progressUpdates: {
                                            $map: {
                                                input: {
                                                    $ifNull: [
                                                        "$project.progressUpdates",
                                                        []
                                                    ]
                                                },
                                                as: "update",
                                                in: {
                                                    description: "$$update.description",
                                                    progressPercentage: "$$update.progressPercentage",
                                                    workDate: "$$update.workDate",
                                                    image: {
                                                        $map: {
                                                            input: "$$update.image",
                                                            as: "img",
                                                            in: {
                                                                url: "$$img.url"
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },

                                        completionSubmission: {
                                            description: "$project.completionSubmission.description",
                                            submittedAt: "$project.completionSubmission.submittedAt",
                                            image: {
                                                $map: {
                                                    input: {
                                                        $ifNull: [
                                                            "$project.completionSubmission.image",
                                                            []
                                                        ]
                                                    },
                                                    as: "img",
                                                    in: {
                                                        url: "$$img.url"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    null
                                ]
                            }
                        }
                    }
                ]
            }
        },

        // Default statistics when citizen has no issues
        {
            $project: {
                _id: 0,

                statistics: {
                    $ifNull: [
                        {
                            $arrayElemAt: [
                                "$statistics",
                                0
                            ]
                        },
                        {
                            totalIssues: 0,
                            pendingIssues: 0,
                            inProgressIssues: 0,
                            resolvedIssues: 0,
                            rejectedIssues: 0
                        }
                    ]
                },

                recentIssues: 1
            }
        }
    ]);

    const result = dashboard[0];

    await redis.set(redisKey, JSON.stringify(result), "EX", 600)

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Citizen dashboard fetched successfully"
        )
    );
});