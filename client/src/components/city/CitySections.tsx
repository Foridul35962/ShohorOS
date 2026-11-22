// citySections.tsx

"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { motion, MotionConfig } from "motion/react"
import {
  ArrowRight,
  Bell,
  Check,
  ClipboardCheck,
  Eye,
  FilePlus2,
  FolderKanban,
  Gavel,
  HardHat,
  Landmark,
  Megaphone,
  MapPinned,
  ShieldCheck,
  Sprout,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"

import { useI18n } from "@/lib/i18n/provider"

const wrap = "mx-auto max-w-5xl px-5 lg:px-10"
const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.3, ease: "easeOut" as const },
}

const Heading = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="max-w-2xl">
    <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1] text-(--ink)">{title}</h2>
    {sub && <p className="mt-3 text-(--muted)">{sub}</p>}
  </div>
)

const IconTile = ({ icon: Icon }: { icon: LucideIcon }) => (
  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
    <Icon size={20} strokeWidth={1.8} aria-hidden />
  </span>
)

/* ------------------------------ How it works ------------------------------ */

const STEP_ICONS: LucideIcon[] = [Megaphone, ShieldCheck, Landmark, FolderKanban, HardHat, ClipboardCheck]

export function HowItWorks() {
  const { t, locale } = useI18n()
  const h = t.cityHome.how
  const nf = useMemo(() => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en"), [locale])

  return (
    <section id="how" className="scroll-mt-20 bg-(--bg) py-24">
      <MotionConfig reducedMotion="user">
        <div className={wrap}>
          <Heading title={h.title} sub={h.sub} />
          <ol className="relative ms-4 mt-12 border-s border-(--line)">
            {h.steps.map((step, i) => (
              <motion.li key={step.title} {...fade} className="relative pb-8 ps-8 last:pb-0">
                <span className="absolute -start-4 top-0 grid h-8 w-8 place-items-center rounded-full bg-(--accent) text-sm font-semibold text-(--accent-ink)">
                  {nf.format(i + 1)}
                </span>
                <div className="card flex items-start gap-4 p-5">
                  <IconTile icon={STEP_ICONS[i] ?? Megaphone} />
                  <div className="min-w-0">
                    <h3 className="font-display break-words text-lg font-semibold text-(--ink)">{step.title}</h3>
                    <p className="mt-1 text-sm text-(--muted)">{step.text}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </MotionConfig>
    </section>
  )
}

/* -------------------------------- Features -------------------------------- */

const FEATURE_ICONS: LucideIcon[] = [FilePlus2, Landmark, TrendingUp, Gavel, ClipboardCheck, Bell, MapPinned]

export function Features() {
  const { t } = useI18n()
  const f = t.cityHome.features

  return (
    <section className="bg-(--bg) pb-24">
      <MotionConfig reducedMotion="user">
        <div className={wrap}>
          <Heading title={f.title} sub={f.sub} />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {f.items.map((item, i) => {
              const last = i === f.items.length - 1
              return (
                <motion.li
                  key={item.title}
                  {...fade}
                  transition={{ ...fade.transition, delay: Math.min(i, 5) * 0.04 }}
                  className={`group card relative overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1 ${
                    last ? "sm:col-span-2 lg:col-span-3" : ""
                  }`}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-(--accent) transition-transform duration-300 group-hover:scale-x-100"
                    aria-hidden
                  />
                  <IconTile icon={FEATURE_ICONS[i] ?? FilePlus2} />
                  <h3 className="font-display mt-4 break-words text-lg font-semibold text-(--ink)">{item.title}</h3>
                  <p className="mt-1 text-sm text-(--muted)">{item.text}</p>
                </motion.li>
              )
            })}
          </ul>
        </div>
      </MotionConfig>
    </section>
  )
}

/* ----------------------------- Transparency ------------------------------ */

const STAGES = ["REPORTED", "UNDER_REVIEW", "PROJECT_CREATED", "IN_PROGRESS", "AWAITING_INSPECTION", "RESOLVED"] as const
const CURRENT_STAGE = 3

export function Transparency() {
  const { t, locale } = useI18n()
  const x = t.cityHome.transparency
  const nf = useMemo(() => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en"), [locale])
  const PROGRESS = 60

  return (
    <section className="bg-(--surface) py-24">
      <MotionConfig reducedMotion="user">
        <div className={`${wrap} grid items-center gap-12 lg:grid-cols-2`}>
          <div>
            <Heading title={x.title} sub={x.text} />
            <ul className="mt-8 space-y-3">
              {x.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-(--ink)">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
                    <Check size={14} strokeWidth={2.5} aria-hidden />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <motion.div {...fade} className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="chip rounded-full bg-(--accent-soft) px-3 py-1 text-xs font-medium text-(--accent)">
                {x.sampleTag}
              </span>
              <Eye size={18} className="text-(--muted)" aria-hidden />
            </div>
            <p className="font-display mt-4 break-words text-xl font-semibold text-(--ink)">{x.sampleTitle}</p>

            <ol className="mt-5 space-y-3">
              {STAGES.map((s, i) => {
                const done = i < CURRENT_STAGE
                const current = i === CURRENT_STAGE
                return (
                  <li key={s} aria-current={current ? "step" : undefined} className="flex items-center gap-3 text-sm">
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                        done || current
                          ? "border-(--accent) bg-(--accent) text-(--accent-ink)"
                          : "border-(--line) text-(--muted)"
                      } ${current ? "ring-4 ring-(--accent-soft)" : ""}`}
                    >
                      {done ? <Check size={13} strokeWidth={3} aria-hidden /> : nf.format(i + 1)}
                    </span>
                    <span className={current ? "font-medium text-(--ink)" : done ? "text-(--ink)" : "text-(--muted)"}>
                      {t.issueDetail.status[s]}
                    </span>
                  </li>
                )
              })}
            </ol>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-(--muted)">{x.progressLabel}</span>
                <span className="font-medium text-(--ink)">{nf.format(PROGRESS)}%</span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-(--line)"
                role="progressbar"
                aria-label={x.progressLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={PROGRESS}
              >
                <motion.div
                  className="h-full rounded-full bg-(--accent)"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${PROGRESS}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </div>
              <p className="mt-2 text-xs text-(--muted)">{x.progressNote}</p>
            </div>
          </motion.div>
        </div>
      </MotionConfig>
    </section>
  )
}

/* --------------------------------- Impact --------------------------------- */

const IMPACT_ICONS: LucideIcon[] = [Users, Landmark, Sprout]

export function Impact() {
  const { t } = useI18n()
  const m = t.cityHome.impact

  return (
    <section className="bg-(--bg) py-24">
      <MotionConfig reducedMotion="user">
        <div className={wrap}>
          <Heading title={m.title} sub={m.text} />
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {m.items.map((item, i) => (
              <motion.li
                key={item.title}
                {...fade}
                transition={{ ...fade.transition, delay: i * 0.06 }}
                className="card p-6"
              >
                <IconTile icon={IMPACT_ICONS[i] ?? Users} />
                <h3 className="font-display mt-4 break-words text-lg font-semibold text-(--ink)">{item.title}</h3>
                <p className="mt-1 text-sm text-(--muted)">{item.text}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </MotionConfig>
    </section>
  )
}

/* -------------------------------- Final CTA -------------------------------- */

export function FinalCta() {
  const { t } = useI18n()
  const c = t.cityHome.cta

  return (
    <section
      className="city-dark relative isolate overflow-hidden py-28"
      style={{
        background:
          "radial-gradient(50% 60% at 50% 100%, color-mix(in oklab, var(--cn-orange) 22%, transparent), transparent), var(--cn-bg)",
      }}
    >
      <MotionConfig reducedMotion="user">
        <motion.div {...fade} className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.05] text-(--cn-ink)">
            {c.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-(--cn-muted)">{c.text}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/issues/new"
              className="focus-ring inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--cn-orange)", color: "var(--cn-orange-ink)" }}
            >
              {c.primary}
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href="/issues"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-(--cn-line) px-7 py-3.5 text-sm font-medium text-(--cn-ink) transition-colors hover:border-(--cn-orange)"
            >
              {c.secondary}
            </Link>
          </div>
        </motion.div>
      </MotionConfig>
    </section>
  )
}