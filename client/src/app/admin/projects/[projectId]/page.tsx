"use client";

import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getProjectMonitoringDetails } from "@/store/slice/adminSlice";
import { useI18n } from "@/lib/i18n/provider";
import { AdminPageShell, BackLink, LoadState, useFetch } from "@/components/admin/AdminUi";
import { ProjectMonitorView } from "@/components/admin/ProjectMonitorView";

export default function AdminProjectPage() {
  const { t } = useI18n();
  const dispatch = useDispatch<AppDispatch>();
  const { projectId } = useParams<{ projectId: string }>();
  const monitor = useSelector((state: RootState) => state.admin.projectMonitor);
  const { loading, error, retry } = useFetch(
    () => dispatch(getProjectMonitoringDetails({ projectId })).unwrap(),
    projectId,
  );

  const current = monitor && monitor.project._id === projectId ? monitor : null;

  return (
    <AdminPageShell>
      <BackLink
        href={current ? `/admin/issues/${current.project.issue._id}` : "/issues"}
        label={current ? t.adminOps.back.issue : t.adminOps.back.issues}
      />
      {current ? <ProjectMonitorView data={current} /> : <LoadState loading={loading} error={error} onRetry={retry} />}
    </AdminPageShell>
  );
}