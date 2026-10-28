import { ProjectStatus } from "./adminTypes";
import { IssueCategory, IssueStatus } from "./issueTypes";

export interface ProjectStaff {
    _id: string;
    name: string;
    email: string;
}

export interface ProjectProgressUpdate {
    _id: string;
    updatedBy: string;
    description: string;
    image: string[];
    progressPercentage: number;
    workDate: string;
    createdAt: string;
}

export interface ProjectCompletionSubmission {
    image: string[];
    description: string;
    submittedBy: string | null;
    submittedAt: string | null;
}

export interface ProjectIssueAddress {
    street: string;
    city: string;
    postalCode: string;
}

export interface ProjectIssue {
    _id: string;
    title: string;
    description: string;
    category: IssueCategory;
    district: string;
    address: ProjectIssueAddress;
    image: string[];
    status: IssueStatus;
}

export interface ContractorProject {
    _id: string;
    plannedDurationDays: number;
    plannedStartDate: string | null;
    plannedEndDate: string | null;
    status: ProjectStatus;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;

    projectStaff: ProjectStaff | null;
    progressUpdates: ProjectProgressUpdate[];
    completionSubmission: ProjectCompletionSubmission;
    issue: ProjectIssue;
}
