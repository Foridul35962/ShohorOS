import redis from "../config/redis.js";
import { DISTRICTS } from "../constant/common.js";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import { check, validationResult } from "express-validator"
import Users from "../models/Users.model.js";
import RequestUsers from "../models/RequestUsers.model.js";
import bcrypt from "bcryptjs";
import { generateCitizenVerificationEmail, sendBrevoMail } from "../config/mail.js";
import ApiResponse from "../helpers/ApiResponse.js";
import crypto from "crypto"

export const registrationCitizen = [
    check("name")
        .trim()
        .notEmpty()
        .withMessage("name is required"),
    check("email")
        .trim()
        .isEmail()
        .withMessage("email is invalid"),
    check("phoneNumber")
        .trim()
        .isMobilePhone("bn-BD")
        .withMessage("phone number is invalid"),
    check("password")
        .notEmpty()
        .withMessage("password is required")
        .trim()
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters')
        .matches(/[a-zA-Z]/)
        .withMessage('password must contain a letter')
        .matches(/[0-9]/)
        .withMessage('password must contain a number'),
    check("district")
        .notEmpty()
        .withMessage("district is required")
        .isIn(DISTRICTS)
        .withMessage("invalid districts"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid data", error.array() as unknown as never[])
        }
        const { name, email, password, phoneNumber, district } = req.body

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)

        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const coolDownKey = `coolDownMail:${email}`

        const ttl = await redis.ttl(coolDownKey)

        if (ttl > 0) {
            throw new ApiErrors(429, `please wait ${ttl}s because you try too many time`)
        }

        const existingUser = await Users.findOne({
            $or: [
                { email },
                { phoneNumber }
            ]
        })

        if (existingUser) {
            throw new ApiErrors(400, "user is already registered")
        }

        const dublicateUser = await RequestUsers.findOne({
            $or: [
                { email },
                { phoneNumber }
            ]
        })

        if (dublicateUser) {
            throw new ApiErrors(400, "user already requested. wait for admin response")
        }

        const hashPass = await bcrypt.hash(password, 12)

        const otp = crypto.randomInt(100000, 1000000).toString();

        const { subject, html } = generateCitizenVerificationEmail(name, otp);

        try {
            await sendBrevoMail(email, subject, html)
        } catch (error) {
            throw new ApiErrors(500, "email send failed")
        }

        await redis.set(coolDownKey, "1", "EX", 60)

        const redisKey = `userRegistration:${email}`

        await redis.set(redisKey,
            JSON.stringify({
                name: name,
                email: email,
                password: hashPass,
                phoneNumber: phoneNumber,
                district: district,
                role: "citizen",
                otp: otp
            }), "EX", 300
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "user registration send otp successfully")
            )
    })
]

export const verifyCitizen = [
    check("email")
        .trim()
        .notEmpty()
        .withMessage("email should not be empty")
        .isEmail()
        .withMessage("email is invalid"),
    check("otp")
        .trim()
        .notEmpty()
        .withMessage("otp is required")
        .isLength({ max: 6, min: 6 })
        .withMessage("invalid otp"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid data", error.array() as unknown as never[])
        }

        const { email, otp } = req.body
        const redisKey = `userRegistration:${email}`

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)

        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const redisUser = await redis.get(redisKey)
        if (!redisUser) {
            throw new ApiErrors(400, "otp is expired")
        }

        const user = JSON.parse(redisUser)

        if (user.otp.toString() !== otp.toString()) {
            throw new ApiErrors(400, "otp is not matched")
        }

        const requestUser = await RequestUsers.create({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            district: user.district,
            password: user.password,
            role: "citizen",
        })

        if (!requestUser) {
            throw new ApiErrors(500, "user registration failed")
        }

        await redis.del(redisKey)

        return res
            .status(201)
            .json(
                new ApiResponse(201, {}, "user verify successfully")
            )
    })
]