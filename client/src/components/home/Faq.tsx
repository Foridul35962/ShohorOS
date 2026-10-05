"use client";
import { useI18n } from "@/lib/i18n/provider";
import { Reveal } from "./Reveal";

export function Faq() {
  const { t } = useI18n();
  return (
    <section id="faq" className="scroll-mt-16 border-t border-(--line)">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[1fr_1.4fr] lg:px-10 lg:py-36">
        <Reveal>
          <h2 className="font-display text-[clamp(1.9rem,4vw,3.4rem)] font-semibold leading-[1.1]">{t.faq.title}</h2>
          <p className="mt-4 max-w-sm text-(--muted)">{t.faq.sub}</p>
        </Reveal>
        <div className="space-y-3">
          {t.faq.items.map((it, i) => (
            <Reveal key={it.q} delay={i * 0.04}>
              <details className="card group px-6 py-5 transition-colors open:border-(--accent)" name="faq">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {it.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-(--accent-soft) text-(--accent) transition-transform group-open:rotate-45" aria-hidden>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-(--muted)">{it.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
