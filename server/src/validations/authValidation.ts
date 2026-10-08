import { check, validationResult } from "express-validator";
import AsyncHandler from "../helpers/AsyncHandler.js";
import ApiErrors from "../helpers/ApiErrors.js";
import { DISTRICTS } from "../constant/common.js";

export const registrationMemberValidation = [
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
    check("role")
        .notEmpty()
        .withMessage("role is required")
        .isIn([
            "moderator",
            "department-officer",
            "contractor",
            "inspector"
        ])
        .withMessage("invalid role"),

    AsyncHandler(async (req, res, next) => {
        const error = validationResult(req)

        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        next()
    })
]

export const verifyOtp = [
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

    AsyncHandler(async (req, res, next) => {
        const error = validationResult(req)

        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        next()
    })
]

export const emailValidation = [
    check('email')
        .trim()
        .notEmpty()
        .withMessage("email must be required")
        .isEmail()
        .withMessage("invalid email id"),

    AsyncHandler(async (req, res, next) => {
        const error = validationResult(req)

        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        next()
    })
]

export const requestCompanyValidation = [
    check("companyName")
        .trim()
        .notEmpty()
        .withMessage("name is required"),
    check("registrationNumber")
        .trim()
        .notEmpty()
        .withMessage("name is required"),
    check("description")
        .optional()
        .trim(),
    check("address.house")
        .trim()
        .notEmpty()
        .withMessage('house name is required'),
    check("address.street")
        .trim()
        .notEmpty()
        .withMessage('street name is required'),
    check("address.district")
        .trim()
        .notEmpty()
        .withMessage('district name is required')
        .isIn(DISTRICTS)
        .withMessage("invalid districts"),
    check("address.postalCode")
        .trim()
        .notEmpty()
        .withMessage('postalCode is required'),
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

    AsyncHandler(async (req, res, next) => {
        const error = validationResult(req)

        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        next()
    })
]

export const resendOtpValidation = [
    check('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid Email'),
    check('topic')
        .trim()
        .notEmpty()
        .withMessage('topic is required'),

    AsyncHandler(async (req, res, next) => {
        const error = validationResult(req)

        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        next()
    })
]