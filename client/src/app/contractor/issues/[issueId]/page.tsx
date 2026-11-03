"use client";

import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { addBid, editBid, getIssueForContractor, resetBid, withdowBid } from "@/store/slice/contractorSlice";
import { useI18n } from "@/lib/i18n/provider";
import { FormAlert } from "@/components/auth/AuthShell";
import { AdminPageShell, BackLink, LoadState, useFetch } from "@/components/admin/AdminUi";
import { ContractorIssueDetailView } from "@/components/contractor/ContractorIssueDetailView";
import type { addBidType, editBidType } from "@/types/contractorTypes";

export default function ContractorIssuePage() {
  const { t } = useI18n();
  const dispatch = useDispatch<AppDispatch>();
  const { issueId } = useParams<{ issueId: string }>();
  const issue = useSelector((state: RootState) => state.contractor.issue);
  const { loading, error, retry } = useFetch(() => dispatch(getIssueForContractor({ issueId })).unwrap(), issueId);

  const current = issue && issue._id === issueId ? issue : null;

  const handleAdd = async (payload: addBidType) => {
    await dispatch(addBid(payload)).unwrap();
  };
  const handleEdit = async (payload: editBidType) => {
    await dispatch(editBid(payload)).unwrap();
  };
  const handleWithdraw = async (payload: { bidId: string; auctionId: string }) => {
    await dispatch(withdowBid(payload)).unwrap();
  };
  const handleReset = async (payload: { bidId: string; auctionId: string }) => {
    await dispatch(resetBid(payload)).unwrap();
  };

  return (
    <AdminPageShell>
      <BackLink href="/contractor/issues" label={t.contractor.back} />
      {current ? (
        <>
          <FormAlert message={error} />
          <ContractorIssueDetailView
            issue={current}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onWithdraw={handleWithdraw}
            onReset={handleReset}
          />
        </>
      ) : (
        <LoadState loading={loading} error={error} onRetry={retry} />
      )}
    </AdminPageShell>
  );
}