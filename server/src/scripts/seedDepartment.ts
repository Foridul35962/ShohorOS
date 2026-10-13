import mongoose from "mongoose";
import Departments from "../models/Department.model.js";
import { DEPERTMENTS } from "../constant/common.js";

export const seedDepartments = async () => {
    const operations = DEPERTMENTS.map((department) => ({
        updateOne: {
            filter: { code: department.code },
            update: {
                $setOnInsert: department,
            },
            upsert: true,
        },
    }));

    const result = await Departments.bulkWrite(operations);

    console.log("Department seeding completed.");
    console.log(`Departments configured: ${DEPERTMENTS.length}`);
    console.log(`New departments inserted: ${result.upsertedCount}`);
};

const MONGO_URI = process.env.MONGODB_URL ?? "mongodb://localhost:27018/shohoros";

const run = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        await seedDepartments();
    } catch (error) {
        console.error("Department seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

run();