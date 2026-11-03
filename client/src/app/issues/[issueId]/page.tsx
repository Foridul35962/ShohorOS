"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import {
  clearDuplicateIssue,
  getIssueForPublic,
} from "@/store/slice/issueSlice";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/auth-rules";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { IssueDetailView } from "@/components/issues/IssueDetailView";
import { IssuePriority } from "@/types/issueTypes";
import { acceptIssue, rejectIssue } from "@/store/slice/moderatorSlice";

export default function IssuePage() {
  const { t } = useI18n();
  const dispatch = useDispatch<AppDispatch>();
  const { issueId } = useParams<{ issueId: string }>();
  const { issue, isDuplicateIssue } = useSelector((state: RootState) => state.issue);
  const user = useSelector((state: RootState) => state.auth).user;

  // store e onno issue thakle seta dekhabo na
  const current = issue && issue._id === issueId ? issue : null;

  // flag ta prothom render e dhore rakhi, tarpor store theke clear kori
  const [duplicate] = useState(() => Boolean(isDuplicateIssue && current));
  useEffect(() => {
    dispatch(clearDuplicateIssue());
  }, [dispatch]);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const genericError = t.auth.errors.generic;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      await dispatch(getIssueForPublic({ issueId })).unwrap();
    } catch (error) {
      setLoadError(getErrorMessage(error, genericError));
    } finally {
      setLoading(false);
    }
  }, [dispatch, issueId, genericError]);

  const hasIssue = Boolean(current);
  useEffect(() => {
    if (!hasIssue) void load();
  }, [hasIssue, load]);

  const canModerate = user?.role?.toLowerCase() === "moderator";

  const handleAccept = async (priority: IssuePriority) => {
    await dispatch(acceptIssue({ issueId, priority })).unwrap();
  };
  const handleReject = async () => {
    await dispatch(rejectIssue({ issueId })).unwrap();
  };

  return (
    <>
      <Header />
      <main className="relative isolate overflow-hidden">
        <div className="aurora absolute inset-x-0 top-0 -z-10 h-96" aria-hidden="true" />
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-28 lg:px-10">
          <Link
            href="/"
            className="focus-ring mb-6 inline-flex items-center gap-2 rounded-full text-sm text-(--muted) hover:text-(--accent)"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t.issueDetail.back}
          </Link>

          {current ? (
            <IssueDetailView
              issue={current}
              duplicate={duplicate}
              canModerate={canModerate}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ) : loadError ? (
            <div className="card mx-auto max-w-md p-8 text-center" role="alert">
              <span
                className="mx-auto grid h-16 w-16 place-items-center rounded-full text-(--warm)"
                style={{ background: "color-mix(in oklab, var(--warm) 12%, transparent)" }}
              >
                <AlertTriangle size={26} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h1 className="font-display mt-4 text-xl font-semibold">{t.issueDetail.loadFailed.title}</h1>
              <p className="mt-2 text-sm leading-relaxed text-(--muted)">{loadError}</p>
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="btn-primary focus-ring mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
              >
                {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
                {t.issueDetail.loadFailed.retry}
              </button>
            </div>
          ) : (
            <div className="space-y-4" aria-busy="true">
              <div className="card h-24 animate-pulse" />
              <div className="card h-24 animate-pulse opacity-80" />
              <div className="card h-24 animate-pulse opacity-60" />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}