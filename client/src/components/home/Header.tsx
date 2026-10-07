"use client";
import { useEffect, useState } from "react";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { threshold: 0 });
    const s = document.getElementById("top-sentinel"); if (s) io.observe(s);
    return () => io.disconnect();
  }, []);
  const links = [["#features", t.nav.features], ["#how", t.nav.how], ["#board", t.nav.board], ["#who", t.nav.ecosystem], ["#faq", t.nav.faq]];
  return (
    <>
      <span id="top-sentinel" className="absolute top-0 h-8 w-px" aria-hidden />
      <Link href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-(--surface) focus:px-3 focus:py-2">{t.nav.skip}</Link>
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${stuck || open ? "border-b border-(--line) bg-(--bg)/80 backdrop-blur-xl" : ""}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 lg:px-10">
<<<<<<< Updated upstream
          <a href="#" className="font-display flex items-center gap-2.5 text-lg font-bold" aria-label="ShohorOS">
=======
          <Link href="/" className="font-display flex items-center gap-2.5 text-lg font-bold" aria-label="ShohorOS">
>>>>>>> Stashed changes
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-(--accent)">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" fill="var(--accent-ink)" /><circle cx="12" cy="9" r="2.6" fill="var(--accent)" /></svg>
            </span>
            ShohorOS
          </Link>
          <nav aria-label="Main" className="hidden gap-7 text-sm text-(--muted) lg:flex">
            {links.map(([h, l]) => <Link key={h} href={h} className="transition hover:text-(--ink)">{l}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <div role="group" aria-label={t.nav.language} className="chip flex p-0.5 text-sm">
              {LOCALES.map((l) => (
                <button key={l} onClick={() => setLocale(l)} aria-pressed={locale === l} lang={l}
                  className={`focus-ring rounded-full px-3 py-1 transition ${locale === l ? "bg-(--ink) text-(--bg)" : "text-(--muted) hover:text-(--ink)"}`}>
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
            <ThemeToggle />
<<<<<<< Updated upstream
            <a href="#" className="hidden text-sm text-(--muted) hover:text-(--ink) xl:block xl:px-2">{t.nav.login}</a>
            <a href="#" className="btn-primary focus-ring hidden whitespace-nowrap rounded-full px-4 py-2 text-sm sm:block">{t.nav.report}</a>
=======
            {!user &&
              <>
                <Link href="/login" className="hidden text-sm text-(--muted) hover:text-(--ink) md:block md:px-2">{t.nav.login}</Link>
                <Link href="/registration" className="btn-primary focus-ring hidden whitespace-nowrap rounded-full px-4 py-2 text-sm sm:block">{t.nav.register}</Link>
              </>
            }
>>>>>>> Stashed changes
            <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={t.nav.menu} className="focus-ring chip grid h-9 w-9 place-items-center lg:hidden">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>{open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
            </button>
          </div>
        </div>
        {open && (
          <nav aria-label="Mobile" className="mx-auto flex max-w-7xl flex-col gap-1 px-5 pb-5 lg:hidden">
<<<<<<< Updated upstream
            {links.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-(--muted) hover:bg-(--surface) hover:text-(--ink)">{l}</a>)}
            <a href="#" className="btn-primary mt-2 rounded-full px-4 py-3 text-center">{t.nav.report}</a>
=======
            {links.map(([h, l]) => <Link key={h} href={h} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-(--muted) hover:bg-(--surface) hover:text-(--ink)">{l}</Link>)}
            {
              !user && <>
                <Link href="/login" className="rounded-xl px-3 py-3 text-(--muted) hover:bg-(--surface) hover:text-(--ink)">{t.nav.login}</Link>
                <Link href="/registration" className="btn-primary mt-2 rounded-full px-4 py-3 text-center">{t.nav.register}</Link>
              </>
            }
>>>>>>> Stashed changes
          </nav>
        )}
      </header>
    </>
  );
}
