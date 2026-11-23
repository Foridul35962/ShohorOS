import express from "express"
import * as controller from "../controller/inspector.controller.js"
import protect from "../middlewares/protect.js"
import isInspector from "../middlewares/isInspector.js"
import upload from "../middlewares/upload.js"
import { setReportValidation } from "../validations/inspectionValidation.js"

const inspectorRouter = express.Router()

inspectorRouter.get("/allocated-project", protect, isInspector, controller.getAllocatedProject)
inspectorRouter.get("/allocated-project-details/:projectId", protect, isInspector, controller.getAllocatedProjectDetails)
inspectorRouter.patch("/set-report", protect, isInspector, upload.array("images", 5), setReportValidation, controller.setReport)

export default inspectorRouter