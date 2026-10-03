import mongoose from "mongoose";
import { DISTRICTS } from "../constant/common.js";

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    registrationNumber: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
    },
    description: {
        type: String,
        trim: true,
    },
    address: {
        house: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true,
            enum: DISTRICTS,
            trim: true,
        },
    },
    image: {
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    }
}, { timestamps: true })

const Company = mongoose.model("Company", companySchema)
export default Company