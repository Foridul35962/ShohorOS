"use client"

import React, { useState } from "react"
import { Search } from "lucide-react"

import { SelectField } from "@/components/auth/fields"
import { PROJECT_CATEGORIES, isProjectCategory } from "@/components/contractor/projectConfig"
import { useI18n } from "@/lib/i18n/provider"
import type { IssueCategory } from "@/types/issueTypes"

export type ReviewFilter = "" | "true" | "false"

export interface InspectorFilterValues {
    category: IssueCategory | ""
    reviewed: ReviewFilter
}

export const isReviewFilter = (v: string | null): v is "true" | "false" => v === "true" || v === "false"

interface Props {
    applied: InspectorFilterValues
    disabled?: boolean
    onApply: (values: InspectorFilterValues) => void
    onClear: () => void
}

// Parent gives a `key` made from the applied filters, so this draft resets on back button / Clear.
const InspectorProjectFilters = ({ applied, disabled, onApply, onClear }: Props) => {
    const { t } = useI18n()
    const f = t.inspector.filters
    const [draft, setDraft] = useState<InspectorFilterValues>(applied)

    const hasFilters = !!(applied.category || applied.reviewed || draft.category || draft.reviewed)

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        onApply(draft)
    }

    return (
        <form
            onSubmit={submit}
            role="search"
            aria-label={f.label}
            className="card grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[repeat(2,minmax(0,1fr))_auto] lg:items-end"
        >
            <SelectField
                label={f.category}
                value={draft.category}
                onChange={(e) => {
                    const v = e.target.value
                    setDraft((d) => ({ ...d, category: isProjectCategory(v) ? v : "" }))
                }}
            >
                <option value="">{f.allCategories}</option>
                {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                        {t.issues.categories[c]}
                    </option>
                ))}
            </SelectField>

            <SelectField
                label={f.review}
                value={draft.reviewed}
                onChange={(e) => {
                    const v = e.target.value
                    setDraft((d) => ({ ...d, reviewed: isReviewFilter(v) ? v : "" }))
                }}
            >
                <option value="">{f.allReviews}</option>
                <option value="true">{f.reviewed}</option>
                <option value="false">{f.pending}</option>
            </SelectField>

            <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-1">
                <button
                    type="submit"
                    disabled={disabled}
                    className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm disabled:opacity-60"
                >
                    <Search size={16} aria-hidden />
                    {f.search}
                </button>
                {hasFilters && (
                    <button
                        type="button"
                        onClick={onClear}
                        disabled={disabled}
                        className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
                    >
                        {f.clear}
                    </button>
                )}
            </div>
        </form>
    )
}

export default InspectorProjectFilters