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