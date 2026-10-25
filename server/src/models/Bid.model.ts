import mongoose from "mongoose";

const bidSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auctions",
        required: true
    },

    contractorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },

    proposedBudget: {
        type: Number,
        required: true,
        min: [0.01, "Budget must be greater than 0"],
    },

    workPlan: {
        type: String,
        required: true,
        trim: true,
        maxlength: [10000, "Work plan cannot exceed 10000 characters"],
    },

    estimatedDurationDays: {
        type: Number,
        required: true,
        min: [1, "Duration must be at least 1 day"],
        validate: {
            validator: Number.isInteger,
            message: "Duration must be an integer number of days",
        },
    },

    status: {
        type: String,
        enum: ["SUBMITTED", "WITHDRAWN", "ACCEPTED", "REJECTED"],
        default: "SUBMITTED",
        index: true,
    },

    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true })

bidSchema.index(
    { auctionId: 1, contractorId: 1 },
    { unique: true }
);

bidSchema.index({ auctionId: 1, status: 1, proposedBudget: 1 });

const Bids = mongoose.model("Bids", bidSchema);

export default Bids