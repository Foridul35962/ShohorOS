"use client";

import { useState, type FormEvent } from "react";
import { MapPin, Search, Tag, Type, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICTS } from "@/lib/districts";
import { SelectField, TextField } from "@/components/auth/fields";
import { ISSUE_CATEGORIES } from "@/components/issues/issueConfig";
import type { IssueCategory } from "@/types/issueTypes";

export type ContractorFilters = {
  title: string;
  category: IssueCategory | "";
  district: string;
};

type Props = {
  applied: ContractorFilters;
  hasFilters: boolean;
  onApply: (v: ContractorFilters) => void;
  onClear: () => void;
};

export function ContractorIssueFilters({ applied, hasFilters, onApply, onClear }: Props) {
  const { t, locale } = useI18n();
  const f = t.contractor.list.filters;

  const [draft, setDraft] = useState<ContractorFilters>(applied);

  // URL bodlale (back button, Clear) draft o sync hoy
  const appliedKey = JSON.stringify(applied);
  const [syncedKey, setSyncedKey] = useState(appliedKey);
  if (syncedKey !== appliedKey) {
    setSyncedKey(appliedKey);
    setDraft(applied);
  }

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    onApply(draft);
  };

  return (
    <form noValidate role="search" aria-label={f.label} onSubmit={submit} className="card mb-6 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextField
          label={f.title}
          icon={Type}
          name="title"
          type="text"
          maxLength={100}
          placeholder={f.titlePh}
          value={draft.title}
          onChange={(ev) => setDraft((d) => ({ ...d, title: ev.target.value }))}
        />

        <SelectField
          label={f.category}
          icon={Tag}
          name="category"
          value={draft.category}
          onChange={(ev) => setDraft((d) => ({ ...d, category: ev.target.value as IssueCategory | "" }))}
        >
          <option value="">{f.allCategories}</option>
          {ISSUE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t.issues.categories[c]}
            </option>
          ))}
        </SelectField>

        <SelectField
          label={f.district}
          icon={MapPin}
          name="district"
          value={draft.district}
          onChange={(ev) => setDraft((d) => ({ ...d, district: ev.target.value }))}
        >
          <option value="">{f.allDistricts}</option>
          {DISTRICTS.map((d) => (
            <option key={d.value} value={d.value}>
              {locale === "bn" ? d.bn : d.value}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
        >
          <Search size={16} aria-hidden="true" />
          {f.search}
        </button>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="btn-ghost focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
          >
            <X size={16} aria-hidden="true" />
            {f.clear}
          </button>
        ) : null}
      </div>
    </form>
  );
}