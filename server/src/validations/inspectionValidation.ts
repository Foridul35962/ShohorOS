import { check, validationResult } from "express-validator"
import AsyncHandler from "../helpers/AsyncHandler.js"
import ApiErrors from "../helpers/ApiErrors.js"

export const setReportValidation = [
    check("projectId")
        .notEmpty()
        .withMessage("projectId is required")
        .isMongoId()
        .withMessage("invalid project id"),

    check("findings")
        .trim()
        .notEmpty()
        .withMessage("findings is required"),

    check("result")
        .notEmpty()
        .withMessage("result is required")
        .trim()
        .toUpperCase()
        .isIn(["PASSED", "FAILED", "NEEDS_REINSPECTION"])
        .withMessage("invalid result"),

    check("correctionNote")
        .optional()
        .trim(),

    check("reinspectionRequired")
        .notEmpty()
        .withMessage("reinspectionRequired is required")
        .isBoolean()
        .withMessage("invalid reinspectionRequired")
        .toBoolean(),

    AsyncHandler(async (req, res, next) => {
        const error = validationResult(req)

        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        next()
    })
]