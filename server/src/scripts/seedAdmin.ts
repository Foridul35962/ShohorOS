import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Users from "../models/Users.model.js";

const MONGO_URI = process.env.MONGODB_URL ?? "mongodb://localhost:27018/shohoros";

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        const password = "abcd12345";

        const hashedPassword = await bcrypt.hash(password, 10);

        const email = "admin@gmail.com"

        const existingAdmin = await Users.findOne({
            email
        });

        if (existingAdmin) {
            console.log("City admin already exists.");
            process.exit(0);
        }

        const admin = await Users.create({
            name: "ShohorOS Admin",
            email: email,
            password: hashedPassword,
            phoneNumber: "01700000000",
            role: "city-admin",
            district: "Dhaka"
        });

        console.log("City admin created successfully.");
        console.log("Email:", admin.email);
        console.log("Password:", password);

        process.exit(0);

    } catch (error) {
        console.error("Failed to seed admin:", error);
        process.exit(1);
    }
};

seedAdmin();