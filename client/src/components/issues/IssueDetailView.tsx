"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import {
  Building2,
  CheckCircle2,
  Clock,
  Droplets,
  ExternalLink,
  FileText,
  Flag,
  Hash,
  Image as ImageIcon,
  Info,
  MapPin,
  Route,
  ShieldCheck,
  Signpost,
  TrafficCone,
  Trash2,
  TreePine,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICTS } from "@/lib/districts";
// TODO: tomar types path thik koro
import type { IssueCategory, IssueImage, IssuePriority, IssueStatus, IssueTypes } from "@/types/issueTypes";
import { AcceptIssueDialog, RejectIssueDialog } from "./ModerationDialogs";
import { IssueMap } from "./IssueMap";

const CATEGORY_ICONS: Record<IssueCategory, LucideIcon> = {
  ROAD: Route,
  DRAIN: Droplets,
  WATER: Droplets,
  ELEC: Zap,
  WASTE: Trash2,
  BUILDING: Building2,
  PARK: TreePine,
  TRAFFIC: TrafficCone,
};

const WORK_STARTED: IssueStatus[] = ["PROJECT_CREATED", "IN_PROGRESS", "AWAITING_INSPECTION", "REVISION_REQUIRED"];

const GOLD_TILE: CSSProperties = {
  background: "color-mix(in oklab, var(--ok) 16%, transparent)",
  color: "var(--ok)",
};

function statusStyle(status: IssueStatus): CSSProperties | undefined {
  if (status === "RESOLVED") return GOLD_TILE;
  if (status === "REJECTED" || status === "CANCELLED") {
    return { background: "color-mix(in oklab, var(--warm) 12%, transparent)", color: "var(--warm)" };
  }
  return undefined;
}

function SectionHead({
  icon: Icon,
  title,
  sub,
  id,
  gold,
}: {
  icon: LucideIcon;
  title: string;
  sub?: string;
  id?: string;
  gold?: boolean;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)"
        style={gold ? GOLD_TILE : undefined}
      >
        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 id={id} className="font-display text-lg font-semibold leading-snug">
          {title}
        </h2>
        {sub ? <p className="mt-0.5 text-sm leading-relaxed text-(--muted)">{sub}</p> : null}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Icon size={16} strokeWidth={1.8} aria-hidden="true" className="mt-1 shrink-0 text-(--accent)" />
      <div className="min-w-0">
        <dt className="text-xs text-(--muted)">{label}</dt>
        <dd className="mt-0.5 wrap-break-word text-sm leading-relaxed">{children}</dd>
      </div>
    </div>
  );
}

