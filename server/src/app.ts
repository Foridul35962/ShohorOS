import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import morgan from "morgan"
import errorHandler from "./helpers/ErrorHandler.js"
import authRouter from "./routes/auth.route.js"
import moderatorRouter from "./routes/moderator.route.js"
import adminRouter from "./routes/admin.route.js"

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

app.use("/api/auth", authRouter)
app.use("/api/moderator", moderatorRouter)
app.use("/api/admin", adminRouter)

app.get("/", (req, res) => {
    res.send("shohorOS server is running...")
})

app.use(errorHandler)

export default app