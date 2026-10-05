"use client";
import { useI18n } from "@/lib/i18n/provider";
import { Reveal } from "./Reveal";

export function Problem() {
  const { t } = useI18n();
  return (
    <section className="border-y border-(--line) bg-(--surface)">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-2 lg:px-10 lg:py-36">
        <Reveal>
          <h2 className="font-display text-[clamp(1.9rem,4vw,3.4rem)] font-semibold leading-[1.1]">{t.problem.title}</h2>
          <p className="mt-6 max-w-lg text-(--muted)">{t.problem.body}</p>
        </Reveal>
        <ol className="self-end">
          {t.problem.items.map((it, i) => (
            <Reveal key={it} delay={i * 0.05}>
              <li className="flex items-baseline gap-5 border-t border-(--line) py-4 last:border-b">
                <span className="w-6 text-sm tabular-nums text-(--accent)">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-2xl">{it}</span>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
