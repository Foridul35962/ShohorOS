"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import { AlertTriangle, Calendar, ChevronRight, Inbox, MapPin, Plus, SearchX } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Pagination } from "@/components/admin/Pagination";
import type { AllIssueItem, IssuePagination, IssueStatus } from "@/types/issueTypes";
import { IssueFilters } from "./IssueFilters";
import { CATEGORY_ICONS, type AppliedFilters } from "./issueConfig";

function statusStyle(status: IssueStatus): CSSProperties | undefined {
    if (status === "RESOLVED") {
        return { background: "color-mix(in oklab, var(--ok) 16%, transparent)", color: "var(--ok)" };
    }
    if (status === "REJECTED" || status === "CANCELLED") {
        return { background: "color-mix(in oklab, var(--warm) 12%, transparent)", color: "var(--warm)" };
    }
    return undefined;
}

type Props = {
    issues: AllIssueItem[];
    pagination: IssuePagination;
    loaded: boolean;
    canReport: boolean;
    loading: boolean;
    error: string | null;
    hasFilters: boolean;
    filters: AppliedFilters;
    canPriority: boolean;
    canMine: boolean;
    onApply: (v: AppliedFilters) => void;
    onClear: () => void;
    onPage: (n: number) => void;
    onRetry: () => void;
};

export function IssuesView({
    issues,
    pagination,
    loaded,
    canReport,
    loading,
    error,
    hasFilters,
    filters,
    canPriority,
    onApply,
    onClear,
    onPage,
    onRetry,
}: Props) {
    const { t, locale } = useI18n();
    const s = t.issueList;
    const tag = locale === "bn" ? "bn-BD" : "en";
    const nf = new Intl.NumberFormat(tag);
    const df = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium" });

    const { currentPage, limit, totalIssues, totalPages } = pagination;
    const from = (currentPage - 1) * limit + 1;
    const to = Math.min(currentPage * limit, totalIssues);

    return (
        <MotionConfig reducedMotion="user">
            <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">
                        {s.title}
                    </h1>
                    <p className="mt-2 max-w-xl text-(--muted)">{s.sub}</p>
                </div>
                {canReport ? (
                    <Link
                        href="/issues/create"
                        className="btn-primary focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm"
                    >
                        <Plus size={16} aria-hidden="true" />
                        {s.report}
                    </Link>
                ) : null}
            </header>

            <IssueFilters
                applied={filters}
                canPriority={canPriority}
                hasFilters={hasFilters}
                onApply={onApply}
                onClear={onClear}
            />

            <div aria-busy={loading}>
                {error ? (
                    <div className="card mx-auto max-w-md p-8 text-center" role="alert">
                        <span
                            className="mx-auto grid h-16 w-16 place-items-center rounded-full text-(--warm)"
                            style={{ background: "color-mix(in oklab, var(--warm) 12%, transparent)" }}
                        >
                            <AlertTriangle size={26} strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <h2 className="font-display mt-4 text-xl font-semibold">{s.loadFailed.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-(--muted)">{error}</p>
                        <button
                            type="button"
                            onClick={onRetry}
                            className="btn-primary focus-ring mt-6 inline-flex rounded-full px-6 py-2.5 text-sm"
                        >
                            {s.loadFailed.retry}
                        </button>
                    </div>
                ) : loading ? (
                    <div className="space-y-3">
                        {[1, 0.85, 0.7, 0.55, 0.4].map((o) => (
                            <div key={o} className="card h-24 animate-pulse" style={{ opacity: o }} />
                        ))}
                    </div>
                ) : issues.length === 0 ? (
                    <div className="card mx-auto max-w-md p-8 text-center">
                        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
                            {hasFilters ? (
                                <SearchX size={26} strokeWidth={1.8} aria-hidden="true" />
                            ) : (
                                <Inbox size={26} strokeWidth={1.8} aria-hidden="true" />
                            )}
                        </span>
                        <h2 className="font-display mt-4 text-xl font-semibold">{s.empty.title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                            {hasFilters ? s.empty.textFiltered : s.empty.textNone}
                        </p>
                        {hasFilters ? (
                            <button
                                type="button"
                                onClick={onClear}
                                className="btn-ghost focus-ring mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-medium"
                            >
                                {s.empty.clear}
                            </button>
                        ) : null}
                    </div>
                ) : (
                    <>
                        <ul className="space-y-3" aria-label={s.listLabel}>
                            {issues.map((issue, i) => {
                                const Icon = CATEGORY_ICONS[issue.category];
                                const place = [issue.address.street, issue.address.city].filter(Boolean).join(", ");
                                return (
                                    <motion.li
                                        key={issue._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, ease: "easeOut", delay: Math.min(i, 8) * 0.03 }}
                                    >
                                        <Link
                                            href={`/issues/${issue._id}`}
                                            className="card focus-ring group flex items-center gap-4 p-4 transition-colors hover:border-(--accent) sm:p-5"
                                        >
                                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
                                                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="font-display wrap-break-word text-base font-semibold leading-snug sm:text-lg">
                                                    {issue.title}
                                                </h2>
                                                {place ? (
                                                    <p className="mt-0.5 flex items-start gap-1.5 wrap-break-word text-sm leading-relaxed text-(--muted)">
                                                        <MapPin size={14} aria-hidden="true" className="mt-1 shrink-0" />
                                                        <span className="min-w-0">{place}</span>
                                                    </p>
                                                ) : null}
                                                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-(--muted)">
                                                    <span
                                                        className="rounded-full bg-(--accent-soft) px-3 py-1 font-medium text-(--accent)"
                                                        style={statusStyle(issue.status)}
                                                    >
                                                        {t.issueDetail.status[issue.status]}
                                                    </span>
                                                    <span>{t.issues.categories[issue.category]}</span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Calendar size={14} aria-hidden="true" />
                                                        {df.format(new Date(issue.createdAt))}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight
                                                size={18}
                                                aria-hidden="true"
                                                className="shrink-0 text-(--muted) transition-transform group-hover:translate-x-0.5 group-hover:text-(--accent)"
                                            />
                                        </Link>
                                    </motion.li>
                                );
                            })}
                        </ul>

                        <p className="mt-6 text-center text-sm text-(--muted)" aria-live="polite">
                            {s.showing
                                .replace("{from}", nf.format(from))
                                .replace("{to}", nf.format(to))
                                .replace("{total}", nf.format(totalIssues))}
                        </p>
                        {totalPages > 1 ? (
                            <div className="mt-4">
                                <Pagination page={currentPage} totalPages={totalPages} onPage={onPage} labels={s.pagination} />
                            </div>
                        ) : null}
                    </>
                )}
            </div>
        </MotionConfig>
    );
}