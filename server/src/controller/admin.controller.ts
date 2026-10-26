import AsyncHandler from "../helpers/AsyncHandler.js";
import ApiErrors from "../helpers/ApiErrors.js";
import Users from "../models/Users.model.js";
import bcrypt from "bcryptjs";
import redis from "../config/redis.js";
import crypto from "crypto";
import { generateAdminCreatedUserOTPEmail, sendBrevoMail } from "../config/mail.js";
import ApiResponse from "../helpers/ApiResponse.js";
import mongoose, { type PipelineStage } from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Departments from "../models/Department.model.js";
import Issues from "../models/Issues.model.js";
import Auctions from "../models/Auction.model.js";
import Projects from "../models/Project.model.js";
import Bids from "../models/Bid.model.js";
import Company from "../models/Company.model.js";
import Inspections from "../models/Inspection.model.js";
import { createAuctionResultNotifications } from "../services/notification.service.js";
import { AUCTION_STATUS, CATEGORY } from "../constant/common.js";

export const addMembers = AsyncHandler(async (req, res) => {
    const adminDistrict = req.user?.district
    const { name, email, phoneNumber, password, district, role, departmentCode } = req.body
    if (adminDistrict?.toString() !== district) {
        throw new ApiErrors(403, "User does not belong to your district")
    }

    if (role === "department-officer" && !departmentCode) {
        throw new ApiErrors(400, "department name is required")
    }

    const existingUser = await Users.findOne({ email })
    if (existingUser) {
        throw new ApiErrors(400, "user is already registered")
    }

    let department = null;

    if (departmentCode) {
        const redisDepartmentKey = `departmentCode:${departmentCode}`;
        const redisDepartment = await redis.get(redisDepartmentKey);

        if (redisDepartment) {
            department = JSON.parse(redisDepartment);
        } else {
            department = await Departments.findOne({
                code: departmentCode,
            });

            if (!department) {
                throw new ApiErrors(404, "Department not found");
            }

            await redis.set(
                redisDepartmentKey,
                JSON.stringify(department),
                "EX",
                1800
            );
        }
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
            otp: otp,
            ...(department ? { departmentId: department._id } : {}),
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
        district: user.district,
        departmentId: user.departmentId
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

export const getIssueDetails = AsyncHandler(async (req, res) => {
    const issueId = Array.isArray(req.params.issueId)
        ? req.params.issueId[0]
        : req.params.issueId;
    const adminDistrict = req.user?.district;

    if (!adminDistrict) {
        throw new ApiErrors(401, "Unauthorized access");
    }

    if (typeof issueId !== "string" || !mongoose.isValidObjectId(issueId)) {
        throw new ApiErrors(400, "Invalid issue ID");
    }

    const redisKey = `issue:admin:${issueId}`;

    const cached = await redis.get(redisKey);

    if (cached) {
        const data = JSON.parse(cached);

        if (data.issue?.district !== adminDistrict) {
            throw new ApiErrors(403, "Access denied");
        }

        return res.status(200).json(
            new ApiResponse(200, data, "Issue details fetched successfully")
        );
    }

    const [result] = await Issues.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(issueId),
            },
        },
        {
            $lookup: {
                from: Users.collection.name,
                localField: "reportedBy",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            email: 1,
                            phoneNumber: 1,
                        },
                    },
                ],
                as: "reportedBy",
            },
        },
        {
            $unwind: {
                path: "$reportedBy",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: Projects.collection.name,
                localField: "projectId",
                foreignField: "_id",
                pipeline: [
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
                                        phoneNumber: 1,
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
                    {
                        $project: {
                            issueId: 1,
                            contractorId: 1,
                            contractor: 1,
                            status: 1,
                            plannedDurationDays: 1,
                            plannedStartDate: 1,
                            plannedEndDate: 1,
                            completedAt: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        },
                    },
                ],
                as: "project",
            },
        },
        {
            $unwind: {
                path: "$project",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: Auctions.collection.name,
                localField: "_id",
                foreignField: "issueId",
                pipeline: [
                    {
                        $lookup: {
                            from: Bids.collection.name,
                            localField: "_id",
                            foreignField: "auctionId",
                            pipeline: [
                                {
                                    $count: "total",
                                },
                            ],
                            as: "bidCountResult",
                        },
                    },
                    {
                        $addFields: {
                            totalBids: {
                                $ifNull: [
                                    {
                                        $arrayElemAt: [
                                            "$bidCountResult.total",
                                            0,
                                        ],
                                    },
                                    0,
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            bidCountResult: 0,
                        },
                    },
                ],
                as: "auction",
            },
        },
        {
            $unwind: {
                path: "$auction",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                title: 1,
                description: 1,
                category: 1,
                district: 1,
                address: 1,
                "location.coordinates": 1,
                "image.url": 1,
                reportedBy: 1,
                status: 1,
                priority: 1,
                project: 1,
                auction: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    if (!result) {
        throw new ApiErrors(404, "Issue not found");
    }

    if (result.district !== adminDistrict) {
        throw new ApiErrors(403, "Access denied");
    }

    const { project, auction, ...issue } = result;
    const data = {
        issue,
        project: project ?? null,
        auction: auction ?? null,
    };

    await redis.set(redisKey, JSON.stringify(data), "EX", 300);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Issue details fetched successfully"
        )
    );
});

