"use client"

import React from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { motion, MotionConfig } from "motion/react"
import {
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Landmark,
  ListChecks,
  Loader,
  Lock,
  MapPin,
  Plus,
  Sprout,
  TrendingUp,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import { citizenDashboard } from "@/store/slice/dashboardSlice"
import { AppDispatch, RootState } from "@/store/store"
import type { CitizenIssue } from "@/types/dashboardTypes"
import { AdminPageShell, LoadState, StatusBadge, useFetch, useFmt, DANGER, GOLD } from "@/components/admin/AdminUi"
import { CATEGORY_ICONS } from "@/components/issues/issueConfig"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"

type Tone = "accent" | "muted" | "gold" | "danger"

const TONE: Record<Tone, React.CSSProperties> = {
  accent: { background: "var(--accent-soft)", color: "var(--accent)" },
  muted: { background: "color-mix(in oklab, var(--muted) 14%, transparent)", color: "var(--muted)" },
  gold: GOLD,
  danger: DANGER,
}

const ProgressBar = ({ percent, label }: { percent: number; label: string }) => (
  <div
    className="h-2 overflow-hidden rounded-full bg-(--line)"
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={percent}
  >
    <div
      className="h-full rounded-full"
      style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: "var(--accent)" }}
    />
  </div>
)

const StatCard = ({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: Tone }) => (
  <li className="card flex items-center gap-3 p-4">
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={TONE[tone]}>
      <Icon size={20} strokeWidth={1.8} aria-hidden />
    </span>
    <div className="min-w-0">
      <p className="font-display text-2xl font-semibold leading-none text-(--ink) tabular-nums">{value}</p>
      <p className="mt-1 wrap-break-words text-sm text-(--muted)">{label}</p>
    </div>
  </li>
)

const IssueRow = ({ issue }: { issue: CitizenIssue }) => {
  const { t, locale } = useI18n()
  const f = useFmt()
  const c = t.dashboard.citizen

  const Icon = CATEGORY_ICONS[issue.category]
  const district =
    locale === "bn" ? (DISTRICTS.find((d) => d.value === issue.district)?.bn ?? issue.district) : issue.district
  const project = issue.project

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link
        href={`/issues/${encodeURIComponent(issue._id)}`}
        className="card focus-ring flex items-start gap-3 p-4 transition-colors hover:border-(--accent) sm:gap-4 sm:p-5"
      >
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
          <Icon size={20} strokeWidth={1.8} aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-display wrap-break-words text-base font-semibold text-(--ink)">{issue.title}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={issue.status} label={t.issueDetail.status[issue.status]} />
            <span className="chip rounded-full bg-(--accent-soft) px-2.5 py-0.5 text-xs font-medium text-(--accent)">
              {t.issues.categories[issue.category]}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--muted)">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} aria-hidden className="shrink-0" />
              {district}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Landmark size={14} aria-hidden className="shrink-0" />
              <span className="wrap-break-words">{issue.department?.name ?? c.recent.noDepartment}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} aria-hidden className="shrink-0" />
              {c.recent.reportedOn.replace("{date}", f.date(issue.createdAt))}
            </span>
          </div>

          {project && (
            <div className="mt-4 rounded-2xl border border-(--line) p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium text-(--ink)">
                  <TrendingUp size={14} aria-hidden />
                  {c.project.title}
                </span>
                <StatusBadge status={project.status} label={t.adminOps.status.project[project.status]} />
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-(--muted)">
                <span>{c.project.progress.replace("{percent}", f.nf.format(project.currentProgress))}</span>
                {project.progressUpdates.length > 0 && (
                  <span>{c.project.updates.replace("{count}", f.nf.format(project.progressUpdates.length))}</span>
                )}
              </div>
              <div className="mt-1.5">
                <ProgressBar
                  percent={project.currentProgress}
                  label={c.project.progress.replace("{percent}", f.nf.format(project.currentProgress))}
                />
              </div>
              {(project.completedAt || project.plannedEndDate) && (
                <p
                  className="mt-2 inline-flex items-center gap-1.5 text-xs"
                  style={project.completedAt ? { color: "var(--ok)" } : { color: "var(--muted)" }}
                >
                  <CalendarCheck size={13} aria-hidden />
                  {project.completedAt
                    ? c.project.completedOn.replace("{date}", f.date(project.completedAt))
                    : c.project.plannedEnd.replace("{date}", f.date(project.plannedEndDate as string))}
                </p>
              )}
            </div>
          )}
        </div>

        <ChevronRight size={18} className="mt-3 shrink-0 text-(--muted) rtl:rotate-180" aria-hidden />
      </Link>
    </motion.li>
  )
}

