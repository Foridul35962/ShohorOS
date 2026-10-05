"use client";
import { useI18n } from "@/lib/i18n/provider";
import { Reveal } from "./Reveal";

const ICONS = [
  "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7ZM12 6.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
  "M4 6h16M7 12h10M10 18h4",
  "M3 7h18v10H3zM12 9.5v5M9.5 12h5",
  "M4 20V10M10 20V4M16 20v-7M22 20H2",
  "M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6l-8-3ZM8.5 12l2.5 2.5L16 9.5",
  "M5 4h14v16H5zM9 9h6M9 13h6M9 17h3",
];
const SPAN = ["lg:col-span-4", "lg:col-span-2", "lg:col-span-2", "lg:col-span-4", "lg:col-span-3", "lg:col-span-3"];

function Mini({ k }: { k: number }) {
  if (k === 0) return (
    <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-(--muted)" aria-hidden>
      {["📷", "📍", "✎"].map((e, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-(--line) bg-(--bg) text-lg">{e}</span>
          {i < 2 && <span className="h-px w-8 bg-(--line)" />}
        </span>
      ))}
      <span className="chip ml-1 px-3 py-1 font-medium text-(--accent)">&lt; 1 min</span>
    </div>
  );
  if (k === 3) return (
    <div className="mt-8 flex h-16 items-end gap-2" aria-hidden>
      {[28, 40, 36, 55, 62, 78, 90].map((h, i) => <span key={i} className="flex-1 rounded-md" style={{ height: `${h}%`, background: i > 4 ? "var(--accent)" : "var(--accent-soft)" }} />)}
    </div>
  );
  return null;
}

export function Features() {
  const { t } = useI18n();
  return (
    <section id="features" className="mx-auto max-w-7xl scroll-mt-16 px-5 py-24 lg:px-10 lg:py-36">
      <Reveal>
        <h2 className="font-display max-w-3xl text-[clamp(1.9rem,4vw,3.4rem)] font-semibold leading-[1.1]">{t.features.title}</h2>
        <p className="mt-4 max-w-xl text-(--muted)">{t.features.sub}</p>
      </Reveal>
      <div className="mt-14 grid gap-4 lg:grid-cols-6">
        {t.features.items.map((f, i) => (
          <Reveal key={f.t} delay={(i % 3) * 0.06} className={SPAN[i]}>
            <article className="card group relative h-full overflow-hidden p-7 transition-colors hover:border-(--accent) lg:p-8">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-(--accent) opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15" aria-hidden />
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={ICONS[i]} /></svg>
              </span>
              <h3 className="font-display mt-6 text-2xl font-semibold">{f.t}</h3>
              <p className="mt-2 max-w-md text-(--muted)">{f.d}</p>
              <Mini k={i} />
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
