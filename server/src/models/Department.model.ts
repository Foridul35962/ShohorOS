import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },

    description: {
        type: String,
        default: "",
    },
    
}, { timestamps: true });

const Departments = mongoose.model("Departments", departmentSchema)
export default Departments