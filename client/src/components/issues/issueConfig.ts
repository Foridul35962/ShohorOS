import {
  Building2,
  Droplets,
  Route,
  TrafficCone,
  Trash2,
  TreePine,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { IssueCategory, IssuePriority, IssueStatus } from "@/types/issueTypes";

export const ISSUE_CATEGORIES: IssueCategory[] = [
  "ROAD",
  "DRAIN",
  "WATER",
  "ELEC",
  "WASTE",
  "BUILDING",
  "PARK",
  "TRAFFIC",
];

export const ISSUE_STATUSES: IssueStatus[] = [
  "REPORTED",
  "UNDER_REVIEW",
  "REJECTED",
  "APPROVED",
  "PROJECT_CREATED",
  "IN_PROGRESS",
  "AWAITING_INSPECTION",
  "REVISION_REQUIRED",
  "RESOLVED",
  "CANCELLED",
];

export const ISSUE_PRIORITIES: IssuePriority[] = [1, 2, 3, 4, 5];

export const CATEGORY_ICONS: Record<IssueCategory, LucideIcon> = {
  ROAD: Route,
  DRAIN: Droplets,
  WATER: Droplets,
  ELEC: Zap,
  WASTE: Trash2,
  BUILDING: Building2,
  PARK: TreePine,
  TRAFFIC: TrafficCone,
};

export type AppliedFilters = {
  category: IssueCategory | "";
  status: IssueStatus | "";
  priority: IssuePriority | null;
  myIssue: boolean;
};

export const canCreateIssue = (role?: string) => role === "citizen" || role === "department-officer";

// priority filter: shudhu ei 2 role
export const canFilterPriority = (role?: string) => role === "department-officer" || role === "city-admin";

// myIssue filter: shudhu ei 2 role
export const canFilterMine = (role?: string) => role === "citizen" || role === "department-officer";