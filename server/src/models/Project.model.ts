import mongoose from "mongoose";

const progressUpdateSchema = new mongoose.Schema({
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    image: {
        type: [{
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            }
        }],
        required: true,
        validate: {
            validator: (images: { url: string; publicId: string }[]) =>
                images.length >= 1 && images.length <= 5,
            message: "Upload between 1 and 5 images"
        }
    },

    progressPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },

    workDate: {
        type: Date,
        required: true,
    }
}, { timestamps: true })

const completionSubmissionSchema = new mongoose.Schema({
    image: {
        type: [
            {
                url: {
                    type: String,
                    required: true,
                },
                publicId: {
                    type: String,
                    required: true,
                },
            },
        ],
        default: [],
        validate: {
            validator: (images: { url: string; publicId: string }[]) =>
                images.length === 0 || images.length <= 5,
            message: "Upload between 1 and 5 images",
        },
    },

    description: {
        type: String,
        trim: true,
        default: "",
    },

    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null,
    },

    submittedAt: {
        type: Date,
        default: null,
    },
});

const projectSchema = new mongoose.Schema({
    issueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Issues",
        required: true,
        unique: true,
    },

    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auctions",
        required: true,
    },

    selectedBidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bids",
        required: true,
        unique: true,
    },

    contractorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        index: true,
    },

    plannedDurationDays: {
        type: Number,
        required: true,
        min: 1,
    },

    plannedStartDate: {
        type: Date,
        default: null,
    },

    plannedEndDate: {
        type: Date,
        default: null,
    },

    status: {
        type: String,
        enum: [
            "PLANNED",
            "IN_PROGRESS",
            "WORK_SUBMITTED",
            "INSPECTION_FAILED",
            "REVISION_REQUIRED",
            "COMPLETED",
            "CANCELLED",
        ],
        default: "PLANNED",
        index: true,
    },

    progressUpdates: {
        type: [progressUpdateSchema],
        default: [],
    },

    // Contractor's final work submission and After images
    completionSubmission: {
        type: completionSubmissionSchema,
        default: () => ({}),
    },

    completedAt: {
        type: Date,
        default: null,
    }
}, { timestamps: true })

projectSchema.index({ contractorId: 1, status: 1 });
projectSchema.index({ status: 1, updatedAt: -1 });

const Projects = mongoose.model("Projects", projectSchema);
export default Projects