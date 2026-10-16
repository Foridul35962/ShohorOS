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
        min: 0.01,
    },

    workPlan: {
        type: String,
        required: true,
        trim: true,
    },

    estimatedDurationDays: {
        type: Number,
        required: true,
        min: 1,
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
}, {timestamps: true})

bidSchema.index(
  { auctionId: 1, contractorId: 1 },
  { unique: true }
);

bidSchema.index({ auctionId: 1, status: 1, proposedBudget: 1 });

const Bids = mongoose.model("Bids", bidSchema);

export default Bids