import express from "express"
import * as controller from "../controller/inspector.controller.js"
import protect from "../middlewares/protect.js"
import isInspector from "../middlewares/isInspector.js"

const inspectorRouter = express.Router()

inspectorRouter.get("/allocate-project", protect, isInspector, controller.getAllocatedProject)
inspectorRouter.get("/allocate-project-details/:projectId", protect, isInspector, controller.getAllocatedProject)

export default inspectorRouter