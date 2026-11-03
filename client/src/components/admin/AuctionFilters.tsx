"use client";

import { useState, type FormEvent } from "react";
import { Activity, CalendarClock, Search, Tag, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { SelectField } from "@/components/auth/fields";
import { ISSUE_CATEGORIES } from "@/components/issues/issueConfig";
import type { IssueCategory } from "@/types/issueTypes";
import { AuctionStatus } from "@/types/contractorTypes";

export const AUCTION_STATUSES: AuctionStatus[] = [
    "SCHEDULED",
    "ACTIVE",
    "ENDED",
    "AWAITING_SELECTION",
    "WINNER_SELECTED",
    "CANCELLED",
];

export type AuctionFilterValues = {
    category: IssueCategory | "";
    status: AuctionStatus | "";
    deadline: boolean | undefined;
};

type Props = {
    applied: AuctionFilterValues;
    hasFilters: boolean;
    onApply: (v: AuctionFilterValues) => void;
    onClear: () => void;
};

export function AuctionFilters({ applied, hasFilters, onApply, onClear }: Props) {
    const { t } = useI18n();
    const f = t.auctionList.filters;
    const [draft, setDraft] = useState<AuctionFilterValues>(applied);

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
                    onChange={(ev) => setDraft((d) => ({ ...d, status: ev.target.value as AuctionStatus | "" }))}
                >
                    <option value="">{f.allStatuses}</option>
                    {AUCTION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {t.adminOps.status.auction[s]}
                        </option>
                    ))}
                </SelectField>

                {/* 💡 Checkbox-er poriborte 3-State Dropdown */}
                <SelectField
                    label={f.deadline}
                    icon={CalendarClock}
                    name="deadline"
                    value={draft.deadline === undefined ? "" : String(draft.deadline)}
                    onChange={(ev) => {
                        const val = ev.target.value;
                        setDraft((d) => ({
                            ...d,
                            deadline: val === "" ? undefined : val === "true",
                        }));
                    }}
                >
                    <option value="">{t.auctionList.deadlineValue.all}</option>
                    <option value="true">{t.auctionList.deadlineValue.active}</option>
                    <option value="false">{t.auctionList.deadlineValue.expired}</option>
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