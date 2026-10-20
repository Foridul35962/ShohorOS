"use client";

import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getAuctionBids, getAuctionDetails, selectAuctionWinner } from "@/store/slice/adminSlice";
import { useI18n } from "@/lib/i18n/provider";
import { FormAlert } from "@/components/auth/AuthShell";
import { AdminPageShell, BackLink, LoadState, useFetch } from "@/components/admin/AdminUi";
import { AuctionView } from "@/components/admin/AuctionView";

export default function AdminAuctionPage() {
  const { t } = useI18n();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { auctionId } = useParams<{ auctionId: string }>();
  const { auctionDetails, auctionBids } = useSelector((state: RootState) => state.admin);

  const details = useFetch(() => dispatch(getAuctionDetails({ auctionId })).unwrap(), auctionId);
  const bids = useFetch(() => dispatch(getAuctionBids({ auctionId })).unwrap(), auctionId);

  const auction = auctionDetails && auctionDetails._id === auctionId ? auctionDetails : null;
  const bidList = auctionBids && auctionBids.auction._id === auctionId ? auctionBids : null;

  const handleSelect = async (bidId: string) => {
    const res = await dispatch(selectAuctionWinner({ auctionId, bidId })).unwrap();
    const projectId: string | undefined = res?.data?.project?._id;
    if (projectId) {
      router.push(`/admin/projects/${projectId}`);
    } else {
      details.retry();
      bids.retry();
    }
  };

  return (
    <AdminPageShell>
      <BackLink
        href={auction ? `/admin/issues/${auction.issueId}` : "/issues"}
        label={auction ? t.adminOps.back.issue : t.adminOps.back.issues}
      />
      {auction ? (
        <>
          <FormAlert message={details.error} />
          <AuctionView
            auction={auction}
            bids={bidList}
            bidsLoading={bids.loading}
            bidsError={bids.error}
            onRetryBids={bids.retry}
            onSelect={handleSelect}
          />
        </>
      ) : (
        <LoadState loading={details.loading} error={details.error} onRetry={details.retry} />
      )}
    </AdminPageShell>
  );
}