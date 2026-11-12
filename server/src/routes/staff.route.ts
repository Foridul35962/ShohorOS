import express from 'express'
import * as controller from '../controller/staff.controller.js'
import protect from '../middlewares/protect.js'
import isStaff from '../middlewares/isStaff.js'
import upload from '../middlewares/upload.js'
import { SubmitProjectValidation, UpdateProjectValidation } from '../validations/projectValidation.js'

const staffRouter = express.Router()

staffRouter.get("/all-allocated-project", protect, isStaff, controller.getAllAllocatedProject)
staffRouter.get("/project/:projectId", protect, isStaff, controller.getAllocatedProjectDetails)
staffRouter.patch("/update-project", protect, isStaff, upload.array("images", 5), UpdateProjectValidation, controller.projectProgressUpdates)
staffRouter.patch("/submit-project", protect, isStaff, upload.array("images", 5), SubmitProjectValidation, controller.submitProject)

export default staffRouter