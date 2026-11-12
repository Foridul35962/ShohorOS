"use client"

import React, { useState } from "react"
import { Search } from "lucide-react"

import { SelectField } from "@/components/auth/fields"
import { PROJECT_CATEGORIES, isProjectCategory } from "@/components/contractor/projectConfig"
import { useI18n } from "@/lib/i18n/provider"
import { IssueCategory } from "@/types/issueTypes"

export interface StaffProjectFilterValues {
  category: IssueCategory | ""
}

interface Props {
  applied: StaffProjectFilterValues
  disabled?: boolean
  onApply: (values: StaffProjectFilterValues) => void
  onClear: () => void
}

const StaffProjectFilters = ({ applied, disabled, onApply, onClear }: Props) => {
  const { t } = useI18n()
  const [draft, setDraft] = useState<StaffProjectFilterValues>(applied)

  const hasFilters = !!(applied.category || draft.category)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onApply(draft)
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label={t.staffProjects.filters.label}
      className="card grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-5"
    >
      <SelectField
        label={t.staffProjects.filters.category}
        value={draft.category}
        onChange={(e) => {
          const v = e.target.value
          setDraft({ category: isProjectCategory(v) ? v : "" })
        }}
      >
        <option value="">{t.staffProjects.filters.allCategories}</option>
        {PROJECT_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t.issues.categories[c]}
          </option>
        ))}
      </SelectField>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={disabled}
          className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm disabled:opacity-60"
        >
          <Search size={16} aria-hidden />
          {t.staffProjects.filters.search}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {t.staffProjects.filters.clear}
          </button>
        )}
      </div>
    </form>
  )
}

export default StaffProjectFilters