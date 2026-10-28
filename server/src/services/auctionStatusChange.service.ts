import mongoose from "mongoose";
import ApiErrors from "../helpers/ApiErrors.js";
import Auctions from "../models/Auction.model.js";

const auctionStatusChange = async ({
    auctionId,
}: {
    auctionId: mongoose.Types.ObjectId;
}) => {
    if (!mongoose.isValidObjectId(auctionId)) {
        throw new ApiErrors(400, "Invalid auction ID");
    }

    const auction = await Auctions.findOneAndUpdate(
        {
            _id: auctionId,
            status: "ACTIVE",
            deadline: { $lte: new Date() },
        },
        {
            $set: {
                status: "AWAITING_SELECTION",
            },
        },
        {
            new: true,
        }
    );

    // Another request may already have changed the status.
    if (!auction) {
        const existingAuction = await Auctions.findById(auctionId);

        if (!existingAuction) {
            throw new ApiErrors(404, "Auction not found");
        }

        return existingAuction;
    }

    return auction;
};

export default auctionStatusChange;
