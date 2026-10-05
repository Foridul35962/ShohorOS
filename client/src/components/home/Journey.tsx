"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n/provider";

const N = 8;

function Rail({ active }: { active: number }) {
  return (
    <div className="relative" aria-hidden>
      <div className="absolute left-0 right-0 top-1.75 h-px bg-(--line)" />
      <motion.div className="absolute left-0 top-1.75 h-px bg-(--accent)" animate={{ width: `${(active / (N - 1)) * 100}%` }} transition={{ duration: 0.5 }} />
      <div className="relative flex justify-between">
        {Array.from({ length: N }).map((_, i) => (
          <span key={i} className={`h-3.75 w-3.75 rounded-full border-2 transition-colors duration-300 ${i <= active ? "border-(--accent) bg-(--accent)" : "border-(--line) bg-(--bg)"}`} />
        ))}
      </div>
    </div>
  );
}

export function Journey() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setI(Math.min(N - 1, Math.max(0, Math.floor(v * N)))));
  const s = t.journey.stages;

  const Static = (
    <ol className={`mx-auto max-w-3xl px-5 py-20 ${reduced ? "" : "lg:hidden"}`}>
      {s.map((st, k) => (
        <li key={st.k} className="relative border-l border-(--line) pb-10 pl-7 last:pb-0">
          <span className="absolute -left-1.75 top-1.5 h-3.5 w-3.5 rounded-full bg-(--accent)" />
          <p className="text-xs uppercase tracking-widest text-(--accent)">{t.journey.stageOf} {k + 1} · {st.actor}</p>
          <h3 className="font-display mt-1 text-3xl font-semibold">{st.k}</h3>
          <p className="mt-2 text-(--muted)">{st.body}</p>
        </li>
      ))}
    </ol>
  );

  return (
    <section id="how" className="scroll-mt-16">
      <div className="mx-auto max-w-7xl px-5 pt-24 lg:px-10 lg:pt-36">
        <h2 className="font-display max-w-3xl text-[clamp(1.9rem,4vw,3.4rem)] font-semibold leading-[1.1]">{t.journey.title}</h2>
        <p className="mt-4 text-(--muted)">{t.journey.sub}</p>
      </div>
      {Static}
      {!reduced && (
        <div ref={ref} className="hidden h-[480vh] lg:block">
          <div className="sticky top-0 flex h-screen flex-col justify-center gap-14 px-10">
            <div className="mx-auto grid w-full max-w-7xl grid-cols-[1fr_380px] items-center gap-16">
              <div aria-live="polite" className="relative min-h-80">
                <AnimatePresence mode="wait">
                  <motion.div key={i} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.35 }}>
                    <p className="text-sm uppercase tracking-[0.2em] text-(--accent)">{t.journey.stageOf} {i + 1} / {N} · {s[i].actor}</p>
                    <h3 className="font-display mt-3 text-[clamp(4rem,10vw,9rem)] font-semibold leading-none">{s[i].k}</h3>
                    <p className="mt-6 max-w-lg text-xl text-(--muted)">{s[i].body}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="card p-6">
                <p className="text-xs text-(--muted)">{t.hero.ticketId}</p>
                <p className="font-display mt-1 text-xl font-semibold">{t.hero.ticketTitle}</p>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-(--line)">
                  <motion.div className="h-full rounded-full" style={{ background: i === N - 1 ? "var(--ok)" : "var(--accent)" }} animate={{ width: `${((i + 1) / N) * 100}%` }} />
                </div>
                <p className="mt-3 text-sm font-medium" style={{ color: i === N - 1 ? "var(--ok)" : "var(--accent)" }}>{s[i].k}</p>
              </div>
            </div>
            <div className="mx-auto w-full max-w-7xl"><Rail active={i} /></div>
          </div>
        </div>
      )}
    </section>
  );
}
