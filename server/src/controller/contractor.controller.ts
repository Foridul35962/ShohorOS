import mongoose from "mongoose";
import { CATEGORY, DISTRICTS } from "../constant/common.js";
import ApiErrors from "../helpers/ApiErrors.js";
import ApiResponse from "../helpers/ApiResponse.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import Issues from "../models/Issues.model.js";
import redis from "../config/redis.js";
import Bids from "../models/Bid.model.js";
import Auctions from "../models/Auction.model.js";
import auctionStatusChange from "../services/auctionStatusChange.service.js";

export const getAllIssuesForContractor = AsyncHandler(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = 15;
    const skip = (page - 1) * limit;

    const { title, category, district } = req.query;

    if (!Number.isInteger(page) || page < 1) {
        throw new ApiErrors(400, "Invalid page number");
    }

    // Validate query parameters
    if (title !== undefined && typeof title !== "string") {
        throw new ApiErrors(400, "Invalid title");
    }

    if (category !== undefined && typeof category !== "string") {
        throw new ApiErrors(400, "Invalid category");
    }

    if (district !== undefined && typeof district !== "string") {
        throw new ApiErrors(400, "Invalid district");
    }

    const normalizedTitle = title?.trim();
    const normalizedCategory = category?.trim().toUpperCase();
    const normalizedDistrict = district?.trim();

    if (
        normalizedDistrict &&
        !DISTRICTS.includes(normalizedDistrict)
    ) {
        throw new ApiErrors(400, "Invalid district");
    }

    type IssueCategory =
        | "ROAD"
        | "DRAIN"
        | "WATER"
        | "ELEC"
        | "WASTE"
        | "BUILDING"
        | "PARK"
        | "TRAFFIC";

    if (
        normalizedCategory &&
        !CATEGORY.includes(normalizedCategory)
    ) {
        throw new ApiErrors(400, "Invalid category");
    }

    // Build issue filters
    const matchQuery: Record<string, unknown> = {};

    if (normalizedTitle) {
        // Escape regex special characters
        const escapedTitle = normalizedTitle.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        matchQuery.title = {
            $regex: escapedTitle,
            $options: "i",
        };
    }

    if (normalizedDistrict) {
        matchQuery.district = normalizedDistrict;
    }

    if (normalizedCategory) {
        matchQuery.category = normalizedCategory as IssueCategory;
    }

    // Capture the current time once for consistent filtering
    const now = new Date();

    const [result] = await Issues.aggregate([
        // Apply issue filters first
        {
            $match: matchQuery,
        },

        // Join each issue with its eligible auction
        {
            $lookup: {
                from: "auctions",
                let: { issueId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$issueId", "$$issueId"],
                                    },
                                    {
                                        $gt: ["$deadline", now],
                                    },
                                    {
                                        $eq: ["$status", "ACTIVE"],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            deadline: 1,
                            status: 1,
                        },
                    },
                ],
                as: "auction",
            },
        },

        // Only issues with an eligible auction
        {
            $unwind: "$auction",
        },

        // Newest issues first
        {
            $sort: {
                createdAt: -1,
                _id: -1,
            },
        },

        // Count and paginate the same filtered result
        {
            $facet: {
                metadata: [
                    {
                        $count: "totalIssues",
                    },
                ],

                issues: [
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            category: 1,
                            address: 1,
                            createdAt: 1,
                            district: 1,
                            auction: 1,
                        },
                    },
                ],
            },
        },
    ]);

    const issues = result?.issues ?? [];
    const totalIssues = result?.metadata?.[0]?.totalIssues ?? 0;
    const totalPages = Math.ceil(totalIssues / limit);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                issues,
                pagination: {
                    currentPage: page,
                    limit,
                    totalIssues,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1 && totalPages > 0,
                },
            },
            "Contractor issues fetched successfully"
        )
    );
});

