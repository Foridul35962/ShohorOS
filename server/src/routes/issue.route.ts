import express from "express"
import * as controller from "../controller/issue.controller.js"
import protect from "../middlewares/protect.js"
import upload from "../middlewares/upload.js"
import { createIssuesValidation } from "../validations/issueValidation.js"

const issueRouter = express.Router()

issueRouter.post("/create", protect, upload.array("images", 5), createIssuesValidation, controller.createIssue)

export default issueRouter