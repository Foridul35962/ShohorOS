"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { FormAlert } from "@/components/auth/AuthShell";
import { useI18n } from "@/lib/i18n/provider";
import { useFormat } from "./RequestCard";

// Change these two if your moderator routes are different
const TABS = { citizen: "/moderator/requested/citizen", contractor: "/moderator/requested/contractor" } as const;

export function RequestsView({ active, items, loading, error, onRetry, total, page, totalPages, onPage }: {
  active: "citizen" | "contractor"; items: { id: string; node: React.ReactNode }[]; loading: boolean; error: string | null; onRetry: () => void;
  total: number; page: number; totalPages: number; onPage: (p: number) => void;
}) {
  const { t } = useI18n(); const m = t.moderator; const c = m[active]; const f = useFormat();
  const goto = (p: number) => { onPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <>
      <Header />
      <main id="main" className="relative isolate overflow-hidden">
        <div className="aurora absolute inset-x-0 top-0 -z-10 h-96" aria-hidden />
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-28 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">{c.title}</h1>
              <p className="mt-2 max-w-xl text-(--muted)">{c.sub}</p>
            </div>
            <span className="chip px-4 py-1.5 text-sm font-medium"><span className="tabular-nums text-(--accent)">{f.num(total)}</span> {m.pending}</span>
          </div>

          <nav aria-label="Requests" className="chip mt-8 inline-flex p-1 text-sm">
            {(["citizen", "contractor"] as const).map((k) => (
              <Link key={k} href={TABS[k]} aria-current={active === k ? "page" : undefined}
                className={`focus-ring rounded-full px-4 py-1.5 transition ${active === k ? "bg-(--ink) text-(--bg)" : "text-(--muted) hover:text-(--ink)"}`}>{m.tabs[k]}</Link>
            ))}
          </nav>

          <div className="mt-8">
            {error && items.length === 0 ? (
              <div className="space-y-4"><FormAlert message={error} />
                <button type="button" onClick={onRetry} className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium">{m.retry}</button></div>
            ) : loading && items.length === 0 ? (
              <ul className="space-y-4" aria-busy="true">
                {[0, 1, 2].map((i) => <li key={i} className="card h-56 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />)}
              </ul>
            ) : items.length === 0 ? (
              <div className="card grid place-items-center px-6 py-20 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)"><CheckCheck size={30} aria-hidden /></span>
                <h2 className="font-display mt-5 text-xl font-semibold">{c.emptyTitle}</h2>
                <p className="mt-1 max-w-sm text-(--muted)">{c.emptyText}</p>
              </div>
            ) : (
              <ul className="space-y-4">
                <AnimatePresence initial={false} mode="popLayout">
                  {items.map((it) => (
                    <motion.li key={it.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, scale: 0.98 }} transition={{ duration: 0.3 }}>{it.node}</motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {totalPages > 1 && (
            <nav aria-label={m.pagination.label} className="mt-10 flex items-center justify-center gap-3">
              <button type="button" onClick={() => goto(page - 1)} disabled={page <= 1 || loading} className="btn-ghost focus-ring inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm disabled:opacity-40"><ChevronLeft size={16} aria-hidden />{m.pagination.prev}</button>
              <span className="min-w-16 text-center text-sm tabular-nums text-(--muted)" aria-live="polite">{f.num(page)} / {f.num(totalPages)}</span>
              <button type="button" onClick={() => goto(page + 1)} disabled={page >= totalPages || loading} className="btn-ghost focus-ring inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm disabled:opacity-40">{m.pagination.next}<ChevronRight size={16} aria-hidden /></button>
            </nav>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}