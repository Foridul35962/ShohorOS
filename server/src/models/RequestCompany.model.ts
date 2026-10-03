import mongoose from "mongoose";
import { DISTRICTS } from "../constant/common.js";

const requestCompanySchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    }
}, { timestamps: true })

const RequestCompany = mongoose.model("RequestCompany", requestCompanySchema)
export default RequestCompany