import express from "express"
import * as controller from "../controller/officer.controller.js"
import isOfficer from "../middlewares/isOfficer.js"
import { allocatedInspectorValidation } from "../validations/officerValidation.js"
import protect from "../middlewares/protect.js"

const officerRouter = express.Router()

officerRouter.get("/project/:projectId", protect, isOfficer, controller.getDepartmentProject)
officerRouter.get("/available-inspector", protect, isOfficer, controller.viewAllAvailableInspector)
officerRouter.post("/allocate-inspector", protect, isOfficer, allocatedInspectorValidation, controller.allocateInspectorForProject)

export default officerRouter