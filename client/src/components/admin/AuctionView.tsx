"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, MotionConfig } from "motion/react";
import { CalendarClock, Gavel, Trophy, User } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { AuctionBid, AuctionBidsData, AuctionDetailsData } from "@/types/adminTypes";
import { LoadState, Panel, Row, SectionHead, StatusBadge, useFmt } from "./AdminUi";
import { SelectWinnerDialog } from "./AuctionDialogs";

type Props = {
  auction: AuctionDetailsData;
  bids: AuctionBidsData | null;
  bidsLoading: boolean;
  bidsError: string | null;
  onRetryBids: () => void;
  onSelect: (bidId: string) => Promise<void>;
};

export function AuctionView({ auction, bids, bidsLoading, bidsError, onRetryBids, onSelect }: Props) {
  const { t } = useI18n();
  const a = t.adminOps;
  const x = a.auction;
  const { nf, money, date, dateTime } = useFmt();
  const [pick, setPick] = useState<AuctionBid | null>(null);

  const canSelect = ["ENDED", "AWAITING_SELECTION"].includes(auction.status) && !auction.winningBidId;
  const list = bids?.bids ?? [];
  const submitted = list.filter((b) => b.status === "SUBMITTED").map((b) => b.proposedBudget);
  const lowest = submitted.length > 0 ? Math.min(...submitted) : null;
  const winner = auction.winningBid;

  return (
    <MotionConfig reducedMotion="user">
      <header className="mb-8">
        <StatusBadge status={auction.status} label={a.status.auction[auction.status]} />
        <h1 className="font-display mt-4 wrap-break-word text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">
          {auction.issue.title}
        </h1>
        <p className="mt-2 max-w-xl text-(--muted)">
          {canSelect ? x.selectHint : auction.status === "ACTIVE" ? x.waitHint : ""}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="order-2 min-w-0 space-y-4 lg:order-1">
          <h2 className="font-display flex items-center gap-2 text-xl font-semibold">
            {x.sections.bids}
            <span className="chip px-3 py-1 text-xs font-normal">{nf.format(auction.totalBids)}</span>
          </h2>

          {!bids ? (
            <LoadState loading={bidsLoading} error={bidsError} onRetry={onRetryBids} />
          ) : list.length === 0 ? (
            <div className="card p-8 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
                <Gavel size={26} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm text-(--muted)">{x.noBids}</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {list.map((bid) => {
                const name = bid.company?.companyName ?? bid.contractor?.name ?? a.common.unknown;
                return (
                  <li key={bid._id} className="card p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="font-display grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-lg font-semibold text-(--accent)">
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display wrap-break-word font-semibold leading-snug">{name}</h3>
                        <p className="wrap-break-word text-sm text-(--muted)">
                          {bid.contractor?.name}
                          {bid.contractor?.email ? ` · ${bid.contractor.email}` : ""}
                        </p>
                        {bid.company?.registrationNumber ? (
                          <p className="text-xs text-(--muted)">
                            {x.regNo}: {bid.company.registrationNumber}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <StatusBadge status={bid.status} label={a.status.bid[bid.status]} />
                        {bid.status === "SUBMITTED" && bid.proposedBudget === lowest ? (
                          <span className="chip px-2.5 py-0.5 text-xs">{x.lowest}</span>
                        ) : null}
                      </div>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-xs text-(--muted)">{x.budget}</dt>
                        <dd className="font-display mt-0.5 text-base font-semibold">{money(bid.proposedBudget)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-(--muted)">{x.duration}</dt>
                        <dd className="mt-0.5">{a.common.days.replace("{n}", nf.format(bid.estimatedDurationDays))}</dd>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <dt className="text-xs text-(--muted)">{x.submittedAt}</dt>
                        <dd className="mt-0.5">{date(bid.submittedAt)}</dd>
                      </div>
                    </dl>

                    <p className="mt-4 text-xs text-(--muted)">{x.workPlan}</p>
                    <p className="mt-0.5 whitespace-pre-line wrap-break-word text-sm leading-relaxed">{bid.workPlan}</p>

                    {canSelect && bid.status === "SUBMITTED" ? (
                      <button
                        type="button"
                        onClick={() => setPick(bid)}
                        className="btn-primary focus-ring mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                      >
                        <Trophy size={16} aria-hidden="true" />
                        {x.select}
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="order-1 min-w-0 space-y-6 lg:order-2">
          <Panel>
            <SectionHead icon={Gavel} title={x.sections.overview} />
            <dl className="divide-y divide-(--line)">
              <Row icon={Gavel} label={x.issue}>
                <Link href={`/admin/issues/${auction.issue._id}`} className="focus-ring rounded text-(--accent)">
                  {x.viewIssue}
                </Link>
              </Row>
              <Row icon={CalendarClock} label={x.startsAt}>
                {dateTime(auction.startsAt)}
              </Row>
              <Row icon={CalendarClock} label={x.deadline}>
                {dateTime(auction.deadline)}
              </Row>
              <Row icon={Gavel} label={x.totalBids}>
                {nf.format(auction.totalBids)}
              </Row>
            </dl>
          </Panel>

          {winner ? (
            <Panel gold>
              <SectionHead icon={Trophy} title={x.sections.winner} gold />
              <dl className="divide-y divide-(--line)">
                <Row icon={User} label={a.issue.project.contractor}>
                  {winner.contractor?.name ?? a.common.unknown}
                </Row>
                <Row icon={Trophy} label={x.budget}>
                  {money(winner.proposedBudget)}
                </Row>
                {auction.selectedBy ? (
                  <Row icon={User} label={x.selectedBy}>
                    {auction.selectedBy.name}
                  </Row>
                ) : null}
                <Row icon={CalendarClock} label={x.selectedAt}>
                  {date(auction.selectedAt)}
                </Row>
              </dl>
            </Panel>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {pick ? (
          <SelectWinnerDialog key="winner" bid={pick} onConfirm={() => onSelect(pick._id)} onClose={() => setPick(null)} />
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}