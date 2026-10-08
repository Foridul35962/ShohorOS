import mongoose from "mongoose"
import {
    generateApplicationAcceptedEmail,
    generateApplicationRejectedEmail,
    generateContractorAcceptedEmail,
    generatedContractorRejectionEmailTemplate,
    sendBrevoMail
} from "../config/mail.js"
import ApiErrors from "../helpers/ApiErrors.js"
import ApiResponse from "../helpers/ApiResponse.js"
import AsyncHandler from "../helpers/AsyncHandler.js"
import RequestUsers from "../models/RequestUsers.model.js"
import Users from "../models/Users.model.js"
import RequestCompany from "../models/RequestCompany.model.js"
import Company from "../models/Company.model.js"

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
    const { requestId } = req.body

    if (!moderatorDistrict) {
        throw new ApiErrors(403, "moderator district is required")
    }
    if (!requestId) {
        throw new ApiErrors(400, "requestId is required")
    }

    if (!mongoose.isValidObjectId(requestId)) {
        throw new ApiErrors(400, "invalid requestId")
    }

    const query = {
        _id: requestId,
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
            new ApiResponse(201, requestId, "user created successfully")
        )
})

export const rejectCitizen = AsyncHandler(async (req, res) => {
    const moderatorDistrict = req.user?.district
    const { requestId, reason } = req.body

    if (!moderatorDistrict) {
        throw new ApiErrors(403, "moderator district is required")
    }

    if (!requestId || !reason) {
        throw new ApiErrors(400, "all field are required")
    }

    if (!mongoose.isValidObjectId(requestId)) {
        throw new ApiErrors(400, "invalid requestId")
    }

    const query = {
        _id: requestId,
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
            new ApiResponse(200, requestId, "user rejected successfully")
        )
})

export const viewAllRequestedContractor = AsyncHandler(async (req, res) => {
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

export const acceptContractor = AsyncHandler(async (req, res) => {
    const { requestId } = req.body
    const moderatorDistrict = req.user?.district

    if (!requestId) {
        throw new ApiErrors(400, "requestId is required")
    }

    if (!mongoose.isValidObjectId(requestId)) {
        throw new ApiErrors(400, "invalid requestId")
    }

    const company = await RequestCompany.findById(requestId)
    if (!company) {
        throw new ApiErrors(404, "company is not found")
    }

    if (company.address?.district !== moderatorDistrict) {
        throw new ApiErrors(403, "User does not belong to your district")
    }

    const district = company.address?.district
    if (!district) {
        throw new ApiErrors(400, "districts is required")
    }

    const address = company.address
    if (!address) {
        throw new ApiErrors(400, "address is required")
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const usersId = new mongoose.Types.ObjectId()
        const companyId = new mongoose.Types.ObjectId()

        const [[user], [companies]] = await Promise.all([
            Users.create([{
                _id: usersId,
                name: company.name,
                email: company.email,
                phoneNumber: company.phoneNumber,
                password: company.password,
                companyId: companyId,
                district: district,
                role: "contractor"
            }],
                { session }
            ),

            Company.create([{
                companyName: company.companyName,
                registrationNumber: company.registrationNumber,
                address: address,
                ...(company.description != null && {
                    description: company.description
                }),
                owner: usersId
            }],
                { session }
            ),
        ])

        if (!user) {
            throw new ApiErrors(500, "user created failed")
        }

        if (!companies) {
            throw new ApiErrors(500, "company created failed")
        }

        await company.deleteOne(
            { session }
        )

        await session.commitTransaction()
        session.endSession()

        const { subject, html } = generateContractorAcceptedEmail({ companyName: company.companyName, userName: company.name })
        sendBrevoMail(company.email, subject, html)
            .catch((err) => {
                console.log("mail send failed", err)
            })

        return res
            .status(201)
            .json(
                new ApiResponse(201, {}, "constractor created successfully")
            )
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error
    }
})

export const rejectContractor = AsyncHandler(async (req, res) => {
    const moderatorDistrict = req.user?.district
    const { requestId, reason } = req.body

    if (!moderatorDistrict) {
        throw new ApiErrors(403, "moderator district is required")
    }

    if (!requestId || !reason) {
        throw new ApiErrors(400, "all field are required")
    }

    if (!mongoose.isValidObjectId(requestId)) {
        throw new ApiErrors(400, "invalid requestId")
    }

    const company = await RequestCompany.findOneAndDelete({
        _id: requestId,
        "address.district": moderatorDistrict
    })

    if (!company) {
        throw new ApiErrors(404, "company is not found")
    }

    const { html, subject } = generatedContractorRejectionEmailTemplate(company.name, reason)
    sendBrevoMail(company.email, subject, html)
        .catch(() => {
            console.log('mail send failed')
        })

    return res
        .status(200)
        .json(
            new ApiResponse(200, requestId, "contractor rejected successfully")
        )
})