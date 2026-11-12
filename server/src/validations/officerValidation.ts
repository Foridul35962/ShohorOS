import { check, validationResult } from "express-validator";
import AsyncHandler from "../helpers/AsyncHandler.js";
import ApiErrors from "../helpers/ApiErrors.js";

export const allocatedInspectorValidation = [
    check("projectId")
        .notEmpty()
        .withMessage("Project ID is required")
        .isMongoId()
        .withMessage("Invalid project ID"),

    check("inspectorId")
        .notEmpty()
        .withMessage("inspector ID is required")
        .isMongoId()
        .withMessage("Invalid inspector ID"),

    check("date")
        .notEmpty()
        .withMessage("date is required")
        .isISO8601({ strict: true })
        .withMessage("date must be a valid ISO 8601 date"),

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