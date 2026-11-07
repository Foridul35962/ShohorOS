"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { motion, MotionConfig } from "motion/react"
import {
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
    Timer,
    TrendingUp,
    UserRound,
} from "lucide-react"

import { getStaffProjectDetails, projectProgressUpdates } from "@/store/slice/staffSlice"
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
import { canWorkOnProject } from "./staffProjectConfig"

const LIST_ROUTE = "/staff/project"

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

const StaffProjectDetailView = () => {
    const { projectId } = useParams<{ projectId: string }>()
    const { t, locale } = useI18n()
    const p = t.staffProjectDetail
    const f = useFmt()
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)
    const { project } = useSelector((state: RootState) => state.staff) // TODO: tomar store key thik koro

    const [dialog, setDialog] = useState<WorkKind | null>(null)
    const [notice, setNotice] = useState<string | null>(null)

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

    const canWork = canWorkOnProject(data.status, data.plannedStartDate)
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

    const updates = [...(data.progressUpdates ?? [])].sort(
        (a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()
    )
    const currentProgress = updates[0]?.progressPercentage ?? 0

    const completion = data.completionSubmission
    const hasCompletion =
        !!completion && (completion.image.length > 0 || !!completion.description || !!completion.submittedAt)
    const toPhotos = (urls: string[]) => urls.map((url) => ({ url }))

    const sendProgress = async (formData: FormData) => {
        await dispatch(projectProgressUpdates(formData)).unwrap()
    }

    const sendComplete = async (formData: FormData) => {
        // TODO: backend thunk ready hole ekhane dispatch(completeProject(formData)).unwrap() boshao
        console.log(
            "complete project",
            Array.from(formData.entries()).map(([key, value]) =>
                value instanceof File ? [key, { name: value.name, size: value.size, type: value.type }] : [key, value]
            )
        )
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
                                    {updates.map((u, idx) => {
                                        const label = p.progress.value.replace("{percent}", f.nf.format(u.progressPercentage))
                                        return (
                                            <li key={idx} className="border-t border-(--line) pt-4 first:border-t-0 first:pt-0">
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

                            {canWork ? (
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setDialog("progress")}
                                        className="btn-ghost focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                                    >
                                        <TrendingUp size={16} aria-hidden />
                                        {p.actions.update}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDialog("complete")}
                                        className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                                    >
                                        <CheckCheck size={16} aria-hidden />
                                        {p.actions.complete}
                                    </button>
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
                                    {data.plannedEndDate ? f.dateTime(data.plannedEndDate) : notSet}
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
                        onClose={() => setDialog(null)}
                        onSubmit={dialog === "progress" ? sendProgress : sendComplete}
                        onDone={() => {
                            setNotice(dialog === "progress" ? p.notice.progress : p.notice.complete)
                            setDialog(null)
                        }}
                    />
                )}
            </MotionConfig>
        </AdminPageShell>
    )
}

export default StaffProjectDetailView