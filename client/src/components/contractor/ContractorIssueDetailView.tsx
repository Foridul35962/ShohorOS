"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import {
  Ban,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Gavel,
  Hash,
  Image as ImageIcon,
  Info,
  MapPin,
  Pencil,
  Plus,
  Signpost,
  Timer,
  Wallet,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORY_ICONS } from "@/components/issues/issueConfig";
import { IssueMap } from "@/components/issues/IssueMap";
import { Panel, PhotoGrid, Row, SectionHead, StatusBadge, useFmt } from "@/components/admin/AdminUi";
import type { addBidType, ContractorIssueDetails, editBidType } from "@/types/contractorTypes";
import { BidFormDialog, WithdrawBidDialog } from "./BidDialogs";

type Props = {
  issue: ContractorIssueDetails;
  onAdd: (payload: addBidType) => Promise<void>;
  onEdit: (payload: editBidType) => Promise<void>;
  onWithdraw: (payload: { bidId: string; auctionId: string }) => Promise<void>;
};

export function ContractorIssueDetailView({ issue, onAdd, onEdit, onWithdraw }: Props) {
  const { t, locale } = useI18n();
  const a = t.adminOps;
  const d = t.contractor.detail;
  const { nf, dateTime, date } = useFmt();
  const tag = locale === "bn" ? "bn-BD" : "en";
  const money = new Intl.NumberFormat(tag, { style: "currency", currency: "BDT", maximumFractionDigits: 2 });
  const coord = new Intl.NumberFormat(tag, { minimumFractionDigits: 5, maximumFractionDigits: 5 });

  const [dialog, setDialog] = useState<"add" | "edit" | "withdraw" | null>(null);
  const [notice, setNotice] = useState<"added" | "edited" | "withdrawn" | null>(null);

  // deadline pass hole button nijei lukiye jabe
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const { auction, myBid } = issue;
  const open = auction.status === "ACTIVE" && new Date(auction.deadline).getTime() > now;
  const canAdd = open && !myBid;
  // edit ar withdraw er shorto ek-i: auction ACTIVE + deadline baki + bid SUBMITTED
  const canModify = open && myBid?.status === "SUBMITTED";
  const locked = Boolean(myBid) && myBid?.status === "SUBMITTED" && !canModify;

  const [lon, lat] = issue.location.coordinates; // GeoJSON order
  const CategoryIcon = CATEGORY_ICONS[issue.category];
  const districtLabel =
    locale === "bn" ? (DISTRICTS.find((x) => x.value === issue.district)?.bn ?? issue.district) : issue.district;

  return (
    <MotionConfig reducedMotion="user">
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={auction.status} label={a.status.auction[auction.status]} />
          <span className="chip inline-flex items-center gap-1.5 px-3 py-1 text-xs">
            <CategoryIcon size={14} aria-hidden="true" className="text-(--accent)" />
            {t.issues.categories[issue.category]}
          </span>
        </div>
        <h1 className="font-display mt-4 wrap-break-word text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">
          {issue.title}
        </h1>
        <p className="mt-2 max-w-xl text-(--muted)">{d.postedOn.replace("{date}", date(issue.createdAt))}</p>
      </header>

      {notice ? (
        <p
          role="status"
          className="mb-6 flex items-start gap-2.5 rounded-2xl border border-(--line) bg-(--accent-soft) px-4 py-3.5 text-sm leading-relaxed"
        >
          <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-(--accent)" />
          {d.notices[notice]}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* mobile e bid panel upore */}
        <div className="order-2 min-w-0 space-y-6 lg:order-1">
          <Panel>
            <SectionHead icon={ImageIcon} title={d.sections.photos} />
            <PhotoGrid images={issue.image} alt={t.issueDetail.gallery.before.alt} />
          </Panel>

          <Panel>
            <SectionHead icon={FileText} title={d.sections.description} />
            <p className="whitespace-pre-line wrap-break-word text-[15px] leading-relaxed">{issue.description}</p>
          </Panel>

          <Panel>
            <SectionHead icon={MapPin} title={d.sections.location} />
            <IssueMap lat={lat} lon={lon} />
            <dl className="mt-5 divide-y divide-(--line)">
              <Row icon={MapPin} label={a.common.district}>
                {districtLabel}
              </Row>
              <Row icon={Signpost} label={a.common.street}>
                {issue.address.street}
              </Row>
              <Row icon={Building2} label={a.common.city}>
                {issue.address.city}
              </Row>
              <Row icon={Hash} label={a.common.postalCode}>
                {issue.address.postalCode}
              </Row>
              <Row icon={MapPin} label={a.common.coordinates}>
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
              {a.common.openMap}
            </a>
          </Panel>
        </div>

        <div className="order-1 min-w-0 space-y-6 lg:order-2">
          <Panel>
            <SectionHead icon={Gavel} title={d.sections.auction} />
            <dl className="divide-y divide-(--line)">
              <Row icon={CalendarClock} label={d.auction.startsAt}>
                {dateTime(auction.startsAt)}
              </Row>
              <Row icon={CalendarClock} label={d.auction.deadline}>
                {dateTime(auction.deadline)}
              </Row>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-(--muted)">{open ? d.auction.open : d.auction.closed}</p>
          </Panel>

          <Panel gold={myBid?.status === "ACCEPTED"}>
            <SectionHead icon={Wallet} title={d.sections.myBid} gold={myBid?.status === "ACCEPTED"} />

            {myBid ? (
              <>
                <StatusBadge status={myBid.status} label={a.status.bid[myBid.status]} />
                <dl className="mt-4 divide-y divide-(--line)">
                  <Row icon={Wallet} label={d.bid.budget}>
                    <span className="font-display text-base font-semibold">{money.format(myBid.proposedBudget)}</span>
                  </Row>
                  <Row icon={Timer} label={d.bid.duration}>
                    {a.common.days.replace("{n}", nf.format(myBid.estimatedDurationDays))}
                  </Row>
                  <Row icon={CalendarClock} label={d.bid.submittedAt}>
                    {dateTime(myBid.submittedAt)}
                  </Row>
                  <Row icon={ClipboardList} label={d.bid.workPlan}>
                    <span className="whitespace-pre-line">{myBid.workPlan}</span>
                  </Row>
                </dl>

                {canModify ? (
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    <button
                      type="button"
                      onClick={() => setDialog("edit")}
                      className="btn-primary focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm"
                    >
                      <Pencil size={16} aria-hidden="true" />
                      {d.bid.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDialog("withdraw")}
                      className="btn-ghost focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-(--line) px-5 py-2.5 text-sm font-medium hover:border-(--warm) hover:text-(--warm)"
                    >
                      <Ban size={16} aria-hidden="true" />
                      {d.bid.withdraw}
                    </button>
                  </div>
                ) : locked ? (
                  <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-(--muted)">
                    <Info size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-(--accent)" />
                    {d.bid.locked}
                  </p>
                ) : null}
              </>
            ) : canAdd ? (
              <>
                <p className="text-sm leading-relaxed text-(--muted)">{d.bid.none}</p>
                <button
                  type="button"
                  onClick={() => setDialog("add")}
                  className="btn-primary focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                >
                  <Plus size={16} aria-hidden="true" />
                  {d.bid.add}
                </button>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-(--muted)">{d.bid.noneClosed}</p>
            )}
          </Panel>
        </div>
      </div>

      <AnimatePresence>
        {dialog === "add" ? (
          <BidFormDialog
            key="add"
            mode="add"
            onClose={() => setDialog(null)}
            onSubmit={async (v) => {
              await onAdd({ auctionId: auction._id, ...v });
              setNotice("added");
            }}
          />
        ) : null}
        {dialog === "edit" && myBid ? (
          <BidFormDialog
            key="edit"
            mode="edit"
            bid={myBid}
            onClose={() => setDialog(null)}
            onSubmit={async (_all, changed) => {
              await onEdit({ bidId: myBid._id, auctionId: auction._id, ...changed });
              setNotice("edited");
            }}
          />
        ) : null}
        {dialog === "withdraw" && myBid ? (
          <WithdrawBidDialog
            key="withdraw"
            onClose={() => setDialog(null)}
            onConfirm={async () => {
              await onWithdraw({ bidId: myBid._id, auctionId: auction._id });
              setNotice("withdrawn");
            }}
          />
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}