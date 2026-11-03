"use client"

import React from "react"
import Link from "next/link"
import { motion, MotionConfig } from "motion/react"
import { AlertTriangle, CalendarClock, ChevronRight, FolderKanban, MapPin, RotateCcw, Timer } from "lucide-react"

import { StatusBadge, useFmt } from "@/components/admin/AdminUi"
import { Pagination } from "@/components/admin/Pagination"
import { CATEGORY_ICONS } from "@/components/issues/issueConfig"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"
import type { MyProject, MyProjectsData } from "@/types/contractorTypes"
import StaffProjectFilters, { type StaffProjectFilterValues } from "./StaffProjectFilters"

export interface StaffProjectsQuery extends StaffProjectFilterValues {
  page: number
}

interface Props {
  query: StaffProjectsQuery
  data: MyProjectsData | null
  loading: boolean
  error: string | null
  onRetry: () => void
  onApply: (values: StaffProjectFilterValues) => void
  onClear: () => void
  onPage: (page: number) => void
}

export const StaffProjectsListSkeleton = () => (
  <ul className="space-y-3" aria-busy="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <li key={i} className="card h-24 animate-pulse" style={{ opacity: Math.max(0.35, 1 - i * 0.15) }} />
    ))}
  </ul>
)

const ProjectRow = ({ project }: { project: MyProject }) => {
  const { t, locale } = useI18n()
  const f = useFmt()
  const p = t.staffProjects

  const Icon = CATEGORY_ICONS[project.issue.category]
  const district =
    locale === "bn"
      ? (DISTRICTS.find((d) => d.value === project.issue.district)?.bn ?? project.issue.district)
      : project.issue.district

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link
        href={`/staff/project/${encodeURIComponent(project._id)}`}
        className="card focus-ring flex items-start gap-3 p-4 transition-colors hover:border-(--accent) sm:gap-4 sm:p-5"
      >
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
          <Icon size={20} strokeWidth={1.8} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display wrap-break-words text-base font-semibold text-(--ink)">{project.issue.title}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} label={t.adminOps.status.project[project.status]} />
            <span className="chip rounded-full bg-(--accent-soft) px-2.5 py-0.5 text-xs font-medium text-(--accent)">
              {t.issues.categories[project.issue.category]}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--muted)">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} aria-hidden className="shrink-0" />
              {district}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock size={14} aria-hidden className="shrink-0" />
              {project.plannedStartDate
                ? p.startsOn.replace("{date}", f.date(project.plannedStartDate))
                : p.notStarted}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Timer size={14} aria-hidden className="shrink-0" />
              {p.durationDays.replace("{count}", f.nf.format(project.plannedDurationDays))}
            </span>
          </div>
        </div>

        <ChevronRight size={18} className="mt-3 shrink-0 text-(--muted) rtl:rotate-180" aria-hidden />
      </Link>
    </motion.li>
  )
}

const StaffProjectsView = ({ query, data, loading, error, onRetry, onApply, onClear, onPage }: Props) => {
  const { t } = useI18n()
  const f = useFmt()
  const p = t.staffProjects

  const hasFilters = !!query.category
  const projects = data?.projects ?? []
  const pagination = data?.pagination
  const total = pagination?.totalProjects ?? 0

  const from = pagination ? (pagination.currentPage - 1) * pagination.limit + 1 : 0
  const to = from + projects.length - 1

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1] text-(--ink)">
              {p.title}
            </h1>
            {!loading && !error && data && (
              <span className="chip rounded-full bg-(--accent-soft) px-3 py-1 text-sm font-medium text-(--accent)">
                {p.count.replace("{count}", f.nf.format(total))}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-xl text-(--muted)">{p.subtitle}</p>
        </div>

        <StaffProjectFilters
          key={query.category}
          applied={{ category: query.category }}
          disabled={loading}
          onApply={onApply}
          onClear={onClear}
        />

        {loading ? (
          <div role="status" aria-label={p.loading}>
            <StaffProjectsListSkeleton />
          </div>
        ) : error ? (
          <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center" role="alert">
            <div
              className="mb-4 grid h-16 w-16 place-items-center rounded-full"
              style={{ background: "color-mix(in oklab, var(--warm) 12%, transparent)", color: "var(--warm)" }}
            >
              <AlertTriangle size={26} strokeWidth={1.8} aria-hidden />
            </div>
            <p className="font-display text-lg font-semibold text-(--ink)">{p.error.title}</p>
            <p className="mt-1 wrap-break-words text-sm text-(--muted)">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="btn-primary focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
            >
              <RotateCcw size={14} aria-hidden />
              {p.error.retry}
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
              <FolderKanban size={26} strokeWidth={1.8} aria-hidden />
            </div>
            <p className="font-display text-lg font-semibold text-(--ink)">
              {hasFilters ? p.empty.filteredTitle : p.empty.title}
            </p>
            <p className="mt-1 text-sm text-(--muted)">{hasFilters ? p.empty.filteredText : p.empty.text}</p>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {projects.map((project) => (
                <ProjectRow key={project._id} project={project} />
              ))}
            </ul>

            {pagination && (
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-(--muted)" aria-live="polite">
                  {p.showing
                    .replace("{from}", f.nf.format(from))
                    .replace("{to}", f.nf.format(to))
                    .replace("{total}", f.nf.format(total))}
                </p>
                <Pagination
                  page={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPage={onPage}
                  labels={{ prev: p.pagination.prev, next: p.pagination.next, label: p.pagination.label }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </MotionConfig>
  )
}

export default StaffProjectsView