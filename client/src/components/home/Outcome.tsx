"use client";
import { useI18n } from "@/lib/i18n/provider";
import { Reveal } from "./Reveal";
import Link from "next/link";

export function Outcome() {
  const { t } = useI18n();
  return (
    <section id="outcome" className="mx-auto max-w-7xl scroll-mt-16 px-5 py-24 lg:px-10 lg:py-36">
      <Reveal>
        <h2 className="font-display max-w-4xl text-[clamp(2.2rem,5.5vw,4.6rem)] font-semibold leading-[1.05]">{t.outcome.title}</h2>
        <p className="mt-5 max-w-xl text-lg text-(--muted)">{t.outcome.body}</p>
      </Reveal>
      <dl className="mt-16 grid gap-10 sm:grid-cols-3">
        {t.outcome.stats.map((s, i) => (
          <Reveal key={s.l} delay={i * 0.08}>
            <div className="border-t border-(--ink) pt-4">
              <dt className="font-display text-7xl font-semibold text-(--accent)">{s.v}</dt>
              <dd className="mt-2 text-(--muted)">{s.l}</dd>
            </div>
          </Reveal>
        ))}
      </dl>
      <Reveal className="mt-24 flex flex-wrap items-center justify-between gap-6 relative overflow-hidden rounded-4xl bg-(--ink) p-8 text-(--bg) md:p-14">
        <p className="font-display text-3xl font-semibold md:text-4xl">{t.outcome.cta}</p>
        <Link href="#" className="btn-primary focus-ring rounded-full px-7 py-3.5">{t.hero.cta}</Link>
      </Reveal>
    </section>
  );
}
