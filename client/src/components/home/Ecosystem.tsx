"use client";
import { useI18n } from "@/lib/i18n/provider";
import { Reveal } from "./Reveal";

export function Ecosystem() {
  const { t } = useI18n();
  return (
    <section id="who" className="scroll-mt-16 border-y border-(--line) bg-(--surface)">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-10 lg:py-36">
        <Reveal>
          <h2 className="font-display max-w-3xl text-[clamp(1.9rem,4vw,3.4rem)] font-semibold leading-[1.1]">{t.ecosystem.title}</h2>
          <p className="mt-4 max-w-xl text-(--muted)">{t.ecosystem.sub}</p>
        </Reveal>
        <ul className="mt-14">
          {t.ecosystem.roles.map((r, i) => (
            <Reveal key={r.n} delay={i * 0.04}>
              <li className="group grid items-baseline gap-2 border-t border-(--line) py-5 transition-colors last:border-b hover:border-t-(--accent) md:grid-cols-[3rem_1fr_1.4fr]">
                <span className="text-sm tabular-nums text-(--accent)">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-2xl font-semibold transition-transform group-hover:translate-x-1">{r.n}</span>
                <span className="text-(--muted)">{r.d}</span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
