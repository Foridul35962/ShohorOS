import express from 'express'
import * as controller from '../controller/staff.controller.js'
import protect from '../middlewares/protect.js'
import isStaff from '../middlewares/isStaff.js'

const staffRouter = express.Router()

staffRouter.get("/all-allocated-project", protect, isStaff, controller.getAllAllocatedProject)
staffRouter.get("/project/:projectId", protect, isStaff, controller.getAllocatedProjectDetails)

export default staffRouter