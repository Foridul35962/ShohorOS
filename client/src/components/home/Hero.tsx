"use client";
import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n/provider";
import Link from "next/link";

const pins = [[96, 120], [250, 90], [310, 250], [140, 290]];

function CityMap() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      <rect width="400" height="400" fill="var(--map)" />
      <path d="M-10 330 C80 280 140 340 220 300 S360 250 410 280 V410 H-10Z" fill="var(--water)" opacity=".9" />
      <g fill="var(--line)" opacity=".7">
        {[[60, 70, 60, 50], [150, 150, 50, 50], [230, 150, 60, 50], [70, 230, 50, 40], [320, 70, 50, 60], [330, 150, 40, 70]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} rx="6" />)}
      </g>
      <g stroke="var(--line)" strokeWidth="1.5" fill="none">
        {[60, 140, 220, 300].map((v) => <path key={"h" + v} d={`M0 ${v}H400`} />)}
        {[50, 130, 210, 290, 350].map((v) => <path key={"v" + v} d={`M${v} 0V400`} />)}
        <path d="M0 380 L400 40" strokeWidth="5" />
        <path d="M0 40 C120 100 240 20 400 200" strokeWidth="3" />
      </g>
      {pins.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="6" fill="var(--accent)" className="pulse" style={{ animationDelay: `${i * 0.6}s` }} />
          <circle cx={x} cy={y} r="5.5" fill={i === 0 ? "var(--accent)" : "var(--muted)"} stroke="var(--surface)" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative isolate overflow-hidden">
      <div className="aurora absolute inset-0 -z-10" aria-hidden />
      <div className="grid-bg absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto grid min-h-svh max-w-7xl items-center gap-14 px-5 pb-20 pt-28 lg:grid-cols-[1.1fr_1fr] lg:px-10">
        <div>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="chip mb-7 inline-flex items-center gap-2.5 px-4 py-1.5 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-(--accent)" />{t.hero.eyebrow}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.5rem,6.2vw,5.6rem)] font-semibold leading-[1.02]"><span className="text-shine">{t.hero.title}</span></motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-6 max-w-xl text-lg text-(--muted)">{t.hero.sub}</motion.p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#" className="btn-primary focus-ring rounded-full px-7 py-3.5">{t.hero.cta}</Link>
            <Link href="#how" className="btn-ghost focus-ring rounded-full px-7 py-3.5 font-medium">{t.hero.cta2} ↓</Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-(--muted)">
            {t.hero.trust.map((x) => (
              <li key={x} className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" aria-hidden><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>{x}
              </li>
            ))}
          </ul>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.15 }} className="relative mx-auto w-full max-w-130">
          <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-(--accent) opacity-10 blur-3xl" aria-hidden />
          <div className="relative aspect-square overflow-hidden rounded-4xl border border-(--line)" style={{ boxShadow: "var(--shadow)" }}>
            <CityMap />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-(--line) bg-(--surface)/90 p-4 backdrop-blur-md">
              <div className="flex items-center justify-between text-xs text-(--muted)"><span>{t.hero.ticketLabel}</span><span>{t.hero.ticketId}</span></div>
              <p className="font-display mt-1 text-lg font-semibold">{t.hero.ticketTitle}</p>
              <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-(--accent-soft) px-3 py-1 text-xs font-medium text-(--accent)">
                <span className="h-1.5 w-1.5 rounded-full bg-(--accent)" />{t.hero.ticketStatus}
              </span>
            </div>
          </div>
          <div className="float-slow chip absolute -right-2 top-8 flex items-center gap-2 px-3.5 py-2 text-xs font-medium sm:-right-6" style={{ boxShadow: "var(--shadow)" }}>
            <span className="grid h-5 w-5 place-items-center rounded-full bg-(--accent)"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" strokeWidth="3" aria-hidden><path d="m5 12.5 4.5 4.5L19 7.5" /></svg></span>
            {t.hero.chip}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
