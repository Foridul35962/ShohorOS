import type { ErrorRequestHandler } from "express";
import ApiErrors from "./ApiErrors.js";

const errorHandler: ErrorRequestHandler = (
    error: ApiErrors,
    req,
    res,
    next
) => {
    const statusCode = error.status || 500;

    return res
        .status(statusCode)
        .json({
            success: error.success || false,
            message: error.message || "Internal server error",
            error: error.error || [],
            data: null
        });
};

export default errorHandler;