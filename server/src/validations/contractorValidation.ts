import { check, validationResult } from "express-validator";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

const validateBidRequest = AsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiErrors(
            400,
            "Invalid bid data",
            errors.array() as unknown as never[]
        );
    }

    next();
});

export const createIssueBidsValidation = [
    check("auctionId")
        .notEmpty()
        .withMessage("Auction ID is required")
        .isMongoId()
        .withMessage("Invalid auction ID"),

    check("proposedBudget")
        .notEmpty()
        .withMessage("Proposed budget is required")
        .isFloat({ gt: 0 })
        .withMessage("Budget must be greater than 0")
        .toFloat(),

    check("workPlan")
        .isString()
        .withMessage("Work plan must be a string")
        .trim()
        .notEmpty()
        .withMessage("Work plan is required")
        .isLength({ max: 10000 })
        .withMessage("Work plan must not exceed 10000 characters"),

    check("estimatedDurationDays")
        .notEmpty()
        .withMessage("Estimated duration is required")
        .isInt({ min: 1 })
        .withMessage("Duration must be a positive integer")
        .toInt(),

    validateBidRequest,
];

export const editIssueBidsValidation = [
    check("auctionId")
        .notEmpty()
        .withMessage("Auction ID is required")
        .isMongoId()
        .withMessage("Invalid auction ID"),

    check("bidId")
        .notEmpty()
        .withMessage("Bid ID is required")
        .isMongoId()
        .withMessage("Invalid bid ID"),

    check("proposedBudget")
        .optional()
        .isFloat({ gt: 0 })
        .withMessage("Budget must be greater than 0")
        .toFloat(),

    check("workPlan")
        .optional()
        .isString()
        .withMessage("Work plan must be a string")
        .trim()
        .notEmpty()
        .withMessage("Work plan cannot be empty")
        .isLength({ max: 10000 })
        .withMessage("Work plan must not exceed 10000 characters"),

    check("estimatedDurationDays")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Duration must be a positive integer")
        .toInt(),

    validateBidRequest,
];