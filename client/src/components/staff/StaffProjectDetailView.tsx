"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { motion, MotionConfig } from "motion/react"
import {
    AlertTriangle,
    Building2,
    CalendarCheck,
    CalendarClock,
    CheckCheck,
    ClipboardList,
    Clock,
    FileCheck2,
    HardHat,
    Landmark,
    Lock,
    Mail,
    MapPin,
    Phone,
    RotateCcw,
    Timer,
    TrendingUp,
    UserRound,
} from "lucide-react"

import { completeProject, getStaffProjectDetails, projectProgressUpdates } from "@/store/slice/staffSlice"
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
import ProjectLocationPanel from "@/components/contractor/ProjectLocationPanel"
import { CATEGORY_ICONS } from "@/components/issues/issueConfig"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"
import ProjectWorkDialog, { type WorkKind } from "./ProjectWorkDialog"
import StaffProjectLocked from "./StaffProjectLocked"
import { DEADLINE_ALERT_DAYS, OPEN_STATUSES } from "./staffProjectConfig"

const LIST_ROUTE = "/staff/projects"
const DAY_MS = 86_400_000

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

const logFormData = (name: string, formData: FormData) =>
    console.log(
        name,
        Array.from(formData.entries()).map(([key, value]) =>
            value instanceof File ? [key, { name: value.name, size: value.size, type: value.type }] : [key, value]
        )
    )