export const startAuction = AsyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const { deadline } = req.body;

    const adminId = req.user?._id;
    const adminDistrict = req.user?.district;

    if (!adminId || !adminDistrict) {
        throw new ApiErrors(401, "Unauthorized access");
    }

    if (typeof issueId !== "string" || !mongoose.isValidObjectId(issueId)) {
        throw new ApiErrors(400, "Invalid issue ID");
    }

    const deadlineDate = new Date(deadline);

    if (
        !deadline ||
        Number.isNaN(deadlineDate.getTime()) ||
        deadlineDate <= new Date()
    ) {
        throw new ApiErrors(400, "Valid future deadline is required");
    }

    const [issue] = await Issues.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(issueId),
            },
        },
        {
            $project: {
                district: 1,
                status: 1,
                projectId: 1,
            },
        },
    ]);

    if (!issue) {
        throw new ApiErrors(404, "Issue not found");
    }

    if (issue.district !== adminDistrict) {
        throw new ApiErrors(403, "Access denied");
    }

    if (issue.status !== "APPROVED") {
        throw new ApiErrors(
            400,
            "Only approved issues can start an auction"
        );
    }

    if (issue.projectId) {
        throw new ApiErrors(409, "Project already exists");
    }

    const existingAuction = await Auctions.exists({ issueId });

    if (existingAuction) {
        throw new ApiErrors(409, "Auction already exists");
    }

    const auction = await Auctions.create({
        issueId,
        startsAt: new Date(),
        deadline: deadlineDate,
        status: "ACTIVE",
    });

    await redis.del(`issue:admin:${issueId}`);

    return res.status(201).json(
        new ApiResponse(201, auction, "Auction started successfully")
    );
});

export const getAuctionDetails = AsyncHandler(async (req, res) => {
    const { auctionId } = req.params;
    const adminDistrict = req.user?.district;

    if (!adminDistrict) {
        throw new ApiErrors(401, "Unauthorized access");
    }

    if (typeof auctionId !== "string" || !mongoose.isValidObjectId(auctionId)) {
        throw new ApiErrors(400, "Invalid auction ID");
    }

    const redisKey = `admin:auction:${auctionId}`

    const redisAuction = await redis.get(redisKey)
    if (redisAuction) {
        const auctionData = JSON.parse(redisAuction)
        if (auctionData.issue.district !== adminDistrict) {
            throw new ApiErrors(403, "Access denied");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                auctionData,
                "Auction details fetched successfully"
            )
        );
    }

    const [auction] = await Auctions.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(auctionId),
            },
        },
        {
            $lookup: {
                from: Issues.collection.name,
                localField: "issueId",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            district: 1,
                            category: 1,
                            status: 1,
                        },
                    },
                ],
                as: "issue",
            },
        },
        {
            $unwind: "$issue",
        },
        {
            $lookup: {
                from: Bids.collection.name,
                localField: "_id",
                foreignField: "auctionId",
                pipeline: [
                    {
                        $count: "total",
                    },
                ],
                as: "bidCountResult",
            },
        },
        {
            $lookup: {
                from: Bids.collection.name,
                localField: "winningBidId",
                foreignField: "_id",
                pipeline: [
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
                                        phoneNumber: 1,
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
                ],
                as: "winningBid",
            },
        },
        {
            $lookup: {
                from: Users.collection.name,
                localField: "selectedBy",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            email: 1,
                        },
                    },
                ],
                as: "selectedBy",
            },
        },
        {
            $unwind: {
                path: "$selectedBy",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                totalBids: {
                    $ifNull: [
                        {
                            $arrayElemAt: [
                                "$bidCountResult.total",
                                0,
                            ],
                        },
                        0,
                    ],
                },
                winningBid: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$winningBid", 0],
                        },
                        null,
                    ],
                },
            },
        },
        {
            $project: {
                bidCountResult: 0,
            },
        },
    ]);

    if (!auction) {
        throw new ApiErrors(404, "Auction not found");
    }

    await redis.set(redisKey, JSON.stringify(auction), "EX", 300)

    if (auction.issue.district !== adminDistrict) {
        throw new ApiErrors(403, "Access denied");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            auction,
            "Auction details fetched successfully"
        )
    );
});

