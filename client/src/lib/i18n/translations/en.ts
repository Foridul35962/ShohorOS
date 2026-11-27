import adminEn from "./admin-en";
import adminOpsEn from "./adminOps-en";
import auctionListEn from "./auctionList-en";
import authEn from "./auth-en";
import cityHomeEn from "./cityHome-en";
import contractorEn from "./contractor-en";
import contractorProjectsEn from "./contractorProjects-en";
import dashboardEn from "./dashboard-en";
import inspectionsPanelEn from "./inspectionsPanel-en";
import inspectorEn from "./inspector-en";
import issueDetailEn from "./issueDetail-en";
import issueListEn from "./issueList-en";
import issuesEn from "./issues-en";
import moderatorEn from "./moderator-en";
import notificationEn from "./notification-en";
import officerProjectEn from "./officerProject-en";
import staffEn from "./staff-en";
import staffProjectDetailEn from "./staffProjectDetail-en";
import staffProjectsEn from "./staffProjects-en";

const en = {
  meta: { title: "ShohorOS — Follow every city problem until it's fixed", description: "Civic technology for Bangladesh: from citizen report to inspector-verified resolution." },
  nav: { register: "Sign up", features: "Features", board: "Issue board", faq: "FAQ", menu: "Menu", how: "How it works", ecosystem: "Who's involved", outcome: "Outcome", login: "Log in", report: "Report a problem", theme: "Toggle theme", language: "Language", skip: "Skip to content" },
  problem: {
    title: "The city is full of problems. The paths to fixing them are scattered.",
    body: "Citizens see them every day. It's unclear where to report, ownership is vague, progress is invisible, and nobody can verify the work.",
    items: ["Broken roads", "Waterlogging", "Drainage", "Garbage", "Street lights", "Electricity"],
  },
  board: {
    title: "Every issue, at a glance.",
    sub: "A live board shows where each report stands, across wards, departments and contractors.",
    window: "ShohorOS · Issue board", note: "Sample data for illustration.", progress: "Progress",
    status: { all: "All", review: "Under review", building: "In progress", inspect: "Inspection", resolved: "Resolved" },
    tickets: [
      { id: "SH-2041", title: "Broken road, Mirpur 10", area: "Mirpur", s: "review", p: 15 },
      { id: "SH-2038", title: "Waterlogging, Mohammadpur bus stand", area: "Mohammadpur", s: "building", p: 55 },
      { id: "SH-2033", title: "Street lights out, Dhanmondi 27", area: "Dhanmondi", s: "inspect", p: 85 },
      { id: "SH-2029", title: "Overflowing drain, Uttara Sector 7", area: "Uttara", s: "building", p: 60 },
      { id: "SH-2024", title: "Garbage pile, Karwan Bazar", area: "Tejgaon", s: "resolved", p: 100 },
      { id: "SH-2019", title: "Damaged footpath, Gulshan 1", area: "Gulshan", s: "resolved", p: 100 },
    ],
  },
  faq: {
    title: "Questions, answered.",
    sub: "The short version of how ShohorOS works for citizens and for the people who fix the city.",
    items: [
      { q: "Who can report a problem?", a: "Any citizen. Add a photo, pin the location and describe what is wrong." },
      { q: "What happens after I report?", a: "A moderator reviews it, then the right department takes ownership and opens a project. You can follow every stage." },
      { q: "How are contractors chosen?", a: "Verified contractors submit bids on scope, cost and time, and the department selects one through a transparent process." },
      { q: "Who confirms the work is really done?", a: "An inspector verifies the finished work against the agreed scope before the issue is closed." },
      { q: "Can I see what happened on any report?", a: "Yes. Every issue keeps a public trail of who did what, and when." },
      { q: "Is it available in Bangla?", a: "Yes. ShohorOS works in Bangla and English, with light and dark themes." },
    ],
  },
  auth: authEn,
  moderator: moderatorEn,
  admin: adminEn,
  issues: issuesEn,
  issueDetail: issueDetailEn,
  issueList: issueListEn,
  adminOps: adminOpsEn,
  contractor: contractorEn,
  auctionList: auctionListEn,
  notifications: notificationEn,
  staff: staffEn,
  contractorProjects: contractorProjectsEn,
  staffProjects: staffProjectsEn,
  staffProjectDetail: staffProjectDetailEn,
  officerProject: officerProjectEn,
  inspectionsPanel: inspectionsPanelEn,
  inspector: inspectorEn,
  cityHome: cityHomeEn,
  dashboard: dashboardEn,
  footer: { blurb: "Follow every city problem from the first report to a verified fix.", tagline: "Civic technology for Bangladesh.", cols: [{ h: "Platform", links: [{ l: "How it works", h: "/#how" }, { l: "Features", h: "/#features" }, { l: "Issue board", h: "/#board" }] }, { h: "Community", links: [{ l: "Who's involved", h: "/#who" }, { l: "FAQ", h: "/#faq" }, { l: "Report a problem", h: "/registration/citizen" }] }], rights: "© 2026 ShohorOS. All rights reserved." },
};
export default en;
