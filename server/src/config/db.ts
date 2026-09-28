import { Pool } from 'pg';
import dotenv from "dotenv";
dotenv.config()

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

export const connectDB = async (): Promise<void> => {
    try {
        const connect = await pool.connect();
        console.log('database connection successfully');
        connect.release()
    } catch (error) {
        console.log('database connection failed', error)
        process.exit(1);
    }
}

export default pool