import { ProjectStatus } from "./adminTypes";
import { IssueCategory, IssueImage, IssueStatus } from "./issueTypes";

export interface DashboardStatistics {
    totalIssues: number;
    pendingIssues: number;
    inProgressIssues: number;
    resolvedIssues: number;
    rejectedIssues: number;
}


export interface IssueDepartment {
    name: string;
    code: string;
}

export interface ProgressUpdate {
    description: string;
    progressPercentage: number;
    workDate: string;
    image: IssueImage[];
}

export interface CompletionSubmission {
    description: string;
    submittedAt: string | null;
    image: IssueImage[];
}

export interface CitizenProject {
    _id: string;
    status: ProjectStatus;
    currentProgress: number;
    plannedStartDate: string | null;
    plannedEndDate: string | null;
    completedAt: string | null;
    progressUpdates: ProgressUpdate[];
    completionSubmission: CompletionSubmission;
}

export interface CitizenIssue {
    _id: string;
    title: string;
    description: string;
    category: IssueCategory;
    status: IssueStatus;
    district: string;

    address: {
        street: string;
        city: string;
        postalCode: string;
    };

    image: IssueImage[];

    createdAt: string;
    updatedAt: string;

    department: IssueDepartment | null;
    project: CitizenProject | null;
}

export interface CitizenDashboardData {
    statistics: DashboardStatistics;
    recentIssues: CitizenIssue[];
}