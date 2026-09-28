import dotenv from "dotenv"
dotenv.config()
import app from "./src/app.js"
import { connectDB } from "./src/config/db.js"
import { connectRedisDB } from "./src/config/redis.js"

const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectRedisDB()
        await connectDB()

        app.listen(port, () => {
            console.log('server is running at port: ', port)
        })
    } catch (error) {
        console.log('server startup failed ', error)
        process.exit(1)
    }
}

startServer()