export const getAuctionBids = AsyncHandler(async (req, res) => {
    const { auctionId } = req.params;
    const adminDistrict = req.user?.district;

    if (!adminDistrict) {
        throw new ApiErrors(401, "Unauthorized access");
    }

    if (typeof auctionId !== "string" || !mongoose.isValidObjectId(auctionId)) {
        throw new ApiErrors(400, "Invalid auction ID");
    }

    const [auction] = await Auctions.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(auctionId),
            },
        },
        {
            $lookup: {
                from: Issues.collection.name,
                localField: "issueId",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            district: 1,
                            category: 1,
                        },
                    },
                ],
                as: "issue",
            },
        },
        {
            $unwind: "$issue",
        },
    ]);

    if (!auction) {
        throw new ApiErrors(404, "Auction not found");
    }

    if (auction.issue.district !== adminDistrict) {
        throw new ApiErrors(403, "Access denied");
    }

    const bids = await Bids.aggregate([
        {
            $match: {
                auctionId: new mongoose.Types.ObjectId(auctionId),
            },
        },
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
                            phoneNumber: 1,
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
        {
            $lookup: {
                from: Company.collection.name,
                let: {
                    contractorId: "$contractorId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$owner", "$$contractorId"],
                            },
                        },
                    },
                    {
                        $project: {
                            companyName: 1,
                            registrationNumber: 1,
                            description: 1,
                            address: 1,
                            "image.url": 1,
                            owner: 1,
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
        {
            $sort: {
                proposedBudget: 1,
                submittedAt: 1,
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                auction,
                totalBids: bids.length,
                bids,
            },
            "Auction bids fetched successfully"
        )
    );
});

