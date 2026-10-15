import redis from "../config/redis.js";
import { DISTRICTS } from "../constant/common.js";
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
    }).select("_id title category district status location address");

    if (existingIssue) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        issue: existingIssue,
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
                    issue: issueResponse,
                    isDuplicate: false,
                },
                "Issue created successfully",
            ),
        );
});