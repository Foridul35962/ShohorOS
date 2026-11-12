import express from "express"
import * as controller from "../controller/officer.controller.js"
import isOfficer from "../middlewares/isOfficer.js"
import { allocatedInspectorValidation } from "../validations/officerValidation.js"

const officerRouter = express.Router()

officerRouter.get("/project/:projectId", isOfficer, controller.getDepartmentProject)
officerRouter.get("/available-inspector", isOfficer, controller.viewAllAvailableInspector)
officerRouter.post("/allocate-inspector", isOfficer, allocatedInspectorValidation, controller.allocateInspectorForProject)

export default officerRouter