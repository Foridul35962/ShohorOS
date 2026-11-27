import express from "express"
import * as controller from "../controller/dashboard.controller.js"
import protect from "../middlewares/protect.js"

const dashboardRouter = express.Router()

dashboardRouter.get('/citizen', protect, controller.citizenDashboard)

export default dashboardRouter