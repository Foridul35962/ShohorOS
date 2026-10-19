import mongoose from "mongoose";
import redis from "../config/redis.js";
import { CATEGORY, DISTRICTS } from "../constant/common.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Departments from "../models/Department.model.js";
import Issues from "../models/Issues.model.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

export const createIssue = AsyncHandler(async (req, res) => {
    const user = req.user;

    if (!user?._id || !user.district || !user.role) {
        throw new ApiErrors(401, "Unauthorized access");
    }

    if (!["citizen", "department-officer"].includes(user.role)) {
        throw new ApiErrors(403, "You are not allowed to create issues");
    }

    if (!DISTRICTS.includes(user.district)) {
        throw new ApiErrors(400, "Invalid user district");
    }

    const { title, description, category, address, location } = req.body;
    const files = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files ?? {}).flat();

    // Validate uploaded images
    if (!files?.length) {
        throw new ApiErrors(400, "At least one image is required");
    }

    for (const file of files) {
        if (!file.mimetype?.startsWith("image/")) {
            throw new ApiErrors(400, "Only image files are allowed");
        }
    }

    const lat = Number(location.lat);
    const lon = Number(location.lon);

    const activeStatuses = [
        "REPORTED",
        "UNDER_REVIEW",
        "APPROVED",
        "PROJECT_CREATED",
        "IN_PROGRESS",
        "AWAITING_INSPECTION",
        "REVISION_REQUIRED",
    ] as const;

    const existingIssue = await Issues.findOne({
        category,
        district: user.district,
        status: { $in: activeStatuses },
        location: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [lon, lat],
                },
                $maxDistance: 50,
            },
        },
    }).select(
        "_id title description category district status location address image projectId createdAt updatedAt",
    );

    if (existingIssue) {
        const issue = existingIssue.toObject();
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        issue: {
                            ...issue,
                            image: issue.image.map(({ url }) => ({ url })),
                        },
                        isDuplicate: true,
                    },
                    "A similar issue has already been reported",
                ),
            );
    }

    // Get department from Redis or MongoDB
    const redisDepartmentKey = `departmentCode:${category}`;
    let department = null;

    const cachedDepartment = await redis.get(redisDepartmentKey);

    if (cachedDepartment) {
        try {
            department = JSON.parse(cachedDepartment);
        } catch {
            await redis.del(redisDepartmentKey);
        }
    }

    if (!department) {
        department = await Departments.findOne({
            code: category,
        }).lean();

        if (!department) {
            throw new ApiErrors(404, "Department not found");
        }

        await redis.set(
            redisDepartmentKey,
            JSON.stringify(department),
            "EX",
            1800,
        );
    }

    // Upload multiple images
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

    // Create issue
    const issue = await Issues.create({
        title,
        description,
        category,
        address,
        location: {
            type: "Point",
            coordinates: [lon, lat],
        },
        district: user.district,
        reportedBy: user._id,
        departmentId: department._id,
        status: "REPORTED",
        image: uploadedImages,
    })

    const {
        reportedBy: _reportedBy,
        departmentId: _departmentId,
        ...issueResponse
    } = issue.toObject();

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {
                    issue: {
                        ...issueResponse,
                        image: issueResponse.image.map(({ url }) => ({ url })),
                    },
                    isDuplicate: false,
                },
                "Issue created successfully",
            ),
        );
});

