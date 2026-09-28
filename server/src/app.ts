import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import morgan from "morgan"
import type { Request, Response } from "express"
import pool from "./config/db.js"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(morgan("dev"))

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

app.use(limiter);

app.get("/", (req, res) => {
    res.send("shohorOS server is running...")
})

app.get("/health", async (req: Request, res: Response) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            success: true,
            status: "healthy",
            services: {
                api: "up",
                database: "up",
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Health check failed:", error);
        res.status(503).json({
            success: false,
            status: "unhealthy",
            services: {
                api: "up",
                database: "down",
            },
            timestamp: new Date().toISOString(),
        });
    }
})

export default app