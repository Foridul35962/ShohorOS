"use client";
import { useI18n } from "@/lib/i18n/provider";

export function Marquee() {
  const { t } = useI18n();
  const items = t.marquee.items;
  return (
    <div className="marquee-wrap relative overflow-hidden border-y border-(--line) bg-(--surface) py-5" aria-label={items.join(", ")}>
      <div className="marquee flex w-max gap-4" aria-hidden>
        {[...items, ...items].map((x, i) => (
          <span key={i} className="chip flex items-center gap-2.5 whitespace-nowrap px-5 py-2 text-sm text-(--muted)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />{x}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-(--surface) to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-(--surface) to-transparent" />
    </div>
  );
}
