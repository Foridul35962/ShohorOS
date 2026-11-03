"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import { AlertTriangle, CalendarClock, Gavel, Inbox, MapPin, SearchX } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Pagination } from "@/components/admin/Pagination";
import { CATEGORY_ICONS, ISSUE_CATEGORIES } from "@/components/issues/issueConfig";
import type { AuctionItem, PaginationInfo } from "@/types/adminTypes";
import { StatusBadge, useFmt } from "./AdminUi";
import { AUCTION_STATUSES, AuctionFilters, type AuctionFilterValues } from "./AuctionFilters";

type Props = {
    auctions: AuctionItem[];
    pagination: PaginationInfo;
    loaded: boolean;
    loading: boolean;
    error: string | null;
    hasFilters: boolean;
    filters: AuctionFilterValues;
    onApply: (v: AuctionFilterValues) => void;
    onClear: () => void;
    onPage: (n: number) => void;
    onRetry: () => void;
};

export function AuctionsView({
    auctions,
    pagination,
    loaded,
    loading,
    error,
    hasFilters,
    filters,
    onApply,
    onClear,
    onPage,
    onRetry,
}: Props) {
    const { t } = useI18n();
    const s = t.auctionList;
    const { nf, dateTime } = useFmt();

    const { page: currentPage, limit, total, totalPages } = pagination;
    const from = (currentPage - 1) * limit + 1;
    const to = Math.min(currentPage * limit, total);

    return (
        <MotionConfig reducedMotion="user">
            <header className="mb-8">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">{s.title}</h1>
                    {loaded ? (
                        <span className="chip px-3 py-1 text-xs" aria-live="polite">
                            {s.count.replace("{count}", nf.format(total))}
                        </span>
                    ) : null}
                </div>
                <p className="mt-2 max-w-xl text-(--muted)">{s.sub}</p>
            </header>

            <AuctionFilters applied={filters} hasFilters={hasFilters} onApply={onApply} onClear={onClear} />

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
                            <div key={o} className="card h-28 animate-pulse" style={{ opacity: o }} />
                        ))}
                    </div>
                ) : auctions.length === 0 ? (
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
                            {auctions.map((auction, i) => {
                                const issue = auction.issueId;
                                const category = ISSUE_CATEGORIES.find((c) => c === issue?.category);
                                const Icon = category ? CATEGORY_ICONS[category] : Gavel;
                                const statusKey = AUCTION_STATUSES.find((x) => x === auction.status);
                                const place = [issue?.address?.street, issue?.address?.city].filter(Boolean).join(", ");
                                return (
                                    <motion.li
                                        key={auction._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, ease: "easeOut", delay: Math.min(i, 8) * 0.03 }}
                                        className="card p-4 sm:p-5"
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
                                                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="font-display wrap-break-word text-base font-semibold leading-snug sm:text-lg">
                                                    {issue?.title ?? t.adminOps.common.unknown}
                                                </h2>
                                                {place ? (
                                                    <p className="mt-0.5 flex items-start gap-1.5 wrap-break-word text-sm leading-relaxed text-(--muted)">
                                                        <MapPin size={14} aria-hidden="true" className="mt-1 shrink-0" />
                                                        <span className="min-w-0">{place}</span>
                                                    </p>
                                                ) : null}
                                                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-(--muted)">
                                                    <StatusBadge
                                                        status={auction.status}
                                                        label={statusKey ? t.adminOps.status.auction[statusKey] : auction.status}
                                                    />
                                                    {category ? <span>{t.issues.categories[category]}</span> : null}
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CalendarClock size={14} aria-hidden="true" />
                                                        {s.startsAt.replace("{date}", dateTime(auction.startsAt))}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CalendarClock size={14} aria-hidden="true" />
                                                        {s.deadline.replace("{date}", dateTime(auction.deadline))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                            {issue?._id ? (
                                                <Link
                                                    href={`/admin/issues/${issue._id}`}
                                                    className="btn-ghost focus-ring inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium"
                                                >
                                                    {s.viewIssue}
                                                </Link>
                                            ) : null}
                                            <Link
                                                href={`/admin/auctions/${auction._id}`}
                                                className="btn-primary focus-ring inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm"
                                            >
                                                {s.viewAuction}
                                            </Link>
                                        </div>
                                    </motion.li>
                                );
                            })}
                        </ul>

                        <p className="mt-6 text-center text-sm text-(--muted)" aria-live="polite">
                            {s.showing
                                .replace("{from}", nf.format(from))
                                .replace("{to}", nf.format(to))
                                .replace("{total}", nf.format(total))}
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