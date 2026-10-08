"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useI18n } from "@/lib/i18n/provider";
import { Reveal } from "./Reveal";

const KEYS = ["all", "review", "building", "inspect", "resolved"] as const;
type Key = (typeof KEYS)[number];

export function Board() {
  const { t } = useI18n();
  const [f, setF] = useState<Key>("all");
  const b = t.board;
  const rows = b.tickets.filter((x) => f === "all" || x.s === f);
  const count = (k: Key) => (k === "all" ? b.tickets.length : b.tickets.filter((x) => x.s === k).length);
  const done = (s: string) => s === "resolved";
  return (
    <section id="board" className="mx-auto max-w-7xl scroll-mt-16 px-5 py-24 lg:px-10 lg:py-36">
      <Reveal>
        <h2 className="font-display max-w-3xl text-[clamp(1.9rem,4vw,3.4rem)] font-semibold leading-[1.1]">{b.title}</h2>
        <p className="mt-4 max-w-xl text-(--muted)">{b.sub}</p>
      </Reveal>
      <Reveal delay={0.1} className="mt-12">
        <div className="card overflow-hidden" style={{ boxShadow: "var(--shadow)" }}>
          <div className="flex items-center gap-3 border-b border-(--line) bg-(--bg) px-5 py-3">
            <span className="flex gap-1.5" aria-hidden>{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-(--line)" />)}</span>
            <span className="mx-auto text-xs text-(--muted)">{b.window}</span>
          </div>
          <div role="tablist" className="flex gap-2 overflow-x-auto border-b border-(--line) p-4">
            {KEYS.map((k) => (
              <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)}
                className={`focus-ring flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-sm transition ${f === k ? "bg-(--ink) text-(--bg)" : "chip text-(--muted) hover:text-(--ink)"}`}>
                {b.status[k]}<span className="text-xs opacity-60">{count(k)}</span>
              </button>
            ))}
          </div>
          <ul className="min-h-104 divide-y divide-(--line)">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((x) => (
                <motion.li key={x.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                  className="grid items-center gap-3 px-5 py-4 md:grid-cols-[6rem_1fr_9rem_11rem]">
                  <span className="text-sm tabular-nums text-(--muted)">{x.id}</span>
                  <div><p className="font-medium">{x.title}</p><p className="text-sm text-(--muted)">{x.area}</p></div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-medium" style={{ background: done(x.s) ? "color-mix(in oklab, var(--ok) 16%, transparent)" : "var(--accent-soft)", color: done(x.s) ? "var(--ok)" : "var(--accent)" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />{b.status[x.s as Exclude<Key, "all">]}
                  </span>
                  <div aria-label={`${b.progress} ${x.p}%`} className="h-1.5 overflow-hidden rounded-full bg-(--line)">
                    <motion.div className="h-full rounded-full" style={{ background: done(x.s) ? "var(--ok)" : "var(--accent)" }} initial={{ width: 0 }} animate={{ width: `${x.p}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
        <p className="mt-3 text-center text-xs text-(--muted)">{b.note}</p>
      </Reveal>
    </section>
  );
}
