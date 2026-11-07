export const MIN_IMAGES = 1
export const MAX_IMAGES = 5
export const MAX_IMAGE_MB = 3
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024
export const MAX_DESCRIPTION = 2000

export const IMAGE_FIELD = "images"

// Staff can post progress / complete in these project statuses
export const WORKABLE_STATUSES = [
    "IN_PROGRESS",
    "WORK_SUBMITTED",
    "INSPECTION_FAILED",
    "REVISION_REQUIRED"
] as const

// PLANNED is workable only after the contractor has set the start date
export const canWorkOnProject = (status: string, plannedStartDate: string | null): boolean => {
    if (!(WORKABLE_STATUSES as readonly string[]).includes(status)) return false
    if (status === "PLANNED") return !!plannedStartDate
    if (status === "COMPLETED" || status === "CANCELLED") {
        return false;
    }
    return true
}