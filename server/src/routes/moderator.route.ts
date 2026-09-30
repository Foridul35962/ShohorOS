import express from "express"
import * as controller from "../controller/moderator.controller.js"
import protect from "../middlewares/protect.js"
import isModerator from "../middlewares/isModerator.js"

const moderatorRouter = express.Router()

moderatorRouter.get("/request-citizen", protect, isModerator, controller.viewAllRequestCitizen)
moderatorRouter.post("/accept-citizen", protect, isModerator, controller.acceptCitizen)
moderatorRouter.post("/reject-citizen", protect, isModerator, controller.rejectCitizen)

export default moderatorRouter