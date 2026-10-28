import mongoose from "mongoose";
import { NOTIFICATION_TYPES } from "../constant/notification.types.js";
import Notifications from "../models/Notification.model.js";

interface AuctionResultNotificationParams {
    issueId: mongoose.Types.ObjectId;
    winnerId: mongoose.Types.ObjectId;
    bidderIds: mongoose.Types.ObjectId[];
    senderId: mongoose.Types.ObjectId;
}

export const createAuctionResultNotifications = async ({
    issueId,
    winnerId,
    bidderIds,
    senderId,
}: AuctionResultNotificationParams) => {
    const winnerIdString = winnerId.toString();

    // find unique loser ID's without winner
    const loserIds = [
        ...new Map(
            bidderIds
                .filter((id) => id.toString() !== winnerIdString)
                .map((id) => [id.toString(), id])
        ).values(),
    ];

    const notifications = [
        {
            recipient: winnerId,
            sender: senderId,
            type: NOTIFICATION_TYPES.AUCTION_WON,
            title: "Congratulations! You Won",
            message:
                "You have been selected as the winner of this auction.",
            relatedId: issueId,
            relatedModel: "Issue",
        },

        ...loserIds.map((recipientId) => ({
            recipient: recipientId,
            sender: senderId,
            type: NOTIFICATION_TYPES.AUCTION_LOST,
            title: "Auction Result",
            message:
                "Unfortunately, you were not selected as the winner of this auction.",
            relatedId: issueId,
            relatedModel: "Issue",
        })),
    ];

    return Notifications.insertMany(notifications);
};