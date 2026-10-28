import { check, validationResult } from "express-validator";
import AsyncHandler from "../helpers/AsyncHandler.js";
import ApiErrors from "../helpers/ApiErrors.js";

export const startProjectValidation = [
    check("projectId")
        .notEmpty()
        .withMessage("Project ID is required")
        .isMongoId()
        .withMessage("Invalid project ID"),

    check("staffId")
        .notEmpty()
        .withMessage("Staff ID is required")
        .isMongoId()
        .withMessage("Invalid staff ID"),

    check("startDate")
        .notEmpty()
        .withMessage("Start date is required")
        .isISO8601({ strict: true })
        .withMessage("Start date must be a valid ISO 8601 date"),

    AsyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new ApiErrors(
                400,
                "Invalid value",
                errors.array() as unknown as never[]
            );
        }

        next();
    }),
];
