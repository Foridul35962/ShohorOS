import dotenv from "dotenv"
dotenv.config()
import app from "./src/app.js"
import { connectRedisDB } from "./src/config/redis.js"
import connectDB from "./src/config/db.js";
import { Server } from 'socket.io';
import http from "http"
import { socketHandler } from './src/config/socket.js';

const port = process.env.PORT || 5000;

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
})

app.set('io', io);

socketHandler(io)

const startServer = async () => {
    try {
        await connectRedisDB().then(() => {
            connectDB().then(() => {
                server.listen(port, () => {
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