"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/auth-rules";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import type { IssueImage } from "@/types/issueTypes";

export const GOLD: CSSProperties = {
  background: "color-mix(in oklab, var(--ok) 16%, transparent)",
  color: "var(--ok)",
};
export const DANGER: CSSProperties = {
  background: "color-mix(in oklab, var(--warm) 12%, transparent)",
  color: "var(--warm)",
};

export function toneStyle(status: string): CSSProperties | undefined {
  if (["RESOLVED", "COMPLETED", "WINNER_SELECTED", "ACCEPTED", "PASSED"].includes(status)) return GOLD;
  if (["REJECTED", "CANCELLED", "FAILED", "INSPECTION_FAILED", "WITHDRAWN"].includes(status)) return DANGER;
  return undefined;
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className="rounded-full bg-(--accent-soft) px-3 py-1 text-xs font-medium text-(--accent)"
      style={toneStyle(status)}
    >
      {label}
    </span>
  );
}

/** Page load: loading / error / retry. `key` bodlale abar load hoy. */
export function useFetch(run: () => Promise<unknown>, key: string) {
  const { t } = useI18n();
  const generic = t.auth.errors.generic;
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<{ token: string; error: string | null } | null>(null);
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });
  const token = `${key}#${tick}`;

  useEffect(() => {
    let ignore = false;
    runRef
      .current()
      .then(() => {
        if (!ignore) setState({ token, error: null });
      })
      .catch((err: unknown) => {
        if (!ignore) setState({ token, error: getErrorMessage(err, generic) });
      });
    return () => {
      ignore = true;
    };
  }, [token, generic]);

  const settled = state?.token === token;
  return {
    loading: !settled,
    error: settled ? state.error : null,
    retry: () => setTick((n) => n + 1),
  };
}

export function useFmt() {
  const { locale } = useI18n();
  const tag = locale === "bn" ? "bn-BD" : "en";
  const dtag = locale === "bn" ? "bn-BD" : "en-GB";
  return useMemo(() => {
    const d = new Intl.DateTimeFormat(dtag, { dateStyle: "medium" });
    const dt = new Intl.DateTimeFormat(dtag, { dateStyle: "medium", timeStyle: "short" });
    const money = new Intl.NumberFormat(tag, { style: "currency", currency: "BDT", maximumFractionDigits: 0 });
    return {
      nf: new Intl.NumberFormat(tag),
      money: (n: number) => money.format(n),
      date: (v?: string | null) => (v ? d.format(new Date(v)) : "—"),
      dateTime: (v?: string | null) => (v ? dt.format(new Date(v)) : "—"),
    };
  }, [tag, dtag]);
}

export function AdminPageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="relative isolate overflow-hidden">
        <div className="aurora absolute inset-x-0 top-0 -z-10 h-96" aria-hidden="true" />
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-28 lg:px-10">{children}</div>
      </main>
      <Footer />
    </>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="focus-ring mb-6 inline-flex items-center gap-2 rounded-full text-sm text-(--muted) hover:text-(--accent)"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function LoadState({ loading, error, onRetry }: { loading: boolean; error: string | null; onRetry: () => void }) {
  const { t } = useI18n();
  if (error) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center" role="alert">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full" style={DANGER}>
          <AlertTriangle size={26} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h1 className="font-display mt-4 text-xl font-semibold">{t.adminOps.loadFailed.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-(--muted)">{error}</p>
        <button type="button" onClick={onRetry} className="btn-primary focus-ring mt-6 rounded-full px-6 py-2.5 text-sm">
          {t.adminOps.loadFailed.retry}
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-4" aria-busy={loading}>
      {[1, 0.8, 0.6].map((o) => (
        <div key={o} className="card h-24 animate-pulse" style={{ opacity: o }} />
      ))}
    </div>
  );
}

export function Panel({ children, gold }: { children: ReactNode; gold?: boolean }) {
  return (
    <section className="card p-5 sm:p-6" style={gold ? { borderColor: "var(--ok)" } : undefined}>
      {children}
    </section>
  );
}

export function SectionHead({ icon: Icon, title, gold }: { icon: LucideIcon; title: string; gold?: boolean }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)"
        style={gold ? GOLD : undefined}
      >
        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <h2 className="font-display min-w-0 text-lg font-semibold leading-snug">{title}</h2>
    </div>
  );
}

export function Row({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
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

/** alt = "Photo {n} of {total}" type template */
export function PhotoGrid({ images, alt }: { images: IssueImage[]; alt: string }) {
  const { nf } = useFmt();
  if (images.length === 0) return null;
  const total = nf.format(images.length);
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((img, i) => (
        <li key={`${img.url}-${i}`} className="card overflow-hidden rounded-2xl!">
          <a href={img.url} target="_blank" rel="noopener noreferrer" className="focus-ring block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={alt.replace("{n}", nf.format(i + 1)).replace("{total}", total)}
              className="aspect-square w-full object-cover"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}