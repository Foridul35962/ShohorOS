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
  Lock,
  MapPin,
  ShieldCheck,
  Timer,
  TrendingUp,
  UserRound,
} from "lucide-react"

import { getDepartmentProject } from "@/store/slice/officerSlice"
import { AppDispatch, RootState } from "@/store/store"
import {
  AdminPageShell,
  BackLink,
  LoadState,
  Panel,
  PhotoGrid,
  Row,
  SectionHead,
  StatusBadge,
  useFetch,
  useFmt,
} from "@/components/admin/AdminUi"
import { CATEGORY_ICONS } from "@/components/issues/issueConfig"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"
import AllocateInspectorPanel from "./AllocateInspectorPanel"

const LIST_ROUTE = "/officer/project" // TODO: tomar officer project list route thik koro

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

const OfficerProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { t, locale } = useI18n()
  const p = t.officerProject
  const f = useFmt()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { departmentProject } = useSelector((state: RootState) => state.officer)
  const [notice, setNotice] = useState<string | null>(null)

  const { loading, error, retry } = useFetch(() => dispatch(getDepartmentProject({ projectId })).unwrap(), projectId)

  const isOfficer = user?.role?.toLowerCase() === "department-officer"
  // Only show store data for THIS id, so a previous project never flashes
  const data = departmentProject && departmentProject.project._id === projectId ? departmentProject : null

  if (!isOfficer) {
    return (
      <AdminPageShell>
        <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
            <Lock size={26} strokeWidth={1.8} aria-hidden />
          </div>
          <p className="font-display text-lg font-semibold text-(--ink)">{p.locked.title}</p>
          <p className="mt-1 text-sm text-(--muted)">{p.locked.text}</p>
        </div>
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

  const { project, inspections } = data
  const issue = project.issue
  const Icon = CATEGORY_ICONS[issue.category]
  const district =
    locale === "bn" ? (DISTRICTS.find((d) => d.value === issue.district)?.bn ?? issue.district) : issue.district
  const notSet = t.adminOps.common.notSet

  const updates = [...(project.progressUpdates ?? [])].sort(
    (x, y) => new Date(y.workDate).getTime() - new Date(x.workDate).getTime()
  )
  const currentProgress = updates.reduce((max, u) => Math.max(max, u.progressPercentage), 0)

  const completion = project.completionSubmission
  const hasCompletion =
    !!completion && (completion.image.length > 0 || !!completion.description || !!completion.submittedAt)

  const lastInspection = data.inspections?.[0];

  const canAllocate = project.status === "WORK_SUBMITTED" &&
    (!lastInspection || lastInspection.result !== null);

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
            <StatusBadge status={project.status} label={t.adminOps.status.project[project.status]} />
            <span className="chip inline-flex items-center gap-1.5 rounded-full bg-(--accent-soft) px-3 py-1 text-sm font-medium text-(--accent)">
              <Icon size={14} aria-hidden />
              {t.issues.categories[issue.category]}
            </span>
          </div>
          <h1 className="font-display mt-3 wrap-break-words text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1] text-(--ink)">
            {issue.title}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-(--muted)">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} aria-hidden />
              {district}
            </span>
            {project.createdAt && (
              <span>
                {p.createdAt}: {f.date(project.createdAt)}
              </span>
            )}
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
          {/* Left: issue, progress, completion, inspections */}
          <div className="order-2 space-y-6 lg:order-1">
            <Panel>
              <SectionHead icon={ClipboardList} title={p.issue.section} />
              <p className="mt-4 text-sm font-medium text-(--muted)">{p.issue.description}</p>
              <p className="mt-1 whitespace-pre-line wrap-break-words text-(--ink)">{issue.description}</p>

              <dl className="mt-4 divide-y divide-(--line)">
                <Row icon={MapPin} label={t.adminOps.common.district}>
                  {district}
                </Row>
                <Row icon={MapPin} label={t.adminOps.common.street}>
                  <span className="wrap-break-words">{issue.address?.street || notSet}</span>
                </Row>
                <Row icon={MapPin} label={t.adminOps.common.city}>
                  <span className="wrap-break-words">{issue.address?.city || notSet}</span>
                </Row>
                <Row icon={MapPin} label={t.adminOps.common.postalCode}>
                  {issue.address?.postalCode || notSet}
                </Row>
              </dl>

              {issue.image.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-medium text-(--muted)">{t.issueDetail.gallery.before.label}</p>
                  <PhotoGrid images={issue.image} alt={p.photoAlt} />
                </div>
              )}
            </Panel>

            <Panel>
              <SectionHead icon={TrendingUp} title={p.progress.section} />
              <div className="mt-4">
                <ProgressBar
                  percent={currentProgress}
                  label={p.progress.value.replace("{percent}", f.nf.format(currentProgress))}
                />
              </div>
              {updates.length === 0 ? (
                <p className="mt-4 text-sm text-(--muted)">{p.progress.empty}</p>
              ) : (
                <ul className="mt-4 space-y-5">
                  {updates.map((u) => {
                    const label = p.progress.value.replace("{percent}", f.nf.format(u.progressPercentage))
                    return (
                      <li key={u._id} className="border-t border-(--line) pt-4 first:border-t-0 first:pt-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="font-medium text-(--ink)">{label}</span>
                          <span className="text-(--muted)">
                            {p.progress.workDate.replace("{date}", f.date(u.workDate))}
                          </span>
                        </div>
                        {u.description && (
                          <p className="mt-2 whitespace-pre-line wrap-break-words text-sm text-(--ink)">{u.description}</p>
                        )}
                        {u.image.length > 0 && (
                          <div className="mt-3">
                            <PhotoGrid images={u.image} alt={p.photoAlt} />
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>

            {hasCompletion && (
              <Panel gold>
                <SectionHead icon={FileCheck2} title={p.completion.section} gold />
                {completion.submittedAt && (
                  <p className="mt-3 text-sm text-(--muted)">
                    {p.completion.submittedAt.replace("{date}", f.dateTime(completion.submittedAt))}
                  </p>
                )}
                {completion.description && (
                  <p className="mt-3 whitespace-pre-line wrap-break-words text-(--ink)">{completion.description}</p>
                )}
                {completion.image.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium" style={{ color: "var(--ok)" }}>
                      {t.issueDetail.gallery.after.label}
                    </p>
                    <PhotoGrid images={completion.image} alt={p.photoAlt} />
                  </div>
                )}
              </Panel>
            )}

            <Panel>
              <SectionHead icon={ShieldCheck} title={p.inspections.section} />
              {inspections.length === 0 ? (
                <p className="mt-4 text-sm text-(--muted)">{p.inspections.empty}</p>
              ) : (
                <ul className="mt-4 space-y-5">
                  {inspections.map((ins, idx) => (
                    <li key={idx} className="border-t border-(--line) pt-4 first:border-t-0 first:pt-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-display min-w-0 wrap-break-words text-sm font-semibold text-(--ink)">
                          {ins.inspector?.name ?? notSet}
                        </p>
                        {ins.result && (
                          <StatusBadge status={ins.result} label={t.adminOps.status.inspection[ins.result]} />
                        )}
                      </div>
                      {ins.inspector?.email && (
                        <p className="mt-0.5 break-all text-xs text-(--muted)">{ins.inspector.email}</p>
                      )}
                      {ins.visitDate && (
                        <p className="mt-2 text-sm text-(--muted)">
                          {p.inspections.visit.replace("{date}", f.dateTime(ins.visitDate))}
                        </p>
                      )}
                      {ins.findings && (
                        <>
                          <p className="mt-3 text-sm font-medium text-(--muted)">{p.inspections.findings}</p>
                          <p className="whitespace-pre-line wrap-break-words text-sm text-(--ink)">{ins.findings}</p>
                        </>
                      )}
                      {ins.correctionNote && (
                        <>
                          <p className="mt-3 text-sm font-medium text-(--muted)">{p.inspections.correction}</p>
                          <p className="whitespace-pre-line wrap-break-words text-sm text-(--ink)">{ins.correctionNote}</p>
                        </>
                      )}
                      {ins.reinspectionRequired && (
                        <p className="mt-2 text-sm font-medium" style={{ color: "var(--warm)" }}>
                          {p.inspections.reinspection}
                        </p>
                      )}
                      {ins.image && ins.image.length > 0 && (
                        <div className="mt-3">
                          <PhotoGrid images={ins.image} alt={p.inspections.photoAlt} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* Right: allocate (first on mobile), schedule */}
          <div className="order-1 space-y-6 lg:order-2">
            {canAllocate && (
              <AllocateInspectorPanel
                projectId={project._id}
                onAllocated={() => {
                  setNotice(p.allocate.success)
                  // status may change on the backend, so reload the project quietly
                  void dispatch(getDepartmentProject({ projectId }))
                }}
              />
            )}

            <Panel>
              <SectionHead icon={CalendarClock} title={p.schedule.section} />
              <dl className="mt-4 divide-y divide-(--line)">
                <Row icon={CalendarClock} label={p.schedule.start}>
                  {project.plannedStartDate ? f.dateTime(project.plannedStartDate) : notSet}
                </Row>
                <Row icon={CalendarCheck} label={p.schedule.end}>
                  {project.plannedEndDate ? f.dateTime(project.plannedEndDate) : notSet}
                </Row>
                <Row icon={Timer} label={p.schedule.duration}>
                  {p.durationDays.replace("{count}", f.nf.format(project.plannedDurationDays))}
                </Row>
                {project.completedAt && (
                  <Row icon={Clock} label={p.schedule.completedAt}>
                    {f.dateTime(project.completedAt)}
                  </Row>
                )}
              </dl>
            </Panel>
          </div>
        </div>
      </MotionConfig>
    </AdminPageShell>
  )
}

export default OfficerProjectView