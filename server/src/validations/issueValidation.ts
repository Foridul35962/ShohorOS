import { check, validationResult } from "express-validator";
import ApiErrors from "../helpers/ApiErrors.js";
import AsyncHandler from "../helpers/AsyncHandler.js";

export const createIssuesValidation = [
    check("title")
        .isString()
        .withMessage("Issue title must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Issue title is required")
        .bail()
        .isLength({ max: 200 })
        .withMessage("Issue title must not exceed 200 characters"),

    check("description")
        .isString()
        .withMessage("Issue description must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Issue description is required")
        .bail()
        .isLength({ max: 5000 })
        .withMessage("Issue description must not exceed 5000 characters"),

    check("category")
        .isString()
        .withMessage("Category must be a string")
        .bail()
        .trim()
        .toUpperCase()
        .isIn([
            "ROAD",
            "DRAIN",
            "WATER",
            "ELEC",
            "WASTE",
            "BUILDING",
            "PARK",
            "TRAFFIC",
        ])
        .withMessage("Invalid issue category"),

    check("address.street")
        .isString()
        .withMessage("Street must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Street name is required"),

    check("address.city")
        .isString()
        .withMessage("City must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("City name is required"),

    check("address.postalCode")
        .isString()
        .withMessage("Postal code must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Postal code is required"),

    check("location.lat")
        .notEmpty()
        .withMessage("Latitude is required")
        .bail()
        .isFloat({ min: -90, max: 90 })
        .withMessage("Latitude must be between -90 and 90")
        .toFloat(),

    check("location.lon")
        .notEmpty()
        .withMessage("Longitude is required")
        .bail()
        .isFloat({ min: -180, max: 180 })
        .withMessage("Longitude must be between -180 and 180")
        .toFloat(),

    AsyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new ApiErrors(400, "invalid value", errors.array() as unknown as never[])
        }

        next()
    })
];