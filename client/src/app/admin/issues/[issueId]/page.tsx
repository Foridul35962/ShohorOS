"use client";

import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getIssueAdminDetails, startAuction } from "@/store/slice/adminSlice";
import { useI18n } from "@/lib/i18n/provider";
import { FormAlert } from "@/components/auth/AuthShell";
import { AdminPageShell, BackLink, LoadState, useFetch } from "@/components/admin/AdminUi";
import { AdminIssueView } from "@/components/admin/AdminIssueView";

export default function AdminIssuePage() {
  const { t } = useI18n();
  const dispatch = useDispatch<AppDispatch>();
  const { issueId } = useParams<{ issueId: string }>();
  const details = useSelector((state: RootState) => state.admin.issueDetails);
  const { loading, error, retry } = useFetch(() => dispatch(getIssueAdminDetails({ issueId })).unwrap(), issueId);

  // store e onno issue thakle dekhabo na
  const current = details && details.issue._id === issueId ? details : null;

  const handleStart = async (deadline: string) => {
    await dispatch(startAuction({ issueId, deadline: deadline as string })).unwrap();
    retry(); // backend cache delete kore, tai fresh data ashbe
  };

  return (
    <AdminPageShell>
      <BackLink href="/issues" label={t.adminOps.back.issues} />
      {current ? (
        <>
          <FormAlert message={error} />
          <AdminIssueView data={current} onStartAuction={handleStart} />
        </>
      ) : (
        <LoadState loading={loading} error={error} onRetry={retry} />
      )}
    </AdminPageShell>
  );
}