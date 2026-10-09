"use client";
import { useState } from "react";
import { CalendarDays, Check, Loader2, X, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICTS } from "@/lib/districts";
import { getErrorMessage } from "@/lib/auth-rules";
import { FormAlert } from "@/components/auth/AuthShell";
import { RejectDialog } from "./RejectDialog";

/** Locale-aware formatting helpers (dates, numbers, district names). */
export function useFormat() {
  const { locale } = useI18n();
  const bn = locale === "bn";
  return {
    date: (iso: string) => new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", { dateStyle: "medium" }).format(new Date(iso)),
    num: (n: number) => new Intl.NumberFormat(bn ? "bn-BD" : "en").format(n),
    district: (value: string) => { const d = DISTRICTS.find((x) => x.value === value); return bn && d ? d.bn : value; },
  };
}

export type Detail = { icon: LucideIcon; label: string; value: string; wide?: boolean };

export function RequestCard({ title, subtitle, badge, details, note, date, onAccept, onReject }: {
  title: string; subtitle: string; badge?: string; details: Detail[]; note?: { label: string; text: string }; date: string;
  onAccept: () => Promise<void>; onReject: (reason: string) => Promise<void>;
}) {
  const { t } = useI18n(); const m = t.moderator;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);

  const accept = async () => {
    setBusy(true); setError(null);
    try { await onAccept(); }                       // on success the card is removed from the list by the slice
    catch (e) { setError(getErrorMessage(e, t.auth.errors.generic)); setBusy(false); }
  };

  return (
    <article className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-lg font-semibold text-(--accent)" aria-hidden>{title.trim().charAt(0).toUpperCase()}</span>
          <div className="min-w-0">
            <h2 className="font-display wrap-break-word text-xl font-semibold">{title}</h2>
            <p className="break-all text-sm text-(--muted)">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {badge && <span className="rounded-full bg-(--accent-soft) px-3 py-1 font-medium text-(--accent)">{badge}</span>}
          <span className="chip inline-flex items-center gap-1.5 px-3 py-1 text-(--muted)"><CalendarDays size={13} aria-hidden />{m.requestedOn} {date}</span>
        </div>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {details.map((d) => (
          <div key={d.label} className={`flex items-start gap-3 ${d.wide ? "sm:col-span-2 lg:col-span-3" : ""}`}>
            <d.icon size={17} className="mt-0.5 shrink-0 text-(--accent)" aria-hidden />
            <div className="min-w-0"><dt className="text-xs text-(--muted)">{d.label}</dt><dd className="wrap-break-word font-medium">{d.value}</dd></div>
          </div>
        ))}
      </dl>

      {note && <div className="mt-5 rounded-2xl bg-(--bg) p-4 text-sm"><p className="mb-1 text-xs text-(--muted)">{note.label}</p><p className="wrap-break-word">{note.text}</p></div>}

      {error && <div className="mt-5"><FormAlert message={error} /></div>}

      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-(--line) pt-5">
        <button type="button" onClick={() => setRejecting(true)} disabled={busy}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-(--line) px-5 py-2.5 text-sm font-medium transition-colors hover:border-(--warm) hover:text-(--warm) disabled:opacity-50"><X size={16} aria-hidden />{m.reject}</button>
        <button type="button" onClick={accept} disabled={busy} className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Check size={16} strokeWidth={2.6} aria-hidden />}{m.accept}
        </button>
      </div>

      <RejectDialog open={rejecting} name={title} onClose={() => setRejecting(false)}
        onConfirm={async (reason) => { await onReject(reason); setRejecting(false); }} />
    </article>
  );
}