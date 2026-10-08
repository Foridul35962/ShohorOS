import express from "express"
import * as controller from "../controller/auth.controller.js"
import {
    emailValidation,
    requestCompanyValidation,
    resendOtpValidation,
    verifyOtp
} from "../validations/authValidation.js"
import protect from "../middlewares/protect.js"

const authRouter = express.Router()

authRouter.post("/citizen-regi", controller.registrationCitizen)
authRouter.post("/citizen-regi-veri", verifyOtp, controller.verifyCitizen)
authRouter.post("/forget-pass", emailValidation, controller.forgetPassword)
authRouter.post("/verify-forget-pass", verifyOtp, controller.verifyForgetPass)
authRouter.post("/reset-pass", controller.resetPassword)
authRouter.post("/login", controller.login)
authRouter.get("/logout", controller.logOut)
authRouter.post("/contractor-regi", requestCompanyValidation, controller.registrationContractor)
authRouter.post("/contractor-regi-veri", verifyOtp, controller.verifyConstractor)
authRouter.get("/me", protect, controller.fetchUser)
authRouter.post("/resend-otp", resendOtpValidation, controller.resendOtp)

export default authRouter