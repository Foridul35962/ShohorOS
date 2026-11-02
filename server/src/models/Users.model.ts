import mongoose from "mongoose";
import { DISTRICTS } from "../constant/common.js";

interface IUser {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;

    profilePic?: {
        url?: string;
        publicId?: string;
    };

    role: "citizen" | "moderator" | "department-officer" |
          "city-admin" | "contractor" | "project-staff" | "inspector";

    companyId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;

    district: string;
}

const userSchema = new mongoose.Schema<IUser>({
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
        unique: true
    },
    profilePic: {
        url: {
            type: String
        },
        publicId: {
            type: String
        }
    },
    role: {
        type: String,
        required: true,
        enum: [
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
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: function (this: mongoose.HydratedDocument<IUser>): boolean {
            return this.role === "contractor" || this.role === "project-staff";
        }
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Departments",
        required: function (this: mongoose.HydratedDocument<IUser>): boolean {
            return this.role === "department-officer";
        }
    },
    district: {
        type: String,
        required: true,
        enum: DISTRICTS,
        trim: true
    }
}, { timestamps: true });

const Users = mongoose.model<IUser>("Users", userSchema);

export default Users;
