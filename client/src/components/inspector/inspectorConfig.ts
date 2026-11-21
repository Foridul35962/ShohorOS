export const MAX_REPORT_TEXT = 3000

export const RESULTS = ["PASSED", "FAILED", "NEEDS_REINSPECTION"] as const
export type ReportResult = (typeof RESULTS)[number]

export const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()