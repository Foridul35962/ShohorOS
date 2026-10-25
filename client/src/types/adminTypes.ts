import type { IssueAddress, IssueCategory, IssueImage, IssuePriority, IssueStatus } from "@/types/issueTypes";

export interface addMembersTypes {
    name: string
    email: string
    phoneNumber: string
    password: string
    district: string
    role: "moderator" | "department-officer" | "inspector",
    departmentCode?: "ROAD" | "DRAIN" | "WATER" | "ELEC" | "WASTE" | "BUILDING" | "PARK" | "TRAFFIC"
}

export interface Member {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role:
    | "moderator"
    | "department-officer"
    | "city-admin"
    | "inspector";
    profilePic?: {
        url?: string;
    };
    companyId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface MemberPagination {
    totalPages: number;
    totalUsers: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ViewAllMembersDataTypes {
    users: Member[];
    pagination: MemberPagination;
}

export type AuctionStatus =
    | "SCHEDULED"
    | "ACTIVE"
    | "ENDED"
    | "AWAITING_SELECTION"
    | "WINNER_SELECTED"
    | "CANCELLED";

export type BidStatus = "SUBMITTED" | "WITHDRAWN" | "ACCEPTED" | "REJECTED";

export type ProjectStatus =
    | "PLANNED"
    | "IN_PROGRESS"
    | "WORK_SUBMITTED"
    | "INSPECTION_FAILED"
    | "REVISION_REQUIRED"
    | "COMPLETED"
    | "CANCELLED";

export type InspectionResult = "PASSED" | "FAILED" | "NEEDS_REINSPECTION";

export interface AdminPerson {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
}

export interface AdminCompany {
    _id: string;
    companyName: string;
    registrationNumber?: string;
    description?: string;
    owner: string;
}

/* ---------- shared auction base ---------- */
export interface AuctionBase {
    _id: string;
    issueId: string;
    startsAt: string;
    deadline: string;
    status: AuctionStatus;
    winningBidId: string | null;
    selectedBy: string | null;
    selectedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

/* ---------- getIssueAdminDetails ---------- */
export interface AdminIssue {
    _id: string;
    title: string;
    description: string;
    category: IssueCategory;
    district: string;
    address: IssueAddress;
    location: { coordinates: [number, number] }; // [lon, lat]
    image: IssueImage[];
    reportedBy: AdminPerson | null;
    status: IssueStatus;
    priority?: IssuePriority | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectSummary {
    _id: string;
    issueId: string;
    contractorId: string;
    contractor: AdminPerson | null;
    status: ProjectStatus;
    plannedDurationDays: number;
    plannedStartDate: string | null;
    plannedEndDate: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IssueDetailsData {
    issue: AdminIssue;
    project: ProjectSummary | null;
    auction: (AuctionBase & { totalBids: number }) | null;
}

/* ---------- getAuctionDetails / getAuctionBids ---------- */
export interface AuctionBid {
    _id: string;
    auctionId: string;
    contractorId: string;
    proposedBudget: number;
    workPlan: string;
    estimatedDurationDays: number;
    status: BidStatus;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
    contractor: AdminPerson | null;
    company: AdminCompany | null;
}

export interface AuctionDetailsData extends Omit<AuctionBase, "selectedBy"> {
    issue: { _id: string; title: string; district: string; category: IssueCategory; status: IssueStatus };
    totalBids: number;
    winningBid: Omit<AuctionBid, "company"> | null;
    selectedBy: { _id: string; name: string; email: string } | null;
}

export interface AuctionBidsData {
    auction: AuctionBase & { issue: { _id: string; title: string; district: string; category: IssueCategory } };
    totalBids: number;
    bids: AuctionBid[];
}

/* ---------- getProjectMonitoringDetails ---------- */
export interface ProgressUpdate {
    _id: string;
    updatedBy: string;
    description: string;
    image: IssueImage[];
    progressPercentage: number;
    workDate: string;
    createdAt: string;
}

export interface CompletionSubmission {
    image: IssueImage[];
    description: string;
    submittedBy: string | null;
    submittedAt: string | null;
}

export interface Inspection {
    _id: string;
    projectId: string;
    inspectorId: string;
    visitDate: string;
    findings: string;
    image: IssueImage[];
    result: InspectionResult;
    correctionNote: string;
    reinspectionRequired: boolean;
    createdAt: string;
    inspector: AdminPerson | null;
}

export interface MonitorProject extends ProjectSummary {
    auctionId: string;
    selectedBidId: string;
    progressUpdates: ProgressUpdate[];
    completionSubmission: CompletionSubmission;
    issue: {
        _id: string;
        title: string;
        description: string;
        category: IssueCategory;
        district: string;
        address: IssueAddress;
        image: IssueImage[];
        status: IssueStatus;
    };
}

export interface ProjectMonitorData {
    project: MonitorProject;
    inspections: Inspection[];
    totalInspections: number;
}