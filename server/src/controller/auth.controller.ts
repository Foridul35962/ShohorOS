import redis from "../config/redis.js";
import { DISTRICTS } from "../constant/common.js";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";
import { check, validationResult } from "express-validator"
import Users from "../models/Users.model.js";
import RequestUsers from "../models/RequestUsers.model.js";
import bcrypt from "bcryptjs";
import { generateCitizenVerificationEmail, generateForgotPasswordEmail, sendBrevoMail } from "../config/mail.js";
import ApiResponse from "../helpers/ApiResponse.js";
import crypto from "crypto"
import jwt from "jsonwebtoken";

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

export const forgetPassword = [
    check('email')
        .trim()
        .notEmpty()
        .withMessage("email must be required")
        .isEmail()
        .withMessage("invalid email id"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        const { email } = req.body

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)

        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const user = await Users.findOne({ email })
        if (!user) {
            throw new ApiErrors(404, "user is not find")
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const { subject, html } = generateForgotPasswordEmail(user.name, otp);

        try {
            await sendBrevoMail(email, subject, html)
        } catch (error) {
            throw new ApiErrors(500, "email send failed")
        }

        const coolDownKey = `coolDownMail:${email}`
        await redis.set(coolDownKey, "1", "EX", 60)

        const resetRedisKey = `resetPass:${email}`

        await redis.set(resetRedisKey,
            JSON.stringify({
                otp: otp
            }),
            "EX",
            300
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "forget password otp send successfully")
            )
    })
]

export const verifyForgetPass = [
    check("email")
        .trim()
        .notEmpty()
        .withMessage("email must be required")
        .isEmail()
        .withMessage("invalid email id"),
    check("otp")
        .trim()
        .notEmpty()
        .withMessage("otp is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("otp must be in 6 digit"),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid data", error.array() as unknown as never[])
        }

        const { email, otp } = req.body

        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)

        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const resetRedisKey = `resetPass:${email}`

        const redisUser = await redis.get(resetRedisKey)
        if (!redisUser) {
            throw new ApiErrors(400, "otp is expired")
        }

        const user = JSON.parse(redisUser)

        if (user.otp.toString() !== otp) {
            throw new ApiErrors(400, "otp is not matched")
        }

        await redis.set(resetRedisKey,
            JSON.stringify({
                verified: true
            }),
            "EX", 300
        )

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "otp verify successfully")
            )
    })
]

export const resetPassword = [
    check("email")
        .trim()
        .isEmail()
        .withMessage("email is invalid"),
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

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        const { email, password } = req.body

        const resetRedisKey = `resetPass:${email}`

        const redisUser = await redis.get(resetRedisKey)
        if (!redisUser) {
            throw new ApiErrors(410, 'time expired, try again')
        }

        const validationUser = JSON.parse(redisUser)
        if (!validationUser.verified) {
            throw new ApiErrors(401, 'email is not verified')
        }

        const hassPass = await bcrypt.hash(password, 12)

        const user = await Users.findOneAndUpdate(
            { email },
            { password: hassPass },
            { new: true }
        )

        if (!user) {
            throw new ApiErrors(500, "password reset failed")
        }

        const limitKey = `authLimit:${email}`
        await redis.del(limitKey)
        await redis.del(resetRedisKey)

        return res
            .status(200)
            .json(
                new ApiResponse(200, "password reset successfully")
            )
    })
]

export const login = [
    check("email")
        .trim()
        .isEmail()
        .withMessage("email is invalid"),
    check("password")
        .notEmpty()
        .withMessage("password is required")
        .trim()
        .isLength({ min: 8 })
        .withMessage('password does not matched')
        .matches(/[a-zA-Z]/)
        .withMessage('password does not matched')
        .matches(/[0-9]/)
        .withMessage('password does not matched'),

    AsyncHandler(async (req, res) => {
        const error = validationResult(req)
        if (!error.array()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        const { email, password } = req.body
        const limitKey = `authLimit:${email}`

        const count = await redis.incr(limitKey)

        if (count === 1) {
            await redis.expire(limitKey, 1800)
        }

        if (count > 10) {
            throw new ApiErrors(429, 'too many request')
        }

        const user = await Users.findOne({
            email: email
        })

        if (!user) {
            throw new ApiErrors(404, "user is not registered")
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            throw new ApiErrors(400, "password is not matched")
        }

        const safeUser = user.toObject()
        const { password: _password, ...userWithoutPassword } = safeUser

        const token = jwt.sign({
            userId: user._id,
            role: user.role
        },
            process.env.TOKEN_SECRET!,
            { expiresIn: (process.env.TOKEN_EXPIRY ?? '1d') as NonNullable<jwt.SignOptions['expiresIn']> }
        )

        const tokenOption = {
            httpOnly: true,
            secure: true,
            sameSite: 'none' as const,
            maxAge: 10 * 24 * 60 * 60 * 1000
        }

        return res
            .status(200)
            .cookie('token', token, tokenOption)
            .json(
                new ApiResponse(200, userWithoutPassword, "user logged in successfully")
            )
    })
]

export const logOut = AsyncHandler(async (req, res) => {
    const tokenOption = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        maxAge: 10 * 24 * 60 * 60 * 1000
    }

    return res
        .status(200)
        .clearCookie('token', tokenOption)
        .json(
            new ApiResponse(200, {}, 'user logout successfully')
        )
})