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

export const UpdateProjectValidation = [
    check("projectId")
        .notEmpty()
        .withMessage("Project ID is required")
        .isMongoId()
        .withMessage("Invalid project ID"),
        
    check("description")
        .exists()
        .withMessage("Description is required")
        .bail()
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty")
        .bail()
        .isLength({ max: 2000 })
        .withMessage("Description cannot exceed 2000 characters"),

    check("progressPercentage")
        .exists()
        .withMessage("Progress percentage is required")
        .bail()
        .notEmpty()
        .withMessage("Progress percentage cannot be empty")
        .bail()
        .isFloat({ min: 0, max: 100 })
        .withMessage("Progress percentage must be between 0 and 100")
        .bail()
        .toFloat(),

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

export const SubmitProjectValidation = [
    check("projectId")
        .notEmpty()
        .withMessage("Project ID is required")
        .isMongoId()
        .withMessage("Invalid project ID"),
        
    check("description")
        .exists()
        .withMessage("Description is required")
        .bail()
        .isString()
        .withMessage("Description must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Description cannot be empty")
        .bail()
        .isLength({ max: 2000 })
        .withMessage("Description cannot exceed 2000 characters"),

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