export const getIssueForContractor = AsyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    if (typeof issueId !== "string" || !issueId) {
        throw new ApiErrors(400, "Issue ID is required");
    }

    if (!mongoose.isValidObjectId(issueId)) {
        throw new ApiErrors(400, "Invalid issue ID");
    }

    const cacheKey = `issue:contractor:${issueId}`;

    let issue: any = null;
    const cachedIssue = await redis.get(cacheKey);

    if (cachedIssue) {
        const parsedIssue = JSON.parse(cachedIssue);

        // Expired ACTIVE auction must be refreshed from MongoDB.
        if (
            parsedIssue.auction?.status === "ACTIVE" &&
            new Date(parsedIssue.auction.deadline) <= new Date()
        ) {
            await redis.del(cacheKey);
        } else {
            issue = parsedIssue;
        }
    }

    if (!issue) {
        const [foundIssue] = await Issues.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(issueId),
                },
            },
            {
                $lookup: {
                    from: Auctions.collection.name,
                    localField: "_id",
                    foreignField: "issueId",
                    as: "auction",
                },
            },
            {
                $unwind: {
                    path: "$auction",
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    category: 1,
                    district: 1,
                    address: 1,
                    location: 1,
                    image: {
                        $map: {
                            input: { $ifNull: ["$image", []] },
                            as: "img",
                            in: {
                                url: "$$img.url",
                            },
                        },
                    },
                    createdAt: 1,
                    auction: 1,
                },
            },
        ]);

        if (!foundIssue) {
            throw new ApiErrors(404, "Issue or auction not found");
        }

        issue = foundIssue;

        const deadline = new Date(issue.auction.deadline);
        const now = new Date();

        // Change status only when the auction has actually expired.
        if (
            issue.auction.status === "ACTIVE" &&
            deadline <= now
        ) {
            await auctionStatusChange({
                auctionId: issue.auction._id,
            });

            issue.auction.status = "AWAITING_SELECTION";
        }

        // Cache until the deadline, up to 10 minutes.
        // Once expired, cache the updated status for 10 minutes.
        const remainingSeconds = Math.floor(
            (deadline.getTime() - Date.now()) / 1000
        );

        const cacheTTL =
            remainingSeconds > 0
                ? Math.min(600, remainingSeconds)
                : 600;

        await redis.set(
            cacheKey,
            JSON.stringify(issue),
            "EX",
            cacheTTL
        );
    }

    const myBid = await Bids.findOne({
        auctionId: issue.auction._id,
        contractorId: userId,
    })
        .select(
            "_id proposedBudget workPlan estimatedDurationDays status submittedAt"
        )
        .lean();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...issue,
                myBid: myBid ?? null,
            },
            "Issue fetched successfully"
        )
    );
});

export const addIssueBid = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const {
        auctionId,
        proposedBudget,
        workPlan,
        estimatedDurationDays,
    } = req.body;

    if (
        typeof auctionId !== "string" ||
        !mongoose.isValidObjectId(auctionId)
    ) {
        throw new ApiErrors(400, "Invalid auction ID");
    }

    const budget = Number(proposedBudget);
    const duration = Number(estimatedDurationDays);

    if (!Number.isFinite(budget) || budget <= 0) {
        throw new ApiErrors(400, "Proposed budget must be greater than 0");
    }

    if (!Number.isInteger(duration) || duration < 1) {
        throw new ApiErrors(
            400,
            "Estimated duration must be a positive integer"
        );
    }

    if (
        typeof workPlan !== "string" ||
        !workPlan.trim() ||
        workPlan.trim().length > 10000
    ) {
        throw new ApiErrors(400, "Invalid work plan");
    }

    const auctionObjectId = new mongoose.Types.ObjectId(auctionId);

    const [existingBid, auction] = await Promise.all([
        Bids.findOne({
            auctionId: auctionObjectId,
            contractorId: userId,
        }).lean(),

        Auctions.findOne({
            _id: auctionObjectId,
            status: "ACTIVE",
            deadline: { $gt: new Date() },
        }).lean(),
    ]);

    if (existingBid) {
        throw new ApiErrors(
            409,
            "You have already submitted a bid for this auction"
        );
    }

    if (!auction) {
        throw new ApiErrors(
            400,
            "Auction is not active or its deadline has passed"
        );
    }

    const bid = await Bids.create({
        contractorId: userId,
        auctionId: auctionObjectId,
        proposedBudget: budget,
        workPlan: workPlan.trim(),
        estimatedDurationDays: duration,
        status: "SUBMITTED",
        submittedAt: new Date(),
    });

    if (!bid) {
        throw new ApiErrors(500, "bid create failed")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, bid, "Bid created successfully")
        );
});

