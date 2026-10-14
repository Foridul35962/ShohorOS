import mongoose from "mongoose";
import { DISTRICTS } from "../constant/common.js";

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },

    category: {
        type: String,
        required: true,
        enum: [
            "ROAD",
            "DRAIN",
            "WATER",
            "ELEC",
            "WASTE",
            "BUILDING",
            "PARK",
            "TRAFFIC",
        ]
    },

    district: {
        type: String,
        required: true,
        trim: true,
        index: true,
        enum: DISTRICTS
    },

    address: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        }
    },

    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            default: [0, 0],
        }
    },

    image: [{
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    }],

    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        index: true
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Departments",
        required: true,
        index: true
    },

    status: {
        type: String,
        enum: [
            "REPORTED",
            "UNDER_REVIEW",
            "REJECTED",
            "APPROVED",
            "PROJECT_CREATED",
            "IN_PROGRESS",
            "AWAITING_INSPECTION",
            "REVISION_REQUIRED",
            "RESOLVED",
            "CANCELLED",
        ],
        default: "REPORTED",
        index: true,
    },
    
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Projects",
        default: null,
    },
}, {timestamps: true})

const Issues = mongoose.model("Issues", issueSchema)
export default Issues