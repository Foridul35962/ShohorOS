"use client"

import React, { useState } from "react"
import { Search } from "lucide-react"

import { SelectField, TextField } from "@/components/auth/fields"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"

export type WorkingFilter = "" | "true" | "false"

export interface StaffFilterValues {
  name: string
  district: string
  workingProject: WorkingFilter
}

interface Props {
  applied: StaffFilterValues
  disabled?: boolean
  onApply: (values: StaffFilterValues) => void
  onClear: () => void
}

// Parent gives a `key` made from the applied filters, so this draft resets on back button / Clear.
const StaffFilters = ({ applied, disabled, onApply, onClear }: Props) => {
  const { t, locale } = useI18n()
  const [draft, setDraft] = useState<StaffFilterValues>(applied)

  const hasFilters =
    !!(applied.name || applied.district || applied.workingProject) ||
    !!(draft.name || draft.district || draft.workingProject)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onApply({ ...draft, name: draft.name.trim() })
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label={t.staff.filters.label}
      className="card grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end"
    >
      <TextField
        label={t.staff.filters.name}
        type="text"
        placeholder={t.staff.filters.namePlaceholder}
        maxLength={100}
        value={draft.name}
        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
      />

      <SelectField
        label={t.staff.filters.district}
        value={draft.district}
        onChange={(e) => setDraft((d) => ({ ...d, district: e.target.value }))}
      >
        <option value="">{t.staff.filters.allDistricts}</option>
        {DISTRICTS.map((d) => (
          <option key={d.value} value={d.value}>
            {locale === "bn" ? d.bn : d.value}
          </option>
        ))}
      </SelectField>

      <SelectField
        label={t.staff.filters.working}
        value={draft.workingProject}
        onChange={(e) => setDraft((d) => ({ ...d, workingProject: e.target.value as WorkingFilter }))}
      >
        <option value="">{t.staff.filters.all}</option>
        <option value="true">{t.staff.filters.onProject}</option>
        <option value="false">{t.staff.filters.available}</option>
      </SelectField>

      <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-1">
        <button
          type="submit"
          disabled={disabled}
          className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm disabled:opacity-60"
        >
          <Search size={16} aria-hidden />
          {t.staff.filters.search}
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {t.staff.filters.clear}
          </button>
        )}
      </div>
    </form>
  )
}

export default StaffFilters