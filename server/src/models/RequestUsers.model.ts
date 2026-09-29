import mongoose from "mongoose";
import { DISTRICTS } from "../constant/common.js";

const requestUserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type:String,
        required: true,
        trim: true
    },
    phoneNumber:{
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    role:{
        type: String,
        required: true,
        enum: ["citizen"],
        default: "citizen"
    },
    district: {
        type: String,
        required: true,
        enum: DISTRICTS,
        trim: true,
    },
},{timestamps: true})

const RequestUsers = mongoose.model("RequestUsers", requestUserSchema)
export default RequestUsers