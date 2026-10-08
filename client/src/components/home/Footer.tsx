"use client";
import { useI18n } from "@/lib/i18n/provider";
import Link from "next/link";

export function Footer() {
  const { t } = useI18n();
  const f = t.footer;
  return (
    <footer className="border-t border-(--line) bg-(--surface)">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <span className="font-display flex items-center gap-2.5 text-lg font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-(--accent)">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" fill="var(--accent-ink)" /><circle cx="12" cy="9" r="2.6" fill="var(--accent)" /></svg>
            </span>
            ShohorOS
          </span>
          <p className="mt-4 max-w-xs text-(--muted)">{f.blurb}</p>
        </div>
        {f.cols.map((c) => (
          <nav key={c.h} aria-label={c.h}>
            <p className="font-display font-semibold">{c.h}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-(--muted)">
              {c.links.map((l) => <li key={l.l}><Link href={l.h} className="transition hover:text-(--accent)">{l.l}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-(--line)">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-(--muted) lg:px-10">
          <span>{f.tagline}</span><span>{f.rights}</span>
        </div>
      </div>
    </footer>
  );
}