export const selectAuctionWinner = AsyncHandler(async (req, res) => {
    const { auctionId } = req.params;
    const { bidId } = req.body;

    const adminId = req.user?._id;
    const adminDistrict = req.user?.district;

    if (!adminId || !adminDistrict) {
        throw new ApiErrors(401, "Unauthorized access");
    }

    if (
        typeof auctionId !== "string" ||
        !mongoose.isValidObjectId(auctionId)
    ) {
        throw new ApiErrors(400, "Invalid auction ID");
    }

    if (!mongoose.isValidObjectId(bidId)) {
        throw new ApiErrors(400, "Invalid bid ID");
    }

    const auctionObjectId = new mongoose.Types.ObjectId(auctionId);
    const bidObjectId = new mongoose.Types.ObjectId(bidId);

    const session = await mongoose.startSession();

    try {
        let project: any;
        let winningBid: any;
        let bidderIds: mongoose.Types.ObjectId[] = [];

        const issueId = await session.withTransaction(async () => {
            const [auctionData] = await Auctions.aggregate([
                {
                    $match: {
                        _id: auctionObjectId,
                    },
                },
                {
                    $lookup: {
                        from: Issues.collection.name,
                        localField: "issueId",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $project: {
                                    district: 1,
                                    status: 1,
                                    projectId: 1,
                                },
                            },
                        ],
                        as: "issue",
                    },
                },
                {
                    $unwind: "$issue",
                },
            ]).session(session);

            if (!auctionData) {
                throw new ApiErrors(404, "Auction not found");
            }

            if (auctionData.issue.district !== adminDistrict) {
                throw new ApiErrors(403, "Access denied");
            }

            if (
                !["ENDED", "AWAITING_SELECTION"].includes(
                    auctionData.status
                )
            ) {
                throw new ApiErrors(
                    400,
                    "Auction must end before selecting a winner"
                );
            }

            if (
                auctionData.winningBidId ||
                auctionData.issue.projectId
            ) {
                throw new ApiErrors(
                    409,
                    "Winner already selected or project already exists"
                );
            }

            const issueId = auctionData.issueId;

            // 2. Eligible winning bid transaction-এর মধ্যে যাচাই করো
            const bid = await Bids.findOne({
                _id: bidObjectId,
                auctionId: auctionObjectId,
                status: "SUBMITTED",
            })
                .session(session)
                .lean();

            if (!bid) {
                throw new ApiErrors(
                    404,
                    "Eligible bid not found for this auction"
                );
            }

            winningBid = bid;

            // Notification-এর জন্য submitted bidder-দের ID সংগ্রহ
            bidderIds = await Bids.distinct("contractorId", {
                auctionId: auctionObjectId,
                status: "SUBMITTED",
            }).session(session) as mongoose.Types.ObjectId[];

            // 3. Auction winner select করো
            const auctionResult = await Auctions.updateOne(
                {
                    _id: auctionObjectId,
                    status: {
                        $in: ["ENDED", "AWAITING_SELECTION"],
                    },
                    winningBidId: null,
                },
                {
                    $set: {
                        status: "WINNER_SELECTED",
                        winningBidId: winningBid._id,
                        selectedBy: adminId,
                        selectedAt: new Date(),
                    },
                },
                { session }
            );

            if (auctionResult.matchedCount !== 1) {
                throw new ApiErrors(
                    409,
                    "Auction is no longer available for winner selection"
                );
            }

            // 4. Issue update করো
            const issueResult = await Issues.updateOne(
                {
                    _id: issueId,
                    district: adminDistrict,
                    projectId: null,
                },
                {
                    $set: {
                        status: "PROJECT_CREATED",
                        projectId: new mongoose.Types.ObjectId(),
                    },
                },
                { session }
            );

            if (issueResult.matchedCount !== 1) {
                throw new ApiErrors(
                    409,
                    "Issue already has a project or is unavailable"
                );
            }

            // Issue-এর projectId-তে যে ID save হয়েছে, সেটি বের করো
            const updatedIssue = await Issues.findById(issueId)
                .select("projectId")
                .session(session)
                .lean();

            if (!updatedIssue?.projectId) {
                throw new ApiErrors(
                    500,
                    "Failed to assign project to issue"
                );
            }

            const projectId = updatedIssue.projectId;

            // 5. Winning bid ACCEPTED করো
            const bidResult = await Bids.updateOne(
                {
                    _id: winningBid._id,
                    auctionId: auctionObjectId,
                    status: "SUBMITTED",
                },
                {
                    $set: {
                        status: "ACCEPTED",
                    },
                },
                { session }
            );

            if (bidResult.matchedCount !== 1) {
                throw new ApiErrors(
                    409,
                    "Winning bid is no longer available"
                );
            }

            // 6. অন্য submitted bids REJECTED করো
            await Bids.updateMany(
                {
                    auctionId: auctionObjectId,
                    _id: { $ne: winningBid._id },
                    status: "SUBMITTED",
                },
                {
                    $set: {
                        status: "REJECTED",
                    },
                },
                { session }
            );

            // 7. Project তৈরি করো
            const [createdProject] = await Projects.create(
                [
                    {
                        _id: projectId,
                        issueId,
                        auctionId: auctionObjectId,
                        selectedBidId: winningBid._id,
                        contractorId: winningBid.contractorId,
                        plannedDurationDays:
                            winningBid.estimatedDurationDays,
                        status: "PLANNED",
                    },
                ],
                { session }
            );

            project = createdProject;

            return issueId;
        });

        try {
            await Promise.all([
                redis.del(`issue:admin:${issueId}`),
                redis.del(`issue:contractor:${issueId}`),
            ]);
        } catch (cacheError) {
            console.error(
                "Issue cache invalidation failed:",
                cacheError
            );
        }

        // 8. Notification save ও Socket.IO emit
        try {
            const notifications = await createAuctionResultNotifications({
                issueId: issueId,
                winnerId: winningBid.contractorId,
                bidderIds,
                senderId: new mongoose.Types.ObjectId(adminId),
            });

            const io = req.app.get("io");

            for (const notification of notifications) {
                io.to(`user:${notification.recipient.toString()}`)
                    .emit("updateNotification", notification);
            }
        } catch (notificationError) {
            console.error(
                "Auction notification failed:",
                notificationError
            );
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    {
                        auctionId,
                        winningBid: {
                            ...winningBid,
                            status: "ACCEPTED",
                        },
                        project,
                    },
                    "Winner selected and project created successfully"
                )
            );
    } finally {
        await session.endSession();
    }
});

