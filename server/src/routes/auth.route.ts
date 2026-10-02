import express from "express"
import * as controller from "../controller/auth.controller.js"
import { emailValidation, verifyOtp } from "../validations/authValidation.js"

const authRouter = express.Router()

authRouter.post("/citizen-regi", controller.registrationCitizen)
authRouter.post("/citizen-regi-veri", verifyOtp, controller.verifyCitizen)
authRouter.post("/forget-pass", emailValidation, controller.forgetPassword)
authRouter.post("/verify-forget-pass", verifyOtp, controller.verifyForgetPass)
authRouter.post("/reset-pass", controller.resetPassword)
authRouter.post("/login", controller.login)
authRouter.get("/logout", controller.logOut)

export default authRouter