export const getIssueForPublic = AsyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const userDistrict = req.user?.district;
    const userRole = req.user?.role;

    if (!userDistrict || !userRole) {
        throw new ApiErrors(401, "Unauthorized access");
    }

    if (!issueId) {
        throw new ApiErrors(400, "Issue ID is required");
    }

    if (!mongoose.isValidObjectId(issueId)) {
        throw new ApiErrors(400, "Invalid issue ID");
    }

    const redisKey = `issue:public:${issueId}`;

    let issue = null;

    const redisIssue = await redis.get(redisKey);

    if (redisIssue) {
        issue = JSON.parse(redisIssue);
    } else {
        issue = await Issues.findById(issueId)
            .select(
                "-location.type -image.publicId -reportedBy -departmentId",
            )
            .populate({
                path: "projectId",
                select: "completionSubmission.image.url",
            })
            .lean();

        if (!issue) {
            throw new ApiErrors(404, "Issue not found");
        }

        await redis.set(
            redisKey,
            JSON.stringify(issue),
            "EX",
            1800,
        );
    }

    if (!issue) {
        throw new ApiErrors(404, "Issue not found");
    }

    if (issue.district !== userDistrict) {
        throw new ApiErrors(403, "Access denied");
    }

    // Only moderators can see priority
    if (userRole !== "moderator") {
        issue.priority = null;
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                issue,
                "Issue fetched successfully",
            ),
        );
});

export const getAllIssue = AsyncHandler(async (req, res) => {
    const userDistrict = req.user?.district
    const userRole = req.user?.role
    const userId = req.user?._id
    const page = Number(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    const { category, status, priority, myIssue } = req.query

    if (!userDistrict || !userRole || !userId) {
        throw new ApiErrors(401, "user is unauthorized")
    }

    if (priority && !["department-officer", "city-admin"].includes(userRole)) {
        throw new ApiErrors(401, "user is unauthorized")
    }

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiErrors(400, "Invalid page number");
    }

    if (category !== undefined && typeof category !== "string") {
        throw new ApiErrors(400, "Invalid category");
    }

    const normalizedCategory = category?.trim().toUpperCase();

    if (normalizedCategory && !CATEGORY.includes(normalizedCategory)) {
        throw new ApiErrors(400, "Invalid category");
    }

    type IssueCategory = "ROAD" | "DRAIN" | "WATER" | "ELEC" | "WASTE" | "BUILDING" | "PARK" | "TRAFFIC";

    if (status !== undefined && typeof status !== "string") {
        throw new ApiErrors(400, "Invalid status");
    }

    type IssueStatus = "REPORTED" |
        "UNDER_REVIEW" |
        "REJECTED" |
        "APPROVED" |
        "PROJECT_CREATED" |
        "IN_PROGRESS" |
        "AWAITING_INSPECTION" |
        "REVISION_REQUIRED" |
        "RESOLVED" |
        "CANCELLED";

    const normalizedStatus = status?.trim().toUpperCase();

    if (normalizedStatus && ![
        "REPORTED",
        "UNDER_REVIEW",
        "REJECTED",
        "APPROVED",
        "PROJECT_CREATED",
        "IN_PROGRESS",
        "AWAITING_INSPECTION",
        "REVISION_REQUIRED",
        "RESOLVED",
        "CANCELLED",
    ].includes(normalizedStatus)) {
        throw new ApiErrors(400, "Invalid status");
    }

    const query: { district: string; category?: IssueCategory; status?: IssueStatus, priority?: 1 | 2 | 3 | 4 | 5; reportedBy?: string } = {
        district: userDistrict,
    }

    if (normalizedCategory) {
        query.category = normalizedCategory as IssueCategory;
    }

    if (normalizedStatus) {
        query.status = normalizedStatus as IssueStatus
    }

    if (priority) {
        if (typeof priority !== "string" || !["1", "2", "3", "4", "5"].includes(priority)) {
            throw new ApiErrors(400, "Invalid priority");
        }

        query.priority = Number(priority) as 1 | 2 | 3 | 4 | 5;
    }

    if (myIssue) {
        query.reportedBy = userId
    }

    const [issues, totalIssues] = await Promise.all([
        Issues.find(query)
            .select("title category address createdAt status")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 }),

        Issues.countDocuments(query)
    ])

    const totalPages = Math.ceil(totalIssues / limit);

    const finalResponse = {
        issues,
        pagination: {
            totalPages,
            totalIssues,
            currentPage: page,
            limit
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalResponse, "all issues fetch successfully")
        )
})