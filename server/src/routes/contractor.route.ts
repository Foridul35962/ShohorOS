import express from "express"
import * as controller from "../controller/contractor.controller.js"
import protect from "../middlewares/protect.js"
import isContractor from "../middlewares/isContractor.js"
import * as projectController from "../controller/project.controller.js"

const contractorRouter = express.Router()

contractorRouter.get("/issues", protect, isContractor, controller.getAllIssuesForContractor)
contractorRouter.get("/issue/:issueId", protect, isContractor, controller.getIssueForContractor)
contractorRouter.post("/add-bid", protect, isContractor, controller.addIssueBid)
contractorRouter.patch("/edit-bid", protect, isContractor, controller.editIssueBid)
contractorRouter.patch("/withdrow-bid", protect, isContractor, controller.withdrowBid)
contractorRouter.patch("/reset-bid", protect, isContractor, controller.resetBid)
contractorRouter.get("/all-projects", protect, isContractor, projectController.getAllMyProjects)
contractorRouter.get("/project/:projectId", protect, isContractor, projectController.getProject)
contractorRouter.patch("/start-project", protect, isContractor, projectController.startProject)

export default contractorRouter