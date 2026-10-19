export type IssueCategory =
  | "ROAD"
  | "DRAIN"
  | "WATER"
  | "ELEC"
  | "WASTE"
  | "BUILDING"
  | "PARK"
  | "TRAFFIC";

export type IssueStatus =
  | "REPORTED"
  | "UNDER_REVIEW"
  | "REJECTED"
  | "APPROVED"
  | "PROJECT_CREATED"
  | "IN_PROGRESS"
  | "AWAITING_INSPECTION"
  | "REVISION_REQUIRED"
  | "RESOLVED"
  | "CANCELLED";

export type IssuePriority = 1 | 2 | 3 | 4 | 5;

export interface IssueImage {
  url: string;
}

export interface IssueAddress {
  street: string;
  city: string;
  postalCode: string;
}

export interface IssueLocation {
  type?: "Point";
  coordinates: [number, number];
}

export interface IssueProject {
  _id: string;
  completionSubmission?: {
    image?: IssueImage[];
  };
}

export interface IssueTypes {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  district: string;
  address: IssueAddress;
  location: IssueLocation;
  image: IssueImage[];
  status: IssueStatus;
  projectId: IssueProject | string | null;
  priority?: IssuePriority | null;
  createdAt: string;
  updatedAt: string;
}

// all issue

export interface AllIssueItem {
  _id: string;
  title: string;
  category: IssueCategory;
  address: IssueAddress;
  createdAt: string;
  status: IssueStatus;
}

export interface IssuePagination {
  totalPages: number;
  totalIssues: number;
  currentPage: number;
  limit: number;
}

export interface GetAllIssueResponse {
  issues: AllIssueItem[];
  pagination: IssuePagination;
}