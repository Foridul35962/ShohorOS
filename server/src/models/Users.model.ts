import mongoose from "mongoose";
import { DISTRICTS } from "../constant/common.js";

const userSchema = new mongoose.Schema({
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
    profilePic:{
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    },
    role:{
        type: String,
        required: true,
        enum:[
            "citizen",
            "moderator",
            "department-officer",
            "city-admin",
            "contractor",
            "project-staff",
            "inspector"
        ],
        default: "citizen"
    },
    district: {
        type: String,
        required: true,
        enum: DISTRICTS,
        trim: true,
    },
},{timestamps: true})

const Users = mongoose.model("Users", userSchema)
export default Users