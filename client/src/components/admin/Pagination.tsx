"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

/** 1 … 4 5 6 … 20 */
export function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = [...new Set([1, total, current - 1, current, current + 1])].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  keep.forEach((p, i) => { if (i > 0 && p - keep[i - 1] > 1) out.push("gap"); out.push(p); });
  return out;
}

export function Pagination({ page, totalPages, onPage, disabled, labels }: {
  page: number; totalPages: number; onPage: (p: number) => void; disabled?: boolean; labels: { prev: string; next: string; label: string };
}) {
  const { locale } = useI18n();
  const num = (n: number) => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(n);
  if (totalPages <= 1) return null;
  const base = "focus-ring grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm tabular-nums transition-colors disabled:opacity-40";
  return (
    <nav aria-label={labels.label} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={() => onPage(page - 1)} disabled={disabled || page <= 1} className={`${base} btn-ghost px-4! inline-flex items-center gap-1.5`}><ChevronLeft size={16} aria-hidden />{labels.prev}</button>
      {pageList(page, totalPages).map((p, i) => p === "gap"
        ? <span key={`g${i}`} className="px-1 text-(--muted)" aria-hidden>…</span>
        : <button key={p} type="button" onClick={() => onPage(p)} disabled={disabled} aria-current={p === page ? "page" : undefined}
            className={`${base} ${p === page ? "bg-(--ink) text-(--bg)" : "chip text-(--muted) hover:text-(--ink)"}`}>{num(p)}</button>)}
      <button type="button" onClick={() => onPage(page + 1)} disabled={disabled || page >= totalPages} className={`${base} btn-ghost px-4! inline-flex items-center gap-1.5`}>{labels.next}<ChevronRight size={16} aria-hidden /></button>
    </nav>
  );
}