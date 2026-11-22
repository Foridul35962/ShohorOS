"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { motion, MotionConfig } from "motion/react"
import {
    CalendarCheck,
    CalendarClock,
    ClipboardCheck,
    ClipboardList,
    Clock,
    FileCheck2,
    Lock,
    Mail,
    MapPin,
    Phone,
    Timer,
    TrendingUp,
    UserRound,
} from "lucide-react"

import { getAllocatedInspectionProjectDetails, setReport } from "@/store/slice/inspectorSlice"
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
import InspectionsPanel from "@/components/projects/InspectionsPanel"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"
import InspectorLocked from "./InspectorLocked"
import ReportDialog from "./ReportDialog"
import { isSameDay } from "./inspectorConfig"

const LIST_ROUTE = "/inspector/projects"

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

const InspectorProjectDetailView = () => {
    const { projectId } = useParams<{ projectId: string }>()
    const { t, locale } = useI18n()
    const p = t.inspector
    const d = p.detail
    const f = useFmt()
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)
    const { projectDetails } = useSelector((state: RootState) => state.inspector)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [notice, setNotice] = useState<string | null>(null)
    const [now] = useState(() => Date.now()) // fixed when the page opens

    const { loading, error, retry } = useFetch(
        () => dispatch(getAllocatedInspectionProjectDetails({ projectId })).unwrap(),
        projectId
    )

    const isInspector = user?.role?.toLowerCase() === "inspector"
    // Only show store data for THIS id, so a previous project never flashes
    const data = projectDetails && projectDetails.project._id === projectId ? projectDetails : null

    if (!isInspector) {
        return (
            <AdminPageShell>
                <InspectorLocked />
            </AdminPageShell>
        )
    }

    if (!data) {
        return (
            <AdminPageShell>
                <BackLink href={LIST_ROUTE} label={d.back} />
                <LoadState loading={loading} error={error} onRetry={retry} />
            </AdminPageShell>
        )
    }

    const { project, inspections } = data
    const issue = project.issue
    const Icon = CATEGORY_ICONS[issue.category]
    const district =
        locale === "bn" ? (DISTRICTS.find((x) => x.value === issue.district)?.bn ?? issue.district) : issue.district
    const notSet = t.adminOps.common.notSet

    const updates = [...(project.progressUpdates ?? [])].sort(
        (a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
    )
    const currentProgress = updates.reduce((max, u) => Math.max(max, u.progressPercentage), 0)

    const completion = project.completionSubmission
    const hasCompletion =
        !!completion && (completion.image.length > 0 || !!completion.description || !!completion.submittedAt)

    // The inspector's own LAST inspection decides what they can do
    const mine = inspections
        .filter((i) => i.inspectorId === user?._id)
        .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
    const latest = mine[0] ?? null
    const visit = latest ? new Date(latest.visitDate) : null
    const isToday = !!visit && isSameDay(visit, new Date(now))
    const isFuture = !!visit && !isToday && visit.getTime() > now
    const canReport = !!latest && latest.result === null && isToday

    const sendReport = async (formData: FormData) => {
        await dispatch(setReport(formData)).unwrap()
    }

    return (
        <AdminPageShell>
            <MotionConfig reducedMotion="user">
                <BackLink href={LIST_ROUTE} label={d.back} />

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
                        <span>
                            {d.createdAt}: {f.date(project.createdAt)}
                        </span>
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
                    {/* Left: progress, completion */}
                    <div className="order-2 space-y-6 lg:order-1">
                        <Panel>
                            <SectionHead icon={TrendingUp} title={d.progressSection} />
                            <div className="mt-4">
                                <ProgressBar
                                    percent={currentProgress}
                                    label={d.progressValue.replace("{percent}", f.nf.format(currentProgress))}
                                />
                            </div>
                            {updates.length === 0 ? (
                                <p className="mt-4 text-sm text-(--muted)">{d.noProgress}</p>
                            ) : (
                                <ul className="mt-4 space-y-5">
                                    {updates.map((u) => (
                                        <li key={u._id} className="border-t border-(--line) pt-4 first:border-t-0 first:pt-0">
                                            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                                <span className="font-medium text-(--ink)">
                                                    {d.progressValue.replace("{percent}", f.nf.format(u.progressPercentage))}
                                                </span>
                                                <span className="text-(--muted)">{d.workDate.replace("{date}", f.date(u.workDate))}</span>
                                            </div>
                                            {u.description && (
                                                <p className="mt-2 whitespace-pre-line wrap-break-words text-sm text-(--ink)">{u.description}</p>
                                            )}
                                            {u.image.length > 0 && (
                                                <div className="mt-3">
                                                    <PhotoGrid images={u.image} alt={d.photoAlt} />
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Panel>

                        {hasCompletion && (
                            <Panel gold>
                                <SectionHead icon={FileCheck2} title={d.completionSection} gold />
                                {completion.submittedAt && (
                                    <p className="mt-3 text-sm text-(--muted)">
                                        {d.submittedAt.replace("{date}", f.dateTime(completion.submittedAt))}
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
                                        <PhotoGrid images={completion.image} alt={d.photoAlt} />
                                    </div>
                                )}
                            </Panel>
                        )}
                    </div>

                    {/* Right: report (first on mobile), schedule, issue, inspections, contractor */}
                    <div className="order-1 space-y-6 lg:order-2">
                        <Panel>
                            <SectionHead icon={ClipboardCheck} title={p.report.section} />

                            {latest && (
                                <p className="mt-3 text-sm text-(--muted)">
                                    {p.report.visit}: <span className="font-medium text-(--ink)">{f.dateTime(latest.visitDate)}</span>
                                </p>
                            )}

                            {canReport ? (
                                <>
                                    <p className="mt-3 text-sm text-(--ink)">{p.report.ready}</p>
                                    <button
                                        type="button"
                                        onClick={() => setDialogOpen(true)}
                                        className="btn-primary focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                                    >
                                        <ClipboardCheck size={16} aria-hidden />
                                        {p.report.open}
                                    </button>
                                </>
                            ) : (
                                <div className="mt-3 flex flex-wrap items-start gap-2 text-sm text-(--muted)">
                                    {latest?.result ? (
                                        <>
                                            <StatusBadge status={latest.result} label={t.adminOps.status.inspection[latest.result]} />
                                            <span>{p.report.done}</span>
                                        </>
                                    ) : (
                                        <p className="flex items-start gap-2">
                                            <Lock size={16} className="mt-0.5 shrink-0" aria-hidden />
                                            <span>
                                                {!latest
                                                    ? p.report.none
                                                    : isFuture
                                                        ? p.report.future.replace("{date}", f.date(latest.visitDate))
                                                        : p.report.missed.replace("{date}", f.date(latest.visitDate))}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </Panel>

                        <Panel>
                            <SectionHead icon={CalendarClock} title={d.scheduleSection} />
                            <dl className="mt-4 divide-y divide-(--line)">
                                <Row icon={CalendarClock} label={d.plannedStart}>
                                    {project.plannedStartDate ? f.dateTime(project.plannedStartDate) : notSet}
                                </Row>
                                <Row icon={CalendarCheck} label={d.plannedEnd}>
                                    {project.plannedEndDate ? f.dateTime(project.plannedEndDate) : notSet}
                                </Row>
                                <Row icon={Timer} label={d.duration}>
                                    {d.durationDays.replace("{count}", f.nf.format(project.plannedDurationDays))}
                                </Row>
                                {project.completedAt && (
                                    <Row icon={Clock} label={d.completedAt}>
                                        {f.dateTime(project.completedAt)}
                                    </Row>
                                )}
                            </dl>
                        </Panel>

                        <Panel>
                            <SectionHead icon={ClipboardList} title={d.issueSection} />
                            <p className="mt-4 text-sm font-medium text-(--muted)">{d.description}</p>
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
                                    <PhotoGrid images={issue.image} alt={d.photoAlt} />
                                </div>
                            )}
                        </Panel>

                        <InspectionsPanel inspections={inspections} />

                        {project.contractor && (
                            <Panel>
                                <SectionHead icon={UserRound} title={d.contractorSection} />
                                <dl className="mt-4 divide-y divide-(--line)">
                                    <Row icon={UserRound} label={t.adminOps.common.name}>
                                        <span className="wrap-break-words">{project.contractor.name}</span>
                                    </Row>
                                    {project.contractor.email && (
                                        <Row icon={Mail} label={t.adminOps.common.email}>
                                            <span className="break-all">{project.contractor.email}</span>
                                        </Row>
                                    )}
                                    {project.contractor.phoneNumber && (
                                        <Row icon={Phone} label={t.adminOps.common.phone}>
                                            {project.contractor.phoneNumber}
                                        </Row>
                                    )}
                                </dl>
                            </Panel>
                        )}
                    </div>
                </div>

                {dialogOpen && (
                    <ReportDialog
                        projectId={project._id}
                        onClose={() => setDialogOpen(false)}
                        onSubmit={sendReport}
                        onDone={() => {
                            setNotice(p.report.notice)
                            setDialogOpen(false)
                        }}
                    />
                )}
            </MotionConfig>
        </AdminPageShell>
    )
}

export default InspectorProjectDetailView