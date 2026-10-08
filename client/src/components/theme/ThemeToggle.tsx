"use client";
import { useI18n } from "@/lib/i18n/provider";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { t } = useI18n();
  const { toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label={t.nav.theme} className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-(--line) text-(--ink) transition hover:border-(--accent)">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="4.2" className="dark:hidden" />
        <path className="dark:hidden" d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
        <path className="hidden dark:block" d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
