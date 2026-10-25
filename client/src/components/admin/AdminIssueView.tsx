"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig } from "motion/react";
import {
  Building2,
  CalendarClock,
  ExternalLink,
  FileText,
  Flag,
  Gavel,
  HardHat,
  Hash,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Signpost,
  User,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICTS } from "@/lib/districts";
import type { IssueDetailsData } from "@/types/adminTypes";
import { CATEGORY_ICONS } from "@/components/issues/issueConfig";
import { Panel, PhotoGrid, Row, SectionHead, StatusBadge, useFmt } from "./AdminUi";
import { StartAuctionDialog } from "./AuctionDialogs";

type Props = { data: IssueDetailsData; onStartAuction: (deadlineIso: string) => Promise<void> };

export function AdminIssueView({ data, onStartAuction }: Props) {
  const { t, locale } = useI18n();
  const a = t.adminOps;
  const c = a.common;
  const x = a.issue;
  const { nf, date, dateTime, money } = useFmt();
  void money;
  const [dialog, setDialog] = useState(false);
  const { issue, project, auction } = data;

  const [lon, lat] = issue.location.coordinates; // GeoJSON order
  const CategoryIcon = CATEGORY_ICONS[issue.category];
  const districtLabel =
    locale === "bn" ? (DISTRICTS.find((d) => d.value === issue.district)?.bn ?? issue.district) : issue.district;
  const canStart = issue.status === "APPROVED" && !auction && !project;
  const reporter = issue.reportedBy;
  const coord = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", {
    minimumFractionDigits: 5,
    maximumFractionDigits: 5,
  });

  return (
    <MotionConfig reducedMotion="user">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={issue.status} label={t.issueDetail.status[issue.status]} />
          <span className="chip inline-flex items-center gap-1.5 px-3 py-1 text-xs">
            <CategoryIcon size={14} aria-hidden="true" className="text-(--accent)" />
            {t.issues.categories[issue.category]}
          </span>
          {issue.priority ? (
            <span className="chip inline-flex items-center gap-1.5 px-3 py-1 text-xs">
              <Flag size={14} aria-hidden="true" className="text-(--accent)" />
              {x.priority.replace("{n}", nf.format(issue.priority))}
            </span>
          ) : null}
        </div>
        <h1 className="font-display mt-4 wrap-break-word text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">
          {issue.title}
        </h1>
        <p className="mt-2 max-w-xl text-(--muted)">{x.reportedOn.replace("{date}", date(issue.createdAt))}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Panel>
            <SectionHead icon={ImageIcon} title={x.sections.photos} />
            <PhotoGrid images={issue.image} alt={t.issueDetail.gallery.before.alt} />
          </Panel>

          <Panel>
            <SectionHead icon={FileText} title={x.sections.description} />
            <p className="whitespace-pre-line wrap-break-word text-[15px] leading-relaxed">{issue.description}</p>
          </Panel>

          <Panel>
            <SectionHead icon={User} title={x.sections.reporter} />
            {reporter ? (
              <dl className="divide-y divide-(--line)">
                <Row icon={User} label={c.name}>
                  {reporter.name}
                </Row>
                <Row icon={Mail} label={c.email}>
                  <a href={`mailto:${reporter.email}`} className="focus-ring rounded text-(--accent)">
                    {reporter.email}
                  </a>
                </Row>
                {reporter.phoneNumber ? (
                  <Row icon={Phone} label={c.phone}>
                    <a href={`tel:${reporter.phoneNumber}`} className="focus-ring rounded text-(--accent)">
                      {reporter.phoneNumber}
                    </a>
                  </Row>
                ) : null}
              </dl>
            ) : (
              <p className="text-sm text-(--muted)">{c.unknown}</p>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel>
            <SectionHead icon={Gavel} title={x.sections.auction} />
            {auction ? (
              <>
                <StatusBadge status={auction.status} label={a.status.auction[auction.status]} />
                <dl className="mt-4 divide-y divide-(--line)">
                  <Row icon={CalendarClock} label={x.auction.startsAt}>
                    {dateTime(auction.startsAt)}
                  </Row>
                  <Row icon={CalendarClock} label={x.auction.deadline}>
                    {dateTime(auction.deadline)}
                  </Row>
                  <Row icon={Gavel} label={x.auction.totalBids}>
                    {nf.format(auction.totalBids)}
                  </Row>
                </dl>
                <Link
                  href={`/admin/auctions/${auction._id}`}
                  className="btn-primary focus-ring mt-5 inline-flex rounded-full px-6 py-2.5 text-sm"
                >
                  {x.auction.view}
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-(--muted)">
                  {canStart ? x.auction.none : x.auction.needsApproval}
                </p>
                {canStart ? (
                  <button
                    type="button"
                    onClick={() => setDialog(true)}
                    className="btn-primary focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                  >
                    <Gavel size={16} aria-hidden="true" />
                    {x.auction.start}
                  </button>
                ) : null}
              </>
            )}
          </Panel>

          <Panel gold={project?.status === "COMPLETED"}>
            <SectionHead icon={HardHat} title={x.sections.project} gold={project?.status === "COMPLETED"} />
            {project ? (
              <>
                <StatusBadge status={project.status} label={a.status.project[project.status]} />
                <dl className="mt-4 divide-y divide-(--line)">
                  <Row icon={User} label={x.project.contractor}>
                    {project.contractor?.name ?? c.unknown}
                  </Row>
                  <Row icon={CalendarClock} label={x.project.duration}>
                    {c.days.replace("{n}", nf.format(project.plannedDurationDays))}
                  </Row>
                  <Row icon={CalendarClock} label={x.project.plannedStart}>
                    {project.plannedStartDate ? date(project.plannedStartDate) : c.notSet}
                  </Row>
                  <Row icon={CalendarClock} label={x.project.plannedEnd}>
                    {project.plannedEndDate ? date(project.plannedEndDate) : c.notSet}
                  </Row>
                </dl>
                <Link
                  href={`/admin/projects/${project._id}`}
                  className="btn-primary focus-ring mt-5 inline-flex rounded-full px-6 py-2.5 text-sm"
                >
                  {x.project.view}
                </Link>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-(--muted)">{x.project.none}</p>
            )}
          </Panel>

          <Panel>
            <SectionHead icon={MapPin} title={x.sections.location} />
            <dl className="divide-y divide-(--line)">
              <Row icon={MapPin} label={c.district}>
                {districtLabel}
              </Row>
              <Row icon={Signpost} label={c.street}>
                {issue.address.street}
              </Row>
              <Row icon={Building2} label={c.city}>
                {issue.address.city}
              </Row>
              <Row icon={Hash} label={c.postalCode}>
                {issue.address.postalCode}
              </Row>
              <Row icon={MapPin} label={c.coordinates}>
                {coord.format(lat)}, {coord.format(lon)}
              </Row>
            </dl>
            <a
              href={`https://www.google.com/maps?q=${lat},${lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
            >
              <ExternalLink size={16} aria-hidden="true" />
              {c.openMap}
            </a>
          </Panel>
        </div>
      </div>

      <AnimatePresence>
        {dialog ? <StartAuctionDialog key="start" onConfirm={onStartAuction} onClose={() => setDialog(false)} /> : null}
      </AnimatePresence>
    </MotionConfig>
  );
}