import { check, validationResult } from "express-validator";
import AsyncHandler from "../helpers/AsyncHandler.js";
import ApiErrors from "../helpers/ApiErrors.js";
import { DISTRICTS } from "../constant/common.js";

export const createIssuesValidation = [
    check("title")
        .trim()
        .notEmpty()
        .withMessage("issue title is required")
        .isLength({ max: 200 })
        .withMessage("issue title must be under 200 character"),

    check("description")
        .trim()
        .notEmpty()
        .withMessage("issue description is required")
        .isLength({ max: 5000 })
        .withMessage("issue description must be under 5000 character"),

    check("category")
        .trim()
        .toUpperCase()
        .notEmpty()
        .withMessage("category is required")
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
        .withMessage("invalid category"),

    check("district")
        .notEmpty()
        .withMessage("district is required")
        .isIn(DISTRICTS)
        .withMessage("invalid districts"),

    check("address.street")
        .trim()
        .notEmpty()
        .withMessage('street name is required'),

    check("address.city")
        .trim()
        .notEmpty()
        .withMessage('city name is required'),

    check("address.postalCode")
        .trim()
        .notEmpty()
        .withMessage('postalCode is required'),

    check("location.lat")
        .notEmpty()
        .withMessage("latitude is required"),

    check("location.lon")
        .notEmpty()
        .withMessage("longitude is required"),

    AsyncHandler(async (req, res, next) => {
        const error = validationResult(req)

        if (!error.isEmpty()) {
            throw new ApiErrors(400, "invalid value", error.array() as unknown as never[])
        }

        next()
    })
]