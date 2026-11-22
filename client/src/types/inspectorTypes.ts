import { AdminPerson, InspectionResult, ProjectStatus } from "./adminTypes";
import { IssueAddress, IssueCategory, IssueImage } from "./issueTypes";

export interface setReportType {
    projectId: string,
    findings: string,
    result: "PASSED" | "FAILED" | "NEEDS_REINSPECTION",
    correctionNote: string,
    reinspectionRequired: boolean
}

/* =========================================
   ISSUE DETAILS
========================================= */

export interface ProjectIssueDetails {
    _id: string;
    title: string;
    description: string;
    category: IssueCategory;
    district: string;
    address: IssueAddress;
    image: IssueImage[];
    status: string;
}


/* =========================================
   INSPECTION DETAILS
========================================= */

export interface InspectionDetails {
    _id: string;
    projectId: string;
    inspectorId: string;
    visitDate: string;
    findings: string;
    image: IssueImage[];
    result: InspectionResult | null;
    correctionNote: string;
    reinspectionRequired: boolean;
    inspector?: AdminPerson;
    createdAt: string;
    updatedAt: string;
}


/* =========================================
   PROJECT DETAILS
========================================= */

export interface ProgressUpdate {
    _id: string;
    updatedBy: string;
    description: string;
    image: IssueImage[];
    progressPercentage: number;
    workDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface CompletionSubmission {
    image: IssueImage[];
    description: string;
    submittedBy: string | null;
    submittedAt: string | null;
}

export interface Project {
    _id: string;
    issueId: string;
    auctionId: string;
    selectedBidId: string;
    contractorId: string;
    companyId: string;
    projectStaffId?: string;

    plannedDurationDays: number;
    plannedStartDate: string | null;
    plannedEndDate: string | null;

    status: ProjectStatus;

    progressUpdates: ProgressUpdate[];
    completionSubmission: CompletionSubmission;

    completedAt: string | null;

    createdAt: string;
    updatedAt: string;
}


/* =========================================
   ALLOCATED PROJECT LIST
   getAllocatedAllProject
========================================= */

export interface AllocatedProject {
    _id: string;
    projectId: string;
    inspectorId: string;
    visitDate: string;

    project: Project;

    issue: ProjectIssueDetails;

    inspection: InspectionDetails | null;
}

export interface AllocatedProjectPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface GetAllocatedAllProjectResponse {
    projects: AllocatedProject[];
    pagination: AllocatedProjectPagination;
}


/* =========================================
   ALLOCATED PROJECT DETAILS
   getAllocatedProjectDetails
========================================= */

export interface AllocatedProjectDetails extends Project {
    issue: ProjectIssueDetails;
    contractor?: AdminPerson;
}

export interface GetAllocatedProjectDetailsResponse {
    project: AllocatedProjectDetails;
    inspections: InspectionDetails[];
    totalInspections: number;
}
