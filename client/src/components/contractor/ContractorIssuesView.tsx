"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import { AlertTriangle, CalendarClock, ChevronRight, Gavel, Inbox, MapPin, SearchX } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICTS } from "@/lib/districts";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge, useFmt } from "@/components/admin/AdminUi";
import { CATEGORY_ICONS } from "@/components/issues/issueConfig";
import type { ContractorIssueListItem, IssuePagination } from "@/types/contractorTypes";
import { ContractorIssueFilters, type ContractorFilters } from "./ContractorIssueFilters";

type Props = {
  issues: ContractorIssueListItem[];
  pagination: IssuePagination;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  filters: ContractorFilters;
  onApply: (v: ContractorFilters) => void;
  onClear: () => void;
  onPage: (n: number) => void;
  onRetry: () => void;
};

export function ContractorIssuesView({
  issues,
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
  const { t, locale } = useI18n();
  const s = t.contractor.list;
  const { nf, dateTime } = useFmt();

  const { currentPage, limit, totalIssues, totalPages } = pagination;
  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, totalIssues);

  return (
    <MotionConfig reducedMotion="user">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">{s.title}</h1>
          {loaded ? (
            <span className="chip px-3 py-1 text-xs" aria-live="polite">
              {s.count.replace("{count}", nf.format(totalIssues))}
            </span>
          ) : null}
        </div>
        <p className="mt-2 max-w-xl text-(--muted)">{s.sub}</p>
      </header>

      <ContractorIssueFilters applied={filters} hasFilters={hasFilters} onApply={onApply} onClear={onClear} />

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
                const districtLabel =
                  locale === "bn"
                    ? (DISTRICTS.find((d) => d.value === issue.district)?.bn ?? issue.district)
                    : issue.district;
                return (
                  <motion.li
                    key={issue._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut", delay: Math.min(i, 8) * 0.03 }}
                  >
                    <Link
                      href={`/contractor/issues/${issue._id}`}
                      className="card focus-ring group flex items-center gap-4 p-4 transition-colors hover:border-(--accent) sm:p-5"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
                        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display wrap-break-word text-base font-semibold leading-snug sm:text-lg">
                          {issue.title}
                        </h2>
                        <p className="mt-0.5 flex items-start gap-1.5 wrap-break-word text-sm leading-relaxed text-(--muted)">
                          <MapPin size={14} aria-hidden="true" className="mt-1 shrink-0" />
                          <span className="min-w-0">{[place, districtLabel].filter(Boolean).join(" · ")}</span>
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-(--muted)">
                          <StatusBadge
                            status={issue.auction.status}
                            label={t.adminOps.status.auction[issue.auction.status]}
                          />
                          <span className="inline-flex items-center gap-1.5">
                            <Gavel size={14} aria-hidden="true" />
                            {t.issues.categories[issue.category]}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock size={14} aria-hidden="true" />
                            {s.deadline.replace("{date}", dateTime(issue.auction.deadline))}
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