function Gallery({ images, kind }: { images: IssueImage[]; kind: "before" | "after" }) {
  const { t, locale } = useI18n();
  const g = t.issueDetail.gallery[kind];
  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en");
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;
  const safe = Math.min(index, images.length - 1);
  const total = nf.format(images.length);
  const fill = (s: string, n: number) => s.replace("{n}", nf.format(n)).replace("{total}", total);

  const badgeClass =
    kind === "after"
      ? "border-[var(--ok)] text-[var(--ok)]"
      : "border-(--line) text-(--accent)";

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl border border-(--line) bg-(--map)">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[safe].url} alt={fill(g.alt, safe + 1)} className="aspect-4/3 w-full object-cover" />
        <span
          className={`absolute left-3 top-3 rounded-full border bg-(--surface) px-3 py-1 text-xs font-medium ${badgeClass}`}
        >
          {g.badge}
        </span>
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 grid grid-cols-5 gap-2" aria-label={g.label}>
          {images.map((img, i) => (
            <li key={`${img.url}-${i}`}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={fill(g.show, i + 1)}
                aria-current={i === safe ? "true" : undefined}
                className={`focus-ring block w-full overflow-hidden rounded-xl border-2 transition-opacity ${
                  i === safe ? "border-(--accent)" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" aria-hidden="true" className="aspect-square w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type Props = {
  issue: IssueTypes;
  duplicate: boolean;
  canModerate: boolean;
  onAccept: (priority: IssuePriority) => Promise<void>;
  onReject: () => Promise<void>;
};

export function IssueDetailView({ issue, duplicate, canModerate, onAccept, onReject }: Props) {
  const { t, locale } = useI18n();
  const d = t.issueDetail;
  const [dialog, setDialog] = useState<"accept" | "reject" | null>(null);
  const [notice, setNotice] = useState<"accepted" | "rejected" | null>(null);

  const tag = locale === "bn" ? "bn-BD" : "en";
  const nf = new Intl.NumberFormat(tag);
  const coordFmt = new Intl.NumberFormat(tag, { minimumFractionDigits: 5, maximumFractionDigits: 5 });
  const date = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium" }).format(
    new Date(issue.createdAt),
  );

  const CategoryIcon = CATEGORY_ICONS[issue.category];
  const districtLabel =
    locale === "bn" ? (DISTRICTS.find((x) => x.value === issue.district)?.bn ?? issue.district) : issue.district;

  // GeoJSON order: [lon, lat]
  const [lon, lat] = issue.location.coordinates;
  const before = issue.image ?? [];
  const after =
    typeof issue.projectId === "object" && issue.projectId ? (issue.projectId.completionSubmission?.image ?? []) : [];
  const workStarted = WORK_STARTED.includes(issue.status);
  const canAct = canModerate && issue.status === "REPORTED";

  return (
    <MotionConfig reducedMotion="user">
      {duplicate ? (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-(--line) bg-(--accent-soft) px-4 py-3.5"
        >
          <Info size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-(--accent)" />
          <div className="min-w-0">
            <p className="font-display font-semibold">{d.duplicate.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-(--muted)">{d.duplicate.text}</p>
          </div>
        </div>
      ) : null}

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full bg-(--accent-soft) px-3 py-1 text-xs font-medium text-(--accent)"
            style={statusStyle(issue.status)}
          >
            {d.status[issue.status]}
          </span>
          <span className="chip inline-flex items-center gap-1.5 px-3 py-1 text-xs">
            <CategoryIcon size={14} aria-hidden="true" className="text-(--accent)" />
            {t.issues.categories[issue.category]}
          </span>
          {issue.priority ? (
            <span className="chip inline-flex items-center gap-1.5 px-3 py-1 text-xs">
              <Flag size={14} aria-hidden="true" className="text-(--accent)" />
              {d.priority.replace("{n}", nf.format(issue.priority))}
            </span>
          ) : null}
        </div>
        <h1 className="font-display mt-4 wrap-break-word text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">
          {issue.title}
        </h1>
        <p className="mt-2 max-w-xl text-(--muted)">{d.reportedOn.replace("{date}", date)}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* BEFORE */}
          {before.length > 0 ? (
            <section className="card p-5 sm:p-6" aria-labelledby="issue-before-title">
              <SectionHead icon={ImageIcon} id="issue-before-title" title={d.sections.before} sub={d.sections.beforeSub} />
              <Gallery key={`before-${issue._id}`} images={before} kind="before" />
            </section>
          ) : null}

          {/* AFTER */}
          {after.length > 0 ? (
            <section className="card p-5 sm:p-6" aria-labelledby="issue-after-title">
              <SectionHead
                gold
                icon={CheckCircle2}
                id="issue-after-title"
                title={d.sections.after}
                sub={d.sections.afterSub}
              />
              <Gallery key={`after-${issue._id}`} images={after} kind="after" />
            </section>
          ) : workStarted ? (
            <section className="card p-5 sm:p-6" aria-labelledby="issue-after-title">
              <SectionHead icon={Clock} id="issue-after-title" title={d.sections.after} />
              <p className="text-sm leading-relaxed text-(--muted)">{d.sections.afterPending}</p>
            </section>
          ) : null}

          <section className="card p-5 sm:p-6">
            <SectionHead icon={FileText} title={d.sections.description} />
            <p className="whitespace-pre-line wrap-break-word text-[15px] leading-relaxed">{issue.description}</p>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          {canAct ? (
            <section className="card p-5 sm:p-6" aria-labelledby="issue-mod-title">
              <SectionHead icon={ShieldCheck} id="issue-mod-title" title={d.moderation.title} sub={d.moderation.sub} />
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <button
                  type="button"
                  onClick={() => setDialog("accept")}
                  className="btn-primary focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm"
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {d.moderation.accept}
                </button>
                <button
                  type="button"
                  onClick={() => setDialog("reject")}
                  className="btn-ghost focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-(--line) px-5 py-2.5 text-sm font-medium hover:border-(--warm) hover:text-(--warm)"
                >
                  <XCircle size={16} aria-hidden="true" />
                  {d.moderation.reject}
                </button>
              </div>
            </section>
          ) : notice ? (
            <p
              role="status"
              className="flex items-start gap-2.5 rounded-2xl border border-(--line) bg-(--accent-soft) px-4 py-3.5 text-sm leading-relaxed"
            >
              <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-(--accent)" />
              {notice === "accepted" ? d.moderation.accepted : d.moderation.rejected}
            </p>
          ) : null}

          <section className="card p-5 sm:p-6">
            <SectionHead icon={MapPin} title={d.sections.location} />

            <IssueMap lat={lat} lon={lon} />

            <dl className="mt-5 divide-y divide-(--line)">
              <Row icon={MapPin} label={d.details.district}>
                {districtLabel}
              </Row>
              <Row icon={Signpost} label={d.details.street}>
                {issue.address.street}
              </Row>
              <Row icon={Building2} label={d.details.city}>
                {issue.address.city}
              </Row>
              <Row icon={Hash} label={d.details.postalCode}>
                {issue.address.postalCode}
              </Row>
              <Row icon={MapPin} label={d.details.coordinates}>
                {coordFmt.format(lat)}, {coordFmt.format(lon)}
              </Row>
            </dl>
            <a
              href={`https://www.google.com/maps?q=${lat},${lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
            >
              <ExternalLink size={16} aria-hidden="true" />
              {d.details.openMap}
            </a>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {dialog === "accept" ? (
          <AcceptIssueDialog
            key="accept"
            onClose={() => setDialog(null)}
            onConfirm={async (priority) => {
              await onAccept(priority);
              setNotice("accepted");
            }}
          />
        ) : null}
        {dialog === "reject" ? (
          <RejectIssueDialog
            key="reject"
            onClose={() => setDialog(null)}
            onConfirm={async () => {
              await onReject();
              setNotice("rejected");
            }}
          />
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}