const StaffProjectDetailView = () => {
    const { projectId } = useParams<{ projectId: string }>()
    const { t, locale } = useI18n()
    const p = t.staffProjectDetail
    const f = useFmt()
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)
    const { project } = useSelector((state: RootState) => state.staff)

    const [dialog, setDialog] = useState<WorkKind | null>(null)
    const [notice, setNotice] = useState<string | null>(null)
    const [now] = useState(() => Date.now())

    const { loading, error, retry } = useFetch(() => dispatch(getStaffProjectDetails({ projectId })).unwrap(), projectId)

    const isStaff = user?.role?.toLowerCase() === "project-staff"
    // Only show store data for THIS id, so a previous project never flashes
    const data = project && project._id === projectId ? project : null

    if (!isStaff) {
        return (
            <AdminPageShell>
                <StaffProjectLocked />
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

    const updates = [...(data.progressUpdates ?? [])].sort(
        (a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
    )
    // Highest saved percentage = the minimum for the next update
    const currentProgress = updates.reduce((max, u) => Math.max(max, u.progressPercentage), 0)

    // Which button is allowed
    const canUpdate = data.status === "IN_PROGRESS" && currentProgress < 100
    const canComplete = data.status === "IN_PROGRESS" && currentProgress >= 100
    const canResubmit = data.status === "REVISION_REQUIRED"
    const hasAction = canUpdate || canComplete || canResubmit

    const lockedText =
        data.status === "PLANNED"
            ? p.lockedReason.planned
            : data.status === "WORK_SUBMITTED"
                ? p.lockedReason.submitted
                : data.status === "COMPLETED"
                    ? p.lockedReason.completed
                    : data.status === "CANCELLED"
                        ? p.lockedReason.cancelled
                        : p.lockedReason.other

    // Deadline alert: planned end date is within 7 days (or already passed) while the work is still open
    const endMs = data.plannedEndDate ? new Date(data.plannedEndDate).getTime() : NaN
    const isOpen = (OPEN_STATUSES as readonly string[]).includes(data.status)
    const overdue = isOpen && Number.isFinite(endMs) && endMs < now
    const soon = isOpen && Number.isFinite(endMs) && endMs >= now && endMs - now <= DEADLINE_ALERT_DAYS * DAY_MS
    const daysLeft = Math.max(1, Math.ceil((endMs - now) / DAY_MS))
    const deadlineAlert = overdue || soon

    const completion = data.completionSubmission
    const hasCompletion =
        !!completion && (completion.image.length > 0 || !!completion.description || !!completion.submittedAt)
    const toPhotos = (urls: string[]) => urls.map((url) => ({ url }))

    // Status can change on the backend (e.g. IN_PROGRESS -> WORK_SUBMITTED), so reload the project quietly
    const refreshProject = () => {
        void dispatch(getStaffProjectDetails({ projectId }))
    }

    const sendProgress = async (formData: FormData) => {
        await dispatch(projectProgressUpdates(formData)).unwrap()
    }

    const sendComplete = async (formData: FormData) => {
        await dispatch(completeProject(formData)).unwrap()
        refreshProject()
    }

    const sendResubmit = async (formData: FormData) => {
        // TODO: backend thunk ready hole ei 2 line uncomment koro (ar thunk import koro)
        // await dispatch(resubmitProject(formData)).unwrap()
        // refreshProject()
        logFormData("resubmit project", formData)
    }

    const handlers: Record<WorkKind, (formData: FormData) => Promise<void>> = {
        progress: sendProgress,
        complete: sendComplete,
        resubmit: sendResubmit,
    }

    const contractor = data.contractor
    const department = data.issue.department

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
                        <span>
                            {p.createdAt}: {f.date(data.createdAt)}
                        </span>
                    </p>
                </motion.header>

                {deadlineAlert && (
                    <div
                        role="alert"
                        className="mt-6 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm"
                        style={{
                            borderColor: "color-mix(in oklab, var(--warm) 40%, transparent)",
                            background: "color-mix(in oklab, var(--warm) 10%, transparent)",
                            color: "var(--warm)",
                        }}
                    >
                        <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
                        <div className="min-w-0">
                            <p className="font-display font-semibold">{p.deadline.title}</p>
                            <p className="mt-0.5 wrap-break-words">
                                {overdue ? p.deadline.overdue : p.deadline.soon.replace("{days}", f.nf.format(daysLeft))}
                                {data.plannedEndDate && <> ({f.dateTime(data.plannedEndDate)})</>}
                            </p>
                        </div>
                    </div>
                )}

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
                    {/* Left: issue, location, progress, completion */}
                    <div className="order-2 space-y-6 lg:order-1">
                        <Panel>
                            <SectionHead icon={ClipboardList} title={p.issue.section} />
                            <p className="mt-4 text-sm font-medium text-(--muted)">{p.issue.description}</p>
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

                        <ProjectLocationPanel location={data.issue.location?.coordinates} />

                        <Panel>
                            <SectionHead icon={TrendingUp} title={p.progress.section} />
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
                                                <div className="mt-2">
                                                    <ProgressBar percent={u.progressPercentage} label={label} />
                                                </div>
                                                {u.description && (
                                                    <p className="mt-3 whitespace-pre-line wrap-break-words text-sm text-(--ink)">{u.description}</p>
                                                )}
                                                {u.image.length > 0 && (
                                                    <div className="mt-3">
                                                        <PhotoGrid images={toPhotos(u.image)} alt={p.photoAlt} />
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
                                        <PhotoGrid images={toPhotos(completion.image)} alt={p.photoAlt} />
                                    </div>
                                )}
                            </Panel>
                        )}
                    </div>

                    {/* Right: actions, schedule, contractor, department (first on mobile) */}
                    <div className="order-1 space-y-6 lg:order-2">
                        <Panel>
                            <SectionHead icon={HardHat} title={p.actions.title} />

                            <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                                    <span className="text-(--muted)">{p.actions.current}</span>
                                    <span className="font-medium text-(--ink)">
                                        {p.progress.value.replace("{percent}", f.nf.format(currentProgress))}
                                    </span>
                                </div>
                                <ProgressBar percent={currentProgress} label={p.actions.current} />
                            </div>

                            {hasAction ? (
                                <div className="mt-5 flex flex-wrap gap-3">
                                    {canUpdate && (
                                        <button
                                            type="button"
                                            onClick={() => setDialog("progress")}
                                            className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                                        >
                                            <TrendingUp size={16} aria-hidden />
                                            {p.actions.update}
                                        </button>
                                    )}
                                    {canComplete && (
                                        <button
                                            type="button"
                                            onClick={() => setDialog("complete")}
                                            className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                                        >
                                            <CheckCheck size={16} aria-hidden />
                                            {p.actions.complete}
                                        </button>
                                    )}
                                    {canResubmit && (
                                        <button
                                            type="button"
                                            onClick={() => setDialog("resubmit")}
                                            className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                                        >
                                            <RotateCcw size={16} aria-hidden />
                                            {p.actions.resubmit}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-5 flex items-start gap-2 text-sm text-(--muted)">
                                    <Lock size={16} className="mt-0.5 shrink-0" aria-hidden />
                                    <span>{lockedText}</span>
                                </p>
                            )}
                        </Panel>

                        <Panel>
                            <SectionHead icon={CalendarClock} title={p.schedule.section} />
                            <dl className="mt-4 divide-y divide-(--line)">
                                <Row icon={CalendarClock} label={p.schedule.plannedStart}>
                                    {data.plannedStartDate ? f.dateTime(data.plannedStartDate) : notSet}
                                </Row>
                                <Row icon={CalendarCheck} label={p.schedule.plannedEnd}>
                                    {data.plannedEndDate ? (
                                        <span
                                            className={deadlineAlert ? "font-semibold" : undefined}
                                            style={deadlineAlert ? { color: "var(--warm)" } : undefined}
                                        >
                                            {f.dateTime(data.plannedEndDate)}
                                        </span>
                                    ) : (
                                        notSet
                                    )}
                                </Row>
                                <Row icon={Timer} label={p.schedule.duration}>
                                    {p.durationDays.replace("{count}", f.nf.format(data.plannedDurationDays))}
                                </Row>
                                {data.completedAt && (
                                    <Row icon={Clock} label={p.schedule.completedAt}>
                                        {f.dateTime(data.completedAt)}
                                    </Row>
                                )}
                            </dl>
                        </Panel>

                        <Panel>
                            <SectionHead icon={UserRound} title={p.contractor.section} />
                            <dl className="mt-4 divide-y divide-(--line)">
                                <Row icon={UserRound} label={t.adminOps.common.name}>
                                    <span className="wrap-break-words">{contractor?.name ?? notSet}</span>
                                </Row>
                                {contractor?.email && (
                                    <Row icon={Mail} label={t.adminOps.common.email}>
                                        <span className="break-all">{contractor.email}</span>
                                    </Row>
                                )}
                                {contractor?.phone && (
                                    <Row icon={Phone} label={t.adminOps.common.phone}>
                                        {contractor.phone}
                                    </Row>
                                )}
                            </dl>
                        </Panel>

                        {department && (
                            <Panel>
                                <SectionHead icon={Landmark} title={p.department.section} />
                                <dl className="mt-4 divide-y divide-(--line)">
                                    <Row icon={Landmark} label={p.department.name}>
                                        <span className="wrap-break-words">{department.name}</span>
                                    </Row>
                                </dl>
                            </Panel>
                        )}
                    </div>
                </div>

                {dialog && (
                    <ProjectWorkDialog
                        key={dialog}
                        kind={dialog}
                        projectId={data._id}
                        minProgress={currentProgress}
                        onClose={() => setDialog(null)}
                        onSubmit={handlers[dialog]}
                        onDone={() => {
                            setNotice(p.notice[dialog])
                            setDialog(null)
                        }}
                    />
                )}
            </MotionConfig>
        </AdminPageShell>
    )
}

export default StaffProjectDetailView