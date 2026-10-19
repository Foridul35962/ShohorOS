"use client";

import { useState, type FormEvent } from "react";
import { Activity, Flag, Search, Tag, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { SelectField } from "@/components/auth/fields";
import type { IssueCategory, IssueStatus } from "@/types/issueTypes";
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES, type AppliedFilters } from "./issueConfig";

type Draft = {
  category: IssueCategory | "";
  status: IssueStatus | "";
  priority: string;
};

const toDraft = (a: AppliedFilters): Draft => ({
  category: a.category,
  status: a.status,
  priority: a.priority ? String(a.priority) : "",
});

type Props = {
  applied: AppliedFilters;
  canPriority: boolean;
  hasFilters: boolean;
  onApply: (v: AppliedFilters) => void;
  onClear: () => void;
};

export function IssueFilters({ applied, canPriority, hasFilters, onApply, onClear }: Props) {
  const { t, locale } = useI18n();
  const f = t.issueList.filters;
  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en");

  const [draft, setDraft] = useState<Draft>(() => toDraft(applied));

  // URL bodlale (back button, Clear) draft o URL er shathe sync hoy
  const appliedKey = JSON.stringify(applied);
  const [syncedKey, setSyncedKey] = useState(appliedKey);
  if (syncedKey !== appliedKey) {
    setSyncedKey(appliedKey);
    setDraft(toDraft(applied));
  }

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    onApply({
      category: draft.category,
      status: draft.status,
      priority: canPriority ? (ISSUE_PRIORITIES.find((p) => String(p) === draft.priority) ?? null) : null,
    });
  };

  return (
    <form noValidate role="search" aria-label={f.label} onSubmit={submit} className="card mb-6 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          label={f.status}
          icon={Activity}
          name="status"
          value={draft.status}
          onChange={(ev) => setDraft((d) => ({ ...d, status: ev.target.value as IssueStatus | "" }))}
        >
          <option value="">{f.allStatuses}</option>
          {ISSUE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t.issueDetail.status[s]}
            </option>
          ))}
        </SelectField>

        {canPriority ? (
          <SelectField
            label={f.priority}
            icon={Flag}
            name="priority"
            value={draft.priority}
            onChange={(ev) => setDraft((d) => ({ ...d, priority: ev.target.value }))}
          >
            <option value="">{f.allPriorities}</option>
            {ISSUE_PRIORITIES.map((p) => (
              <option key={p} value={String(p)}>
                {f.priorityOption.replace("{n}", nf.format(p))}
              </option>
            ))}
          </SelectField>
        ) : null}
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