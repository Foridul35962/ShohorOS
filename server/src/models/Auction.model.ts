import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issues",
        required: true,
        unique: true
    },

    startsAt: {
        type: Date,
        required: true
    },

    deadline: {
        type: Date,
        required: true,
        validate: {
            validator: function (this: any, value: Date) {
                return value > this.startsAt;
            },
            message: "Deadline must be after auction start time",
        },
    },

    status: {
        type: String,
        enum: [
            "SCHEDULED",
            "ACTIVE",
            "ENDED",
            "AWAITING_SELECTION",
            "WINNER_SELECTED",
            "CANCELLED",
        ],
        default: "SCHEDULED",
        index: true
    },

    winningBidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bids",
        default: null
    },

    selectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null
    },
    
    selectedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

auctionSchema.index({ status: 1, deadline: 1 })

const Auctions = mongoose.model("Auctions", auctionSchema)

export default Auctions