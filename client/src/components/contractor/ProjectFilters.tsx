"use client"

import React, { useState } from "react"
import { Search } from "lucide-react"

import { SelectField } from "@/components/auth/fields"
import { useI18n } from "@/lib/i18n/provider"
import { isProjectCategory, isProjectStatus, PROJECT_CATEGORIES, PROJECT_STATUSES } from "./projectConfig"
import { IssueCategory } from "@/types/issueTypes"
import { ProjectStatus } from "@/types/adminTypes"

export interface ProjectFilterValues {
  category: IssueCategory | ""
  projectStatus: ProjectStatus | ""
}

interface Props {
  applied: ProjectFilterValues
  disabled?: boolean
  onApply: (values: ProjectFilterValues) => void
  onClear: () => void
}

// Parent gives a `key` made from the applied filters, so this draft resets on back button / Clear.
const ProjectFilters = ({ applied, disabled, onApply, onClear }: Props) => {
  const { t } = useI18n()
  const p = t.contractorProjects
  const [draft, setDraft] = useState<ProjectFilterValues>(applied)

  const hasFilters = !!(applied.category || applied.projectStatus || draft.category || draft.projectStatus)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onApply(draft)
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label={p.filters.label}
      className="card grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[repeat(2,minmax(0,1fr))_auto] lg:items-end"
    >
      <SelectField
        label={p.filters.category}
        value={draft.category}
        onChange={(e) => {
          const v = e.target.value
          setDraft((d) => ({ ...d, category: isProjectCategory(v) ? v : "" }))
        }}
      >
        <option value="">{p.filters.allCategories}</option>
        {PROJECT_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {t.issues.categories[c]}
          </option>
        ))}
      </SelectField>

      <SelectField
        label={p.filters.status}
        value={draft.projectStatus}
        onChange={(e) => {
          const v = e.target.value
          setDraft((d) => ({ ...d, projectStatus: isProjectStatus(v) ? v : "" }))
        }}
      >
        <option value="">{p.filters.allStatuses}</option>
        {PROJECT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {t.adminOps.status.project[s]}
          </option>
        ))}
      </SelectField>

      <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-1">
        <button
          type="submit"
          disabled={disabled}
          className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm disabled:opacity-60"
        >
          <Search size={16} aria-hidden />
          {p.filters.search}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {p.filters.clear}
          </button>
        )}
      </div>
    </form>
  )
}

export default ProjectFilters