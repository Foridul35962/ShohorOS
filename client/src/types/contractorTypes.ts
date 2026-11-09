import { ProjectStatus } from "./adminTypes"
import { IssueAddress, IssueCategory, IssueStatus } from "./issueTypes"

export interface addBidType {
    auctionId: string,
    proposedBudget: number,
    workPlan: string,
    estimatedDurationDays: number,
}

export interface editBidType {
    bidId: string
    auctionId: string
    proposedBudget?: number
    workPlan?: string
    estimatedDurationDays?: number
}


export type AuctionStatus =
    | "SCHEDULED"
    | "ACTIVE"
    | "ENDED"
    | "AWAITING_SELECTION"
    | "WINNER_SELECTED"
    | "CANCELLED";

export type BidStatus =
    | "SUBMITTED"
    | "WITHDRAWN"
    | "ACCEPTED"
    | "REJECTED";


export interface IssueAuctionSummary {
    _id: string;
    deadline: string;
    status: AuctionStatus;
}

export interface IssueAuctionDetails extends IssueAuctionSummary {
    startsAt: string;
    winningBidId: string | null;
    selectedBy: string | null;
    selectedAt: string | null;
    createdAt: string;
}

export interface ContractorBid {
    _id: string;
    proposedBudget: number;
    workPlan: string;
    estimatedDurationDays: number;
    status: BidStatus;
    submittedAt: string;
}

export interface ContractorIssueListItem {
    _id: string;
    title: string;
    category: IssueCategory;
    address: IssueAddress;
    createdAt: string;
    district: string;
    auction: IssueAuctionSummary;
}

export interface ContractorIssueDetails {
    _id: string;
    title: string;
    description: string;
    category: IssueCategory;
    district: string;
    address: IssueAddress;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    image: {
        url: string;
    }[];
    createdAt: string;
    auction: IssueAuctionDetails;
    myBid: ContractorBid | null;
}

export interface IssuePagination {
    currentPage: number;
    limit: number;
    totalIssues: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export type GetAllIssuesForContractorResponse = {
    issues: ContractorIssueListItem[];
    pagination: IssuePagination;
};

export interface addBidResponseType {
    _id: string
    contractorId: string,
    auctionId: string,
    proposedBudget: number,
    workPlan: string,
    estimatedDurationDays: string,
    status: string,
    submittedAt: string,
}

// my all project

export interface ProjectIssue {
    _id: string;
    title: string;
    category: IssueCategory;
    district: string;
    address: IssueAddress;
    status: IssueStatus;
}

export interface MyProject {
    _id: string;
    auctionId: string;
    selectedBidId: string;
    plannedDurationDays: number;
    plannedStartDate: string | null;
    plannedEndDate: string | null;
    status: ProjectStatus;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;
    issue: ProjectIssue;
}

export interface ProjectPagination {
    currentPage: number;
    limit: number;
    totalProjects: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface MyProjectsData {
    projects: MyProject[];
    pagination: ProjectPagination;
}

export interface addStaffType {
    name: string
    email: string
    password: string
    phoneNumber: string
    district: string
}

//get staff
export interface AssignedProject {
    _id: string;
    issueId: string;
    status: string;
    plannedStartDate: string | null;
    plannedEndDate: string | null;
    plannedDurationDays: number;
    createdAt: string;
}

export interface CompanyStaff {
    _id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: "project-staff";
    district: string;
    profilePic?: {
        url?: string;
    };
    companyId: string;
    isWorkingOnProject: boolean;
    assignedProjects: AssignedProject[];
    createdAt: string;
    updatedAt: string;
}

export interface CompanyDetails {
    _id: string;
    companyName: string;
    registrationNumber: string;
    description?: string;
    address: {
        house: string;
        street: string;
        postalCode: string;
        district: string;
    };
    image?: {
        url?: string;
    };
}

export interface StaffPagination {
    totalStaff: number;
    currentPage: number;
    totalPages: number;
    limit: number;
}

export interface GetAllStaffResponse {
    company: CompanyDetails;
    staff: CompanyStaff[];
    pagination: StaffPagination;
}

export interface AvailableStaff {
    _id: string;
    name: string;
    district: string;
    profilePic?: {
        url?: string;
    };
}

export interface GetAvailableStaffResponse {
    staff: AvailableStaff[];
    pagination: StaffPagination;
}