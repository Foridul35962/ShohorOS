import express from "express"
import * as controller from "../controller/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/citizen-regi", controller.registrationCitizen)
authRouter.post("/citizen-regi-veri", controller.verifyCitizen)

export default authRouter