import dotenv from "dotenv"
dotenv.config()
import app from "./src/app.js"
import { connectRedisDB } from "./src/config/redis.js"
import connectDB from "./src/config/db.js";

const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectRedisDB().then(() => {
            connectDB().then(() => {
                app.listen(port, () => {
                    console.log(`server is started at http://localhost:${port}`)
                })
            })
        })
    } catch (error) {
        console.log('server startup failed ', error)
        process.exit(1)
    }
}

startServer()