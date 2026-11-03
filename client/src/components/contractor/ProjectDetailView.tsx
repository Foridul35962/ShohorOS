"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { motion, MotionConfig } from "motion/react"
import {
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  Clock,
  FileCheck2,
  Mail,
  MapPin,
  Timer,
  TrendingUp,
  UserRound,
} from "lucide-react"

import { getContractorProject } from "@/store/slice/contractorSlice"
import { AppDispatch, RootState } from "@/store/store"
import {
  AdminPageShell,
  BackLink,
  LoadState,
  PhotoGrid,
  Panel,
  Row,
  SectionHead,
  StatusBadge,
  useFetch,
  useFmt,
} from "@/components/admin/AdminUi"
import { CATEGORY_ICONS } from "@/components/issues/issueConfig"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"
import ProjectLocked from "./ProjectLocked"
import StartProjectPanel from "./StartProjectPanel"
import ProjectLocationPanel from "./ProjectLocationPanel"

const LIST_ROUTE = "/contractor/projects"

const ProjectDetailView = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { t, locale } = useI18n()
  const p = t.contractorProjects
  const f = useFmt()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { project } = useSelector((state: RootState) => state.contractor)
  const [notice, setNotice] = useState<string | null>(null)

  const { loading, error, retry } = useFetch(() => dispatch(getContractorProject({ projectId })).unwrap(), projectId)

  const isContractor = user?.role?.toLowerCase() === "contractor"
  // Only show store data for THIS id, so a previous project never flashes
  const data = project && project._id === projectId ? project : null

  if (!isContractor) {
    return (
      <AdminPageShell>
        <ProjectLocked />
      </AdminPageShell>
    )
  }

  if (!data) {
    return (
      <AdminPageShell>
        <BackLink href={LIST_ROUTE} label={p.back} />
        <LoadState loading={loading} error={error} onRetry={retry} />
      </AdminPageShell>
    )
  }

  const Icon = CATEGORY_ICONS[data.issue.category]
  const district =
    locale === "bn"
      ? (DISTRICTS.find((d) => d.value === data.issue.district)?.bn ?? data.issue.district)
      : data.issue.district
  const notSet = t.adminOps.common.notSet

  const needsStart = !data.projectStaff || !data.plannedStartDate
  const canStart = needsStart && data.status === "PLANNED"

  const updates = [...(data.progressUpdates ?? [])].sort(
    (a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
  )
  const completion = data.completionSubmission
  const hasCompletion = !!completion && (completion.image.length > 0 || !!completion.description || !!completion.submittedAt)
  const toPhotos = (urls: string[]) => urls.map((url) => ({ url }))

  return (
    <AdminPageShell>
      <MotionConfig reducedMotion="user">
        <BackLink href={LIST_ROUTE} label={p.back} />

        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={data.status} label={t.adminOps.status.project[data.status]} />
            <span className="chip inline-flex items-center gap-1.5 rounded-full bg-(--accent-soft) px-3 py-1 text-sm font-medium text-(--accent)">
              <Icon size={14} aria-hidden />
              {t.issues.categories[data.issue.category]}
            </span>
          </div>
          <h1 className="font-display mt-3 wrap-break-words text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1] text-(--ink)">
            {data.issue.title}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-(--muted)">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} aria-hidden />
              {district}
            </span>
            <span>{p.detail.createdAt}: {f.date(data.createdAt)}</span>
          </p>
        </motion.header>

        {notice && (
          <p
            role="status"
            className="mt-6 rounded-xl px-4 py-3 text-sm font-medium"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            {notice}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Left: issue, progress, completion */}
          <div className="order-2 space-y-6 lg:order-1">
            <Panel>
              <SectionHead icon={ClipboardList} title={p.detail.issueSection} />
              <p className="mt-4 text-sm font-medium text-(--muted)">{p.detail.description}</p>
              <p className="mt-1 whitespace-pre-line wrap-break-words text-(--ink)">{data.issue.description}</p>

              <dl className="mt-4 divide-y divide-(--line)">
                <Row icon={MapPin} label={t.adminOps.common.district}>
                  {district}
                </Row>
                <Row icon={MapPin} label={t.adminOps.common.street}>
                  <span className="wrap-break-words">{data.issue.address?.street || notSet}</span>
                </Row>
                <Row icon={MapPin} label={t.adminOps.common.city}>
                  <span className="wrap-break-words">{data.issue.address?.city || notSet}</span>
                </Row>
                <Row icon={MapPin} label={t.adminOps.common.postalCode}>
                  {data.issue.address?.postalCode || notSet}
                </Row>
              </dl>

              {data.issue.image.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-(--muted)">{t.issueDetail.gallery.before.label}</p>
                  <PhotoGrid images={toPhotos(data.issue.image)} alt={p.photoAlt} />
                </div>
              )}
            </Panel>

            <ProjectLocationPanel location={data.issue.location} />

            <Panel>
              <SectionHead icon={TrendingUp} title={p.detail.progressSection} />
              {updates.length === 0 ? (
                <p className="mt-4 text-sm text-(--muted)">{p.detail.noProgress}</p>
              ) : (
                <ul className="mt-4 space-y-5">
                  {updates.map((u) => (
                    <li key={u._id} className="border-t border-(--line) pt-4 first:border-t-0 first:pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-(--ink)">
                          {p.detail.progressValue.replace("{percent}", f.nf.format(u.progressPercentage))}
                        </span>
                        <span className="text-(--muted)">{p.detail.workDate.replace("{date}", f.date(u.workDate))}</span>
                      </div>
                      <div
                        className="mt-2 h-2 overflow-hidden rounded-full bg-(--line)"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={u.progressPercentage}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, u.progressPercentage))}%`, background: "var(--accent)" }}
                        />
                      </div>
                      {u.description && (
                        <p className="mt-3 whitespace-pre-line wrap-break-word text-sm text-(--ink)">{u.description}</p>
                      )}
                      {u.image.length > 0 && (
                        <div className="mt-3">
                          <PhotoGrid images={toPhotos(u.image)} alt={p.photoAlt} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            {hasCompletion && (
              <Panel gold>
                <SectionHead icon={FileCheck2} title={p.detail.completionSection} gold />
                {completion.submittedAt && (
                  <p className="mt-3 text-sm text-(--muted)">
                    {p.detail.submittedAt.replace("{date}", f.dateTime(completion.submittedAt))}
                  </p>
                )}
                {completion.description && (
                  <p className="mt-3 whitespace-pre-line wrap-break-word text-(--ink)">{completion.description}</p>
                )}
                {completion.image.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium" style={{ color: "var(--ok)" }}>
                      {t.issueDetail.gallery.after.label}
                    </p>
                    <PhotoGrid images={toPhotos(completion.image)} alt={p.photoAlt} />
                  </div>
                )}
              </Panel>
            )}
          </div>

          {/* Right: schedule, staff, start (first on mobile) */}
          <div className="order-1 space-y-6 lg:order-2">
            <Panel>
              <SectionHead icon={CalendarClock} title={p.detail.scheduleSection} />
              <dl className="mt-4 divide-y divide-(--line)">
                <Row icon={CalendarClock} label={p.detail.plannedStart}>
                  {data.plannedStartDate ? f.dateTime(data.plannedStartDate) : notSet}
                </Row>
                <Row icon={CalendarCheck} label={p.detail.plannedEnd}>
                  {data.plannedEndDate ? f.dateTime(data.plannedEndDate) : notSet}
                </Row>
                <Row icon={Timer} label={p.detail.duration}>
                  {p.durationDays.replace("{count}", f.nf.format(data.plannedDurationDays))}
                </Row>
                <Row icon={UserRound} label={p.detail.staff}>
                  <span className="wrap-break-word">{data.projectStaff?.name ?? notSet}</span>
                </Row>
                {data.projectStaff && (
                  <Row icon={Mail} label={p.detail.staffEmail}>
                    <span className="break-all">{data.projectStaff.email}</span>
                  </Row>
                )}
                {data.completedAt && (
                  <Row icon={Clock} label={p.detail.completedAt}>
                    {f.dateTime(data.completedAt)}
                  </Row>
                )}
              </dl>
            </Panel>

            {canStart && <StartProjectPanel projectId={data._id} onStarted={() => setNotice(p.start.success)} />}
            {needsStart && !canStart && <p className="text-sm text-(--muted)">{p.start.locked}</p>}
          </div>
        </div>
      </MotionConfig>
    </AdminPageShell>
  )
}

export default ProjectDetailView