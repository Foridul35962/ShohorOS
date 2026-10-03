import mongoose from "mongoose"
import { generateApplicationAcceptedEmail, generateApplicationRejectedEmail, sendBrevoMail } from "../config/mail.js"
import ApiErrors from "../helpers/ApiErrors.js"
import ApiResponse from "../helpers/ApiResponse.js"
import AsyncHandler from "../helpers/AsyncHandler.js"
import RequestUsers from "../models/RequestUsers.model.js"
import Users from "../models/Users.model.js"
import RequestCompany from "../models/RequestCompany.model.js"

export const viewAllRequestCitizen = AsyncHandler(async (req, res) => {
    const moderatorDistrict = req.user?.district
    const page = Number(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        RequestUsers.find(moderatorDistrict ? { district: moderatorDistrict } : {})
            .select("-password -role")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 }),

        RequestUsers.countDocuments()
    ])

    const totalPages = Math.ceil(totalUsers / limit);

    const finalResponse = {
        users,
        pagination: {
            totalPages,
            totalUsers,
            currentPage: page,
            limit
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalResponse, "requested user fetch successfully")
        )
})

export const acceptCitizen = AsyncHandler(async (req, res) => {
    const moderatorDistrict = req.user?.district
    const { userId } = req.body
    
    if (!moderatorDistrict) {
        throw new ApiErrors(403, "moderator district is required")
    }
    if (!userId) {
        throw new ApiErrors(400, "userId is required")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiErrors(400, "invalid userId")
    }

    const query = {
        _id: userId,
        district: moderatorDistrict
    }

    const requestUser = await RequestUsers.findOne(query)
    if (!requestUser) {
        throw new ApiErrors(404, "User not found")
    }

    const user = await Users.create({
        email: requestUser.email,
        password: requestUser.password,
        role: "citizen",
        name: requestUser.name,
        district: requestUser.district,
        phoneNumber: requestUser.phoneNumber,
    })

    if (!user) {
        throw new ApiErrors(500, "user created failed")
    }

    await requestUser.deleteOne()

    const { subject, html } = generateApplicationAcceptedEmail(user.name);

    sendBrevoMail(user.email, subject, html)
        .catch(() => {
            console.log('mail send failed')
        })

    return res
        .status(201)
        .json(
            new ApiResponse(201, userId, "user created successfully")
        )
})

export const rejectCitizen = AsyncHandler(async (req, res) => {
    const moderatorDistrict = req.user?.district
    const { userId, reason } = req.body

    if (!moderatorDistrict) {
        throw new ApiErrors(403, "moderator district is required")
    }

    if (!userId || !reason) {
        throw new ApiErrors(400, "all field are required")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiErrors(400, "invalid userId")
    }

    const query = {
        _id: userId,
        district: moderatorDistrict
    }

    const user = await RequestUsers.findOneAndDelete(query)
    if (!user) {
        throw new ApiErrors(404, "User not found")
    }

    const { subject, html } = generateApplicationRejectedEmail(user.name, reason);

    sendBrevoMail(user.email, subject, html)
        .catch(() => {
            console.log('mail send failed')
        })

    return res
        .status(200)
        .json(
            new ApiResponse(200, userId, "user rejected successfully")
        )
})

export const viewAllRequestedContractor = AsyncHandler(async(req, res)=>{
    const moderatorDistrict = req.user?.district
    const page = Number(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
        RequestCompany.find(moderatorDistrict ? { "address.district": moderatorDistrict } : {})
            .select("-password")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 }),

        RequestCompany.countDocuments()
    ])

    const totalPages = Math.ceil(totalUsers / limit);

    const finalResponse = {
        users,
        pagination: {
            totalPages,
            totalUsers,
            currentPage: page,
            limit
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalResponse, "requested company and constractor fetch successfully")
        )
})