const CitizenDashboardView = () => {
  const { t } = useI18n()
  const f = useFmt()
  const c = t.dashboard.citizen
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { citizen } = useSelector((state: RootState) => state.dashboard) // TODO: tomar store key thik koro

  const isCitizen = user?.role?.toLowerCase() === "citizen"

  // Fetched on every visit, so the numbers are always fresh
  const { loading, error, retry } = useFetch(() => dispatch(citizenDashboard(null)).unwrap(), "citizen")

  if (!isCitizen) {
    return (
      <AdminPageShell>
        <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
            <Lock size={26} strokeWidth={1.8} aria-hidden />
          </div>
          <p className="font-display text-lg font-semibold text-(--ink)">{t.dashboard.common.locked.title}</p>
          <p className="mt-1 text-sm text-(--muted)">{t.dashboard.common.locked.text}</p>
        </div>
      </AdminPageShell>
    )
  }

  if (!citizen) {
    return (
      <AdminPageShell>
        <LoadState loading={loading} error={error} onRetry={retry} />
      </AdminPageShell>
    )
  }

  const { statistics: s, recentIssues } = citizen
  const resolvedPercent = s.totalIssues > 0 ? Math.round((s.resolvedIssues / s.totalIssues) * 100) : 0

  const stats: { icon: LucideIcon; label: string; value: number; tone: Tone }[] = [
    { icon: ListChecks, label: c.stats.total, value: s.totalIssues, tone: "accent" },
    { icon: Clock, label: c.stats.pending, value: s.pendingIssues, tone: "muted" },
    { icon: Loader, label: c.stats.inProgress, value: s.inProgressIssues, tone: "accent" },
    { icon: CheckCircle2, label: c.stats.resolved, value: s.resolvedIssues, tone: "gold" },
    { icon: XCircle, label: c.stats.rejected, value: s.rejectedIssues, tone: "danger" },
  ]

  const name = user?.name // TODO: tomar auth user er name field thik koro

  return (
    <AdminPageShell>
      <MotionConfig reducedMotion="user">
        <div className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1] text-(--ink)">
                {c.title}
              </h1>
              <p className="mt-2 max-w-xl wrap-break-words text-(--muted)">
                {name ? c.welcome.replace("{name}", name) : c.welcomeAnon}. {c.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/issues?page=1&myIssue=true"
                className="btn-ghost focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
              >
                {c.myIssues}
              </Link>
              <Link
                href="/issues/new"
                className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
              >
                <Plus size={16} aria-hidden />
                {c.report}
              </Link>
            </div>
          </div>

          <section aria-label={c.stats.label}>
            <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
              {stats.map((st) => (
                <StatCard
                  key={st.label}
                  icon={st.icon}
                  label={st.label}
                  value={f.nf.format(st.value)}
                  tone={st.tone}
                />
              ))}
            </ul>

            {s.totalIssues > 0 && (
              <div className="card mt-3 p-4">
                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                  <span className="text-(--muted)">
                    {c.resolvedOf
                      .replace("{resolved}", f.nf.format(s.resolvedIssues))
                      .replace("{total}", f.nf.format(s.totalIssues))}
                  </span>
                  <span className="font-medium text-(--ink)">{f.nf.format(resolvedPercent)}%</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-(--line)"
                  role="progressbar"
                  aria-label={c.stats.resolved}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={resolvedPercent}
                >
                  <div className="h-full rounded-full" style={{ width: `${resolvedPercent}%`, background: "var(--ok)" }} />
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="recent-issues">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="recent-issues" className="font-display text-xl font-semibold text-(--ink)">
                {c.recent.title}
              </h2>
              {recentIssues.length > 0 && (
                <Link
                  href="/issues?page=1&myIssue=true"
                  className="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-(--accent) hover:underline"
                >
                  {c.recent.viewAll}
                </Link>
              )}
            </div>

            {recentIssues.length === 0 ? (
              <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
                  <Sprout size={26} strokeWidth={1.8} aria-hidden />
                </div>
                <p className="font-display text-lg font-semibold text-(--ink)">{c.recent.empty.title}</p>
                <p className="mt-1 text-sm text-(--muted)">{c.recent.empty.text}</p>
                <Link
                  href="/issues/create"
                  className="btn-primary focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                >
                  <Plus size={16} aria-hidden />
                  {c.report}
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentIssues.map((issue) => (
                  <IssueRow key={issue._id} issue={issue} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </MotionConfig>
    </AdminPageShell>
  )
}

export default CitizenDashboardView