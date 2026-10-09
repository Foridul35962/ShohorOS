import express from "express"
import * as controller from "../controller/admin.controller.js"
import protect from "../middlewares/protect.js"
import isAdmin from "../middlewares/isAdmin.js"
import { registrationMemberValidation, verifyOtp } from "../validations/authValidation.js"

const adminRouter = express.Router()

adminRouter.post("/add-members", protect, isAdmin, registrationMemberValidation, controller.addMembers)
adminRouter.post("/verify-member", protect, isAdmin, verifyOtp, controller.verifyMemberMail)
adminRouter.delete("/member/:userId", protect, isAdmin, controller.deleteMember)
adminRouter.get("/all-member", protect, isAdmin, controller.viewAllMembers)

export default adminRouter