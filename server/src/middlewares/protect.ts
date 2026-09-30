import type { DISTRICTS } from "../constant/common.js";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            _id: string;
            role: "citizen" |
            "moderator" |
            "department-officer" |
            "city-admin" |
            "contractor" |
            "project-staff" |
            "inspector",
            district: string;
        };
    }
}

const protect = AsyncHandler(async(req, res, next)=>{
    const {token} = req.cookies
    if (!token) {
        throw new ApiErrors(401, "user is not authenticated")
    }

    const tokenSecret = process.env.TOKEN_SECRET
    if (!tokenSecret) {
        throw new ApiErrors(500, "token secret is not configured")
    }

    const decodedToken = jwt.verify(token, tokenSecret) as jwt.JwtPayload & {
        userId?: string;
        role?: string;
        district?: string;
    }

    if (!decodedToken || typeof decodedToken === "string" || !decodedToken.userId || !decodedToken.role) {
        throw new ApiErrors(401, "user is not authenticated")
    }

    if (!decodedToken.district) {
        throw new ApiErrors(403, "user is not authorized")
    }

    const roles = [
        "citizen",
        "moderator",
        "department-officer",
        "city-admin",
        "contractor",
        "project-staff",
        "inspector"
    ] as const;

    if (!roles.includes(decodedToken.role as typeof roles[number])) {
        throw new ApiErrors(401, "user is not authenticated")
    }

    const userId = decodedToken.userId
    const role = decodedToken.role
    const district = decodedToken.district

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiErrors(401, "user is not authenticated")
    }

    const user = {
        _id: userId,
        role: role as typeof roles[number],
        district
    }

    req.user = user

    next()
})

export default protect