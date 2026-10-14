import mongoose from "mongoose";

const inspectionSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Projects",
        required: true,
        index: true,
    },

    inspectorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        index: true,
    },

    visitDate: {
        type: Date,
        required: true,
        default: Date.now,
    },

    findings: {
        type: String,
        required: true,
        trim: true,
    },

    image: [{
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    }],

    result: {
        type: String,
        enum: ["PASSED", "FAILED", "NEEDS_REINSPECTION"],
        required: true,
    },

    correctionNote: {
        type: String,
        trim: true,
        default: "",
    },

    reinspectionRequired: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true })

inspectionSchema.index({ projectId: 1, visitDate: -1 });

const Inspections = mongoose.model("Inspections", inspectionSchema)
export default Inspections