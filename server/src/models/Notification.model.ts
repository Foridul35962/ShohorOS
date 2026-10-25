import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../constant/notification.types.js';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true,
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        default: null,
    },

    type: {
        type: String,
        enum: Object.values(NOTIFICATION_TYPES),
        required: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
    },

    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },

    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },

    relatedModel: {
        type: String,
        enum: ['Issue', 'Project', 'Auction'],
        default: null,
    },

    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notifications = mongoose.model(
    'Notifications',
    notificationSchema
);

export default Notifications;