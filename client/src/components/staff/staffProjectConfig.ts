export const MIN_IMAGES = 1
export const MAX_IMAGES = 5
export const MAX_IMAGE_MB = 3
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024
export const MAX_DESCRIPTION = 2000

export const IMAGE_FIELD = "images"

// Deadline alert: show red alert when the planned end date is within this many days
export const DEADLINE_ALERT_DAYS = 7

// Statuses where the work is still open (deadline alert only matters here)
export const OPEN_STATUSES = ["PLANNED", "IN_PROGRESS", "REVISION_REQUIRED", "INSPECTION_FAILED"] as const