export const getProjectMonitoringDetails = AsyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const adminDistrict = req.user?.district;

    if (!adminDistrict) {
        throw new ApiErrors(401, "Unauthorized access");
    }

    if (typeof projectId !== "string" || !mongoose.isValidObjectId(projectId)) {
        throw new ApiErrors(400, "Invalid project ID");
    }

    const redisKey = `admin:project:${projectId}`
    const redisProject = await redis.get(redisKey)

    if (redisProject) {
        const projectDatas = JSON.parse(redisProject)

        if (projectDatas.issue.district !== adminDistrict) {
            throw new ApiErrors(403, "Access denied");
        }

        const { inspections, ...projectData } = projectDatas;

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { project: projectData, inspections, totalInspections: inspections.length },
                    "Project monitoring details fetched successfully"
                )
            );
    }

    const [project] = await Projects.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(projectId),
            },
        },
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
                            status: 1,
                        },
                    },
                ],
                as: "issue",
            },
        },
        {
            $unwind: "$issue",
        },
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
                            phoneNumber: 1,
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
        {
            $lookup: {
                from: Inspections.collection.name,
                localField: "_id",
                foreignField: "projectId",
                pipeline: [
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
                                        phoneNumber: 1,
                                    },
                                },
                            ],
                            as: "inspector",
                        },
                    },
                    {
                        $unwind: {
                            path: "$inspector",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $sort: {
                            visitDate: -1,
                        },
                    },
                ],
                as: "inspections",
            },
        },
        {
            $project: {
                "issue.image.publicId": 0,
                "progressUpdates.image.publicId": 0,
                "completionSubmission.image.publicId": 0,
                "inspections.image.publicId": 0,
            },
        },
    ]);

    if (!project) {
        throw new ApiErrors(404, "Project not found");
    }

    await redis.set(redisKey, JSON.stringify(project), "EX", 600)

    if (project.issue.district !== adminDistrict) {
        throw new ApiErrors(403, "Access denied");
    }

    const { inspections, ...projectData } = project;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { project: projectData, inspections, totalInspections: inspections.length },
                "Project monitoring details fetched successfully"
            )
        );
});

export const getAllAuctions = AsyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = 15;
    const skip = (page - 1) * limit;

    const adminDistrict = req.user?.district;
    if (!adminDistrict) {
        throw new ApiErrors(401, "user is unauthorized");
    }

    const { category, deadline, status } = req.query;

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiErrors(400, "Invalid page number");
    }

    if (category !== undefined && typeof category !== "string") {
        throw new ApiErrors(400, "Invalid category");
    }

    if (status !== undefined && typeof status !== "string") {
        throw new ApiErrors(400, "Invalid status");
    }

    const isDeadline = deadline !== undefined ? deadline === 'true' : undefined;

    const normalizedCategory = category?.trim().toUpperCase();
    const normalizedStatus = status?.trim().toUpperCase();

    if (normalizedCategory && !CATEGORY.includes(normalizedCategory)) {
        throw new ApiErrors(400, "Invalid category");
    }

    if (normalizedStatus && !AUCTION_STATUS.includes(normalizedStatus)) {
        throw new ApiErrors(400, "Invalid status");
    }

    const auctionMatch: Record<string, unknown> = {};

    if (normalizedStatus) {
        auctionMatch.status = normalizedStatus;
    }

    if (isDeadline === true) {
        auctionMatch.deadline = { $gt: new Date() };
    } else if (isDeadline === false) {
        auctionMatch.deadline = { $lt: new Date() };
    }

    const issueMatch: Record<string, unknown> = {};

    if (adminDistrict) {
        issueMatch["issueId.district"] = adminDistrict;
    }

    if (normalizedCategory) {
        issueMatch["issueId.category"] = normalizedCategory;
    }

    const pipeline: PipelineStage[] = [
        { $match: auctionMatch },
        {
            $lookup: {
                from: "issues",
                localField: "issueId",
                foreignField: "_id",
                as: "issueId"
            }
        },
        { $unwind: "$issueId" },
        { $match: issueMatch },
        {
            $project: {
                startsAt: 1,
                deadline: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                issueId: {
                    _id: "$issueId._id",
                    title: "$issueId.title",
                    category: "$issueId.category",
                    address: "$issueId.address",
                    createdAt: "$issueId.createdAt"
                }
            }
        },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ]
            }
        }
    ];

    const result = await Auctions.aggregate(pipeline);

    const auctions = result[0]?.data || [];
    const total = result[0]?.metadata[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const finalResponse = {
        auctions,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalResponse, "all auction fetch successfully")
        );
});