export const editIssueBid = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { auctionId, bidId } = req.body;
    const { proposedBudget, workPlan, estimatedDurationDays } = req.body;

    if (
        typeof auctionId !== "string" ||
        !mongoose.isValidObjectId(auctionId) ||
        typeof bidId !== "string" ||
        !mongoose.isValidObjectId(bidId)
    ) {
        throw new ApiErrors(400, "Invalid auction ID or bid ID");
    }

    const updates: {
        proposedBudget?: number;
        workPlan?: string;
        estimatedDurationDays?: number;
    } = {};

    if (proposedBudget !== undefined) {
        const budget = Number(proposedBudget);

        if (!Number.isFinite(budget) || budget <= 0) {
            throw new ApiErrors(
                400,
                "Proposed budget must be greater than 0"
            );
        }

        updates.proposedBudget = budget;
    }

    if (estimatedDurationDays !== undefined) {
        const duration = Number(estimatedDurationDays);

        if (!Number.isInteger(duration) || duration < 1) {
            throw new ApiErrors(
                400,
                "Estimated duration must be a positive integer"
            );
        }

        updates.estimatedDurationDays = duration;
    }

    if (workPlan !== undefined) {
        if (
            typeof workPlan !== "string" ||
            !workPlan.trim() ||
            workPlan.trim().length > 10000
        ) {
            throw new ApiErrors(400, "Invalid work plan");
        }

        updates.workPlan = workPlan.trim();
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiErrors(
            400,
            "At least one field must be provided for update"
        );
    }

    const auctionObjectId = new mongoose.Types.ObjectId(auctionId);
    const bidObjectId = new mongoose.Types.ObjectId(bidId);

    const auction = await Auctions.findOne({
        _id: auctionObjectId,
        status: "ACTIVE",
        deadline: { $gt: new Date() },
    }).lean();

    if (!auction) {
        throw new ApiErrors(
            400,
            "Auction is not active or its deadline has passed"
        );
    }

    const bid = await Bids.findOne({
        _id: bidObjectId,
        auctionId: auctionObjectId,
        contractorId: userId,
        status: "SUBMITTED",
    });

    if (!bid) {
        throw new ApiErrors(
            404,
            "Editable bid not found"
        );
    }

    Object.assign(bid, updates);

    await bid.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, bid, "Bid updated successfully")
        );
});

export const withdrowBid = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { bidId, auctionId } = req.body;

    if (
        typeof bidId !== "string" ||
        !mongoose.isValidObjectId(bidId)
    ) {
        throw new ApiErrors(400, "Invalid bid ID");
    }

    if (
        typeof auctionId !== "string" ||
        !mongoose.isValidObjectId(auctionId)
    ) {
        throw new ApiErrors(400, "Invalid auction ID");
    }

    const [bid, auction] = await Promise.all([
        Bids.findOne({
            _id: bidId,
            auctionId,
            contractorId: userId,
        }),

        Auctions.findOne({
            _id: auctionId,
            status: "ACTIVE",
            deadline: { $gt: new Date() },
        }).lean(),
    ]);

    if (!bid) {
        throw new ApiErrors(404, "Bid not found");
    }

    if (bid.status !== "SUBMITTED") {
        throw new ApiErrors(
            400,
            "Only submitted bids can be withdrawn"
        );
    }

    if (!auction) {
        throw new ApiErrors(
            400,
            "Auction is no longer active or its deadline has passed"
        );
    }

    if (bid.auctionId.toString() !== auction._id.toString()) {
        throw new ApiErrors(400, "Bid does not belong to this auction")
    }

    bid.status = "WITHDRAWN";
    await bid.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { bidId: bid._id, status: bid.status },
                "Bid withdrawn successfully"
            )
        );
});

export const resetBid = AsyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiErrors(401, "User is unauthorized");
    }

    const { bidId, auctionId } = req.body;

    if (
        typeof bidId !== "string" ||
        !mongoose.isValidObjectId(bidId)
    ) {
        throw new ApiErrors(400, "Invalid bid ID");
    }

    if (
        typeof auctionId !== "string" ||
        !mongoose.isValidObjectId(auctionId)
    ) {
        throw new ApiErrors(400, "Invalid auction ID");
    }

    const [bid, auction] = await Promise.all([
        Bids.findOne({
            _id: bidId,
            auctionId,
            contractorId: userId,
        }),

        Auctions.findOne({
            _id: auctionId,
            status: "ACTIVE",
            deadline: { $gt: new Date() },
        }).lean(),
    ]);

    if (!bid) {
        throw new ApiErrors(404, "Bid not found");
    }

    if (bid.status !== "WITHDRAWN") {
        throw new ApiErrors(
            400,
            "Only withdrawn bids can be reset"
        );
    }

    if (!auction) {
        throw new ApiErrors(
            400,
            "Auction is no longer active or its deadline has passed"
        );
    }

    if (bid.auctionId.toString() !== auction._id.toString()) {
        throw new ApiErrors(400, "Bid does not belong to this auction")
    }

    bid.status = "SUBMITTED";
    await bid.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { bidId: bid._id, status: bid.status },
                "Bid reset successfully"
            )
        );
})