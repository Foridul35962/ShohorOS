import AsyncHandler from "../helpers/AsyncHandler.js";
import ApiErrors from "../helpers/ApiErrors.js";
import Users from "../models/Users.model.js";
import bcrypt from "bcryptjs";
import redis from "../config/redis.js";
import crypto from "crypto";
import { generateAdminCreatedUserOTPEmail, sendBrevoMail } from "../config/mail.js";
import ApiResponse from "../helpers/ApiResponse.js";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

export const addMembers = AsyncHandler(async (req, res) => {
    const adminDistrict = req.user?.district
    const { name, email, phoneNumber, password, district, role } = req.body
    if (adminDistrict?.toString() !== district) {
        throw new ApiErrors(403, "User does not belong to your district")
    }

    const existingUser = await Users.findOne({ email })
    if (existingUser) {
        throw new ApiErrors(400, "user is already registered")
    }

    const hashPass = await bcrypt.hash(password, 12)

    const otp = crypto.randomInt(100000, 1000000).toString();

    const redisKey = `userRegistration:${email}`

    await redis.set(redisKey,
        JSON.stringify({
            name: name,
            email: email,
            password: hashPass,
            phoneNumber: phoneNumber,
            district: district,
            role: role,
            otp: otp
        }), "EX", 300
    )

    const { subject, html } = generateAdminCreatedUserOTPEmail({ userName: name, otp: otp, role: role })

    sendBrevoMail(email, subject, html)
        .then(async () => {
            const coolDownKey = `coolDownMail:${email}`
            await redis.set(coolDownKey, "1", "EX", 60)
        })
        .catch((err) => {
            console.log('mail send failed', err)
        })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "member otp send successfully")
        )
})

export const verifyMemberMail = AsyncHandler(async (req, res) => {
    const adminDistrict = req.user?.district
    const { email, otp } = req.body
    const redisKey = `userRegistration:${email}`
    const redisUser = await redis.get(redisKey)

    if (!redisUser) {
        throw new ApiErrors(404, "otp is expired")
    }

    const user = JSON.parse(redisUser)
    if (otp !== user.otp) {
        throw new ApiErrors(400, "otp is not matched")
    }

    if (adminDistrict !== user.district) {
        throw new ApiErrors(403, "User does not belong to your district")
    }

    const member = await Users.create({
        name: user.name,
        email: user.email,
        password: user.password,
        phoneNumber: user.phoneNumber,
        role: user.role,
        district: user.district
    })

    if (!member) {
        throw new ApiErrors(500, "member created failed")
    }

    Promise.all([
        redis.del(redisKey),
        redis.del(`coolDownMail:${email}`)
    ])

    return res
        .status(201)
        .json(
            new ApiResponse(201, {
                name: member.name,
                email: member.email,
                phoneNumber: member.phoneNumber,
                role: member.role
            }, "member created successfully")
        )
})

export const deleteMember = AsyncHandler(async (req, res) => {
    const adminDistrict = req.user?.district
    const { userId } = req.params
    if (!userId) {
        throw new ApiErrors(400, "user id is required")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiErrors(400, "invalid userId")
    }

    const user = await Users.findById(userId)
    if (!user) {
        throw new ApiErrors(404, "User not found")
    }

    if (user.district !== adminDistrict) {
        throw new ApiErrors(403, "User does not belong to your district")
    }

    if (user.profilePic?.publicId) {
        try {
            await cloudinary.uploader.destroy(user.profilePic.publicId)
        } catch (error) {
            throw new ApiErrors(500, "profile pic remove failed")
        }
    }

    await user.deleteOne()

    return res
        .status(200)
        .json(
            new ApiResponse(200, userId, "User deleted successfully")
        )
})

export const viewAllMembers = AsyncHandler(async (req, res) => {
    const adminDistrict = req.user?.district;

    if (!adminDistrict) {
        throw new ApiErrors(403, "Admin district is required");
    }

    const allowedRoles = [
        "moderator",
        "department-officer",
        "city-admin",
        "inspector",
    ];

    const { name, role } = req.query;

    const pageNumber = Number(req.query.page ?? 1);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
        throw new ApiErrors(400, "Invalid page number");
    }

    const page = pageNumber;
    const limit = 15;
    const skip = (page - 1) * limit;

    // Validate role only when the client provides it.
    if (role !== undefined) {
        if (
            typeof role !== "string" ||
            !allowedRoles.includes(role)
        ) {
            throw new ApiErrors(400, "Invalid role");
        }
    }

    // Base query: only members of the admin's district.
    const query: Record<string, any> = {
        district: adminDistrict,
        role: { $in: allowedRoles },
    };

    // Optional role filter.
    if (typeof role === "string") {
        query.role = role;
    }

    // Optional case-insensitive partial name search.
    if (typeof name === "string" && name.trim()) {
        const escapedName = name
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        query.name = {
            $regex: escapedName,
            $options: "i",
        };
    }

    const [users, totalUsers] = await Promise.all([
        Users.find(query)
            .select("-password -profilePic.publicId -district")
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Users.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    const finalResponse = {
        users,
        pagination: {
            totalPages,
            totalUsers,
            currentPage: page,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            finalResponse,
            "Members fetched successfully"
        )
    );
});