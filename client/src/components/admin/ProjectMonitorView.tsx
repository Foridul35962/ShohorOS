"use client";

import Link from "next/link";
import { MotionConfig } from "motion/react";
import { CalendarClock, CheckCircle2, ClipboardCheck, Hammer, HardHat, Image as ImageIcon, User } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { ProjectMonitorData } from "@/types/adminTypes";
import { CATEGORY_ICONS } from "@/components/issues/issueConfig";
import { Panel, PhotoGrid, Row, SectionHead, StatusBadge, useFmt } from "./AdminUi";

function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label={label}
      className="h-2 overflow-hidden rounded-full bg-(--accent-soft)"
    >
      <div
        className="h-full rounded-full bg-(--accent) transition-[width] duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ProjectMonitorView({ data }: { data: ProjectMonitorData }) {
  const { t } = useI18n();
  const a = t.adminOps;
  const p = a.project;
  const { nf, date } = useFmt();
  const { project, inspections } = data;
  const { issue } = project;
  const CategoryIcon = CATEGORY_ICONS[issue.category];

  const updates = [...project.progressUpdates].sort((x, y) => +new Date(y.workDate) - +new Date(x.workDate));
  const progress = project.progressUpdates.reduce((m, u) => Math.max(m, u.progressPercentage), 0);
  const done = project.completionSubmission;
  const doneImages = done?.image ?? [];
  const hasCompletion = doneImages.length > 0 || Boolean(done?.submittedAt);

  return (
    <MotionConfig reducedMotion="user">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={project.status} label={a.status.project[project.status]} />
          <span className="chip inline-flex items-center gap-1.5 px-3 py-1 text-xs">
            <CategoryIcon size={14} aria-hidden="true" className="text-(--accent)" />
            {t.issues.categories[issue.category]}
          </span>
        </div>
        <h1 className="font-display mt-4 wrap-break-word text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">
          {issue.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={`/admin/issues/${issue._id}`} className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium">
            {p.viewIssue}
          </Link>
          <Link
            href={`/admin/auctions/${project.auctionId}`}
            className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium"
          >
            {p.viewAuction}
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          <Panel>
            <SectionHead icon={Hammer} title={p.sections.progress} />
            {updates.length === 0 ? (
              <p className="text-sm text-(--muted)">{p.noProgress}</p>
            ) : (
              <ol className="space-y-6">
                {updates.map((u) => (
                  <li key={u._id} className="border-l-2 border-(--line) pl-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{p.workDate.replace("{date}", date(u.workDate))}</p>
                      <span className="chip px-3 py-0.5 text-xs">{p.progressValue.replace("{n}", nf.format(u.progressPercentage))}</span>
                    </div>
                    <div className="mt-2">
                      <Progress value={u.progressPercentage} label={p.progressLabel} />
                    </div>
                    <p className="mt-3 whitespace-pre-line wrap-break-word text-sm leading-relaxed">{u.description}</p>
                    <div className="mt-3">
                      <PhotoGrid images={u.image} alt={p.progressPhotoAlt} />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel gold={hasCompletion}>
            <SectionHead icon={CheckCircle2} title={p.sections.completion} gold={hasCompletion} />
            {hasCompletion ? (
              <>
                {done?.submittedAt ? (
                  <p className="mb-3 text-sm text-(--muted)">{p.submittedAt.replace("{date}", date(done.submittedAt))}</p>
                ) : null}
                {done?.description ? (
                  <p className="mb-4 whitespace-pre-line wrap-break-word text-sm leading-relaxed">{done.description}</p>
                ) : null}
                <PhotoGrid images={doneImages} alt={t.issueDetail.gallery.after.alt} />
              </>
            ) : (
              <p className="text-sm text-(--muted)">{p.noCompletion}</p>
            )}
          </Panel>

          <Panel>
            <SectionHead icon={ClipboardCheck} title={p.sections.inspections} />
            {inspections.length === 0 ? (
              <p className="text-sm text-(--muted)">{p.noInspections}</p>
            ) : (
              <ul className="space-y-4">
                {inspections.map((ins) => (
                  <li key={ins._id} className="rounded-2xl border border-(--line) p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <StatusBadge status={ins.result} label={a.status.inspection[ins.result]} />
                      <p className="text-sm text-(--muted)">{p.visitedOn.replace("{date}", date(ins.visitDate))}</p>
                    </div>
                    <p className="mt-3 text-xs text-(--muted)">
                      {p.inspector}: {ins.inspector?.name ?? a.common.unknown}
                    </p>
                    <p className="mt-3 text-xs text-(--muted)">{p.findings}</p>
                    <p className="mt-0.5 whitespace-pre-line wrap-break-word text-sm leading-relaxed">{ins.findings}</p>
                    {ins.correctionNote ? (
                      <>
                        <p className="mt-3 text-xs text-(--muted)">{p.correction}</p>
                        <p className="mt-0.5 whitespace-pre-line wrap-break-word text-sm leading-relaxed">{ins.correctionNote}</p>
                      </>
                    ) : null}
                    {ins.reinspectionRequired ? <p className="chip mt-3 inline-flex px-3 py-1 text-xs">{p.reinspection}</p> : null}
                    <div className="mt-3">
                      <PhotoGrid images={ins.image} alt={p.inspectionPhotoAlt} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="order-1 min-w-0 space-y-6 lg:order-2">
          <Panel>
            <SectionHead icon={HardHat} title={p.sections.plan} />
            <div className="mb-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-(--muted)">{p.progressLabel}</span>
                <span className="font-display font-semibold">{p.progressValue.replace("{n}", nf.format(progress))}</span>
              </div>
              <Progress value={progress} label={p.progressLabel} />
            </div>
            <dl className="divide-y divide-(--line)">
              <Row icon={User} label={p.contractor}>
                {project.contractor?.name ?? a.common.unknown}
                {project.contractor?.email ? <span className="block text-(--muted)">{project.contractor.email}</span> : null}
              </Row>
              <Row icon={CalendarClock} label={p.duration}>
                {a.common.days.replace("{n}", nf.format(project.plannedDurationDays))}
              </Row>
              <Row icon={CalendarClock} label={p.plannedStart}>
                {project.plannedStartDate ? date(project.plannedStartDate) : a.common.notSet}
              </Row>
              <Row icon={CalendarClock} label={p.plannedEnd}>
                {project.plannedEndDate ? date(project.plannedEndDate) : a.common.notSet}
              </Row>
              <Row icon={CheckCircle2} label={p.completedAt}>
                {project.completedAt ? date(project.completedAt) : a.common.notSet}
              </Row>
            </dl>
          </Panel>

          <Panel>
            <SectionHead icon={ImageIcon} title={p.sections.before} />
            <PhotoGrid images={issue.image} alt={t.issueDetail.gallery.before.alt} />
          </Panel>
        </div>
      </div>
    </MotionConfig>
  );
}