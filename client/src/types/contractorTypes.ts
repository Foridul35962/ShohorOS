import { IssueAddress, IssueCategory } from "./issueTypes"

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
    _id:string
    contractorId: string,
    auctionId: string,
    proposedBudget: number,
    workPlan: string,
    estimatedDurationDays: string,
    status: string,
    submittedAt: string,
}