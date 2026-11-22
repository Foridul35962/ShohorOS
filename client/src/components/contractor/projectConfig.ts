import { ProjectStatus } from "@/types/adminTypes"
import { IssueCategory } from "@/types/issueTypes"

export const PROJECT_CATEGORIES: IssueCategory[] = [
  "ROAD",
  "DRAIN",
  "WATER",
  "ELEC",
  "WASTE",
  "BUILDING",
  "PARK",
  "TRAFFIC",
]

export const PROJECT_STATUSES: ProjectStatus[] = [
  "PLANNED",
  "IN_PROGRESS",
  "WORK_SUBMITTED",
  "INSPECTION_FAILED",
  "REVISION_REQUIRED",
  "COMPLETED",
  "CANCELLED",
]

export const isProjectCategory = (value: string): value is IssueCategory =>
  (PROJECT_CATEGORIES as string[]).includes(value)

export const isProjectStatus = (value: string): value is ProjectStatus =>
  (PROJECT_STATUSES as string[]).includes(value)