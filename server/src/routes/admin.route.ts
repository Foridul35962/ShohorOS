import express from "express"
import * as controller from "../controller/admin.controller.js"
import protect from "../middlewares/protect.js"
import isAdmin from "../middlewares/isAdmin.js"
import { registrationMemberValidation, verifyOtp } from "../validations/authValidation.js"

const adminRouter = express.Router()

adminRouter.post("/add-members", protect, isAdmin, registrationMemberValidation, controller.addMembers)
adminRouter.post("/verify-member", protect, isAdmin, verifyOtp, controller.verifyMemberMail)
adminRouter.delete("/member/:userId", protect, isAdmin, controller.deleteMember)
adminRouter.get("/all-member", protect, isAdmin, controller.viewAllMembers)
adminRouter.get("/issue-details/:issueId", protect, isAdmin, controller.getIssueDetails)
adminRouter.post("/start-auction/:issueId", protect, isAdmin, controller.startAuction)
adminRouter.get("/auction-details/:auctionId", protect, isAdmin, controller.getAuctionDetails)
adminRouter.get("/auction-bits/:auctionId", protect, isAdmin, controller.getAuctionBids)
adminRouter.post("/auction-winner/:auctionId", protect, isAdmin, controller.selectAuctionWinner)
adminRouter.get("/project-monitor/:projectId", protect, isAdmin, controller.getProjectMonitoringDetails)
adminRouter.get("/all-auctions", protect, isAdmin, controller.getAllAuctions)

export default adminRouter