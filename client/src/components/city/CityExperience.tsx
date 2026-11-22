// cityExperience.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, Landmark, MapPin, Search } from "lucide-react"

import { useI18n } from "@/lib/i18n/provider"
import { smoothstep, type Progress } from "./cityMath"
import { useCityMode } from "./useCityMode"

// Three.js is heavy: load it only in the browser
const CityCanvas = dynamic(() => import("./CityCanvas"), { ssr: false })

const KEYS = ["hero", "city", "problems", "report", "response", "build", "final"] as const
type SceneKey = (typeof KEYS)[number]
const RANGES: [number, number][] = [
  [0, 0.14],
  [0.14, 0.28],
  [0.28, 0.46],
  [0.46, 0.58],
  [0.58, 0.72],
  [0.72, 0.88],
  [0.88, 1],
]

const STAGE_BG =
  "radial-gradient(40% 30% at 78% 72%, color-mix(in oklab, var(--cn-orange) 14%, transparent), transparent), radial-gradient(120% 90% at 70% 35%, var(--cn-bg2) 0%, var(--cn-bg) 62%)"

const hasWebGL = () => {
  try {
    const c = document.createElement("canvas")
    return !!(c.getContext("webgl2") || c.getContext("webgl"))
  } catch {
    return false
  }
}

const primaryBtn =
  "focus-ring inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
const secondaryBtn =
  "focus-ring inline-flex items-center gap-2 rounded-full border border-(--cn-line) px-7 py-3.5 text-sm font-medium text-(--cn-ink) transition-colors hover:border-(--cn-orange)"

/* ------------------------------- scene content ------------------------------ */

const HeroBody = () => {
  const { t } = useI18n()
  const h = t.cityHome.hero
  return (
    <div className="max-w-2xl">
      <p className="cn-line text-sm font-medium text-(--cn-orange)">{h.eyebrow}</p>
      <h1 className="cn-line font-display mt-4 text-[clamp(2.4rem,6.5vw,5.5rem)] font-semibold leading-[1.02] text-(--cn-ink)">
        {h.headline}
      </h1>
      <p className="cn-line mt-5 max-w-xl text-lg text-(--cn-muted)">{h.sub}</p>
      <div className="cn-line mt-8 flex flex-wrap gap-3">
        <Link
          href="/issues/new"
          className={primaryBtn}
          style={{ background: "var(--cn-orange)", color: "var(--cn-orange-ink)" }}
        >
          {h.primary}
          <ArrowRight size={16} aria-hidden />
        </Link>
        <Link href="#how" className={secondaryBtn}>
          {h.secondary}
        </Link>
      </div>
    </div>
  )
}

const SceneBody = ({ k }: { k: Exclude<SceneKey, "hero"> }) => {
  const { t } = useI18n()
  const c = t.cityHome
  const s = c.scenes[k]

  return (
    <div
      className="w-full max-w-md rounded-3xl border border-(--cn-line) p-6 backdrop-blur-md sm:p-8"
      style={{ background: "color-mix(in oklab, var(--cn-bg) 62%, transparent)" }}
    >
      <h2 className="font-display text-2xl font-semibold leading-tight text-(--cn-ink) sm:text-3xl">{s.title}</h2>
      <p className="mt-3 text-(--cn-muted)">{s.text}</p>

      {k === "problems" && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {(["road", "drain", "light", "waste"] as const).map((key) => (
            <li
              key={key}
              className="inline-flex items-center gap-2 rounded-full border border-(--cn-line) px-3 py-1.5 text-sm text-(--cn-ink)"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--cn-orange)" }} aria-hidden />
              {c.problems[key]}
            </li>
          ))}
        </ul>
      )}

      {k === "report" && (
        <div
          className="mt-5 rounded-2xl border border-(--cn-line) p-4"
          style={{ background: "color-mix(in oklab, var(--cn-ink) 6%, transparent)" }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-(--cn-muted)">{c.report.tag}</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: "var(--cn-orange)", color: "var(--cn-orange-ink)" }}
            >
              {t.issueDetail.status.REPORTED}
            </span>
          </div>
          <p className="font-display mt-2 break-words font-semibold text-(--cn-ink)">{c.report.title}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-(--cn-muted)">
            <MapPin size={14} aria-hidden className="shrink-0" />
            {c.report.meta}
          </p>
        </div>
      )}

      {k === "response" && (
        <ul className="mt-5 flex flex-wrap items-center gap-2 text-sm text-(--cn-ink)">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-(--cn-line) px-3 py-1.5">
            <Search size={14} aria-hidden />
            {t.issueDetail.status.UNDER_REVIEW}
          </li>
          <ArrowRight size={14} className="text-(--cn-muted)" aria-hidden />
          <li className="inline-flex items-center gap-1.5 rounded-full border border-(--cn-line) px-3 py-1.5">
            <Landmark size={14} aria-hidden />
            {t.issueDetail.status.PROJECT_CREATED}
          </li>
        </ul>
      )}
    </div>
  )
}

const HeroLabels = () => {
  const { t } = useI18n()
  const l = t.cityHome.hero.labels
  const items = [
    { text: l.infra, pos: "top-[22%] right-[30%]", delay: "0s" },
    { text: l.reporting, pos: "top-[32%] right-[6%]", delay: "1s" },
    { text: l.projects, pos: "bottom-[26%] right-[34%]", delay: "2s" },
    { text: l.monitoring, pos: "bottom-[18%] right-[8%]", delay: "3s" },
  ]
  return (
    <div className="hidden md:block" aria-hidden>
      {items.map((it) => (
        <span
          key={it.text}
          className={`cn-float absolute ${it.pos} inline-flex items-center gap-2 rounded-full border border-(--cn-line) px-3.5 py-1.5 text-sm text-(--cn-ink) backdrop-blur-sm`}
          style={{
            background: "color-mix(in oklab, var(--cn-bg) 55%, transparent)",
            animationDelay: it.delay,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--cn-orange)" }} />
          {it.text}
        </span>
      ))}
    </div>
  )
}

/* ---------------------------------- main ---------------------------------- */

const CityExperience = () => {
  const { t } = useI18n()
  const { reduced, lite } = useCityMode()
  const rootRef = useRef<HTMLElement>(null)
  const captions = useRef<(HTMLDivElement | null)[]>([])
  const bar = useRef<HTMLDivElement>(null)
  const progress = useRef<Progress>({ value: 0 })
  const [glOk, setGlOk] = useState(false)
  const [active, setActive] = useState(true)

  useEffect(() => {
    setGlOk(hasWebGL())
  }, [])

  // Pause rendering when the story is not on screen
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "200px" })
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  // Scroll story: GSAP ScrollTrigger -> progress ref -> captions (direct style, no re-render)
  useEffect(() => {
    if (reduced) return
    gsap.registerPlugin(ScrollTrigger)

    const apply = (p: number) => {
      RANGES.forEach(([a, b], i) => {
        const el = captions.current[i]
        if (!el) return
        const fadeIn = i === 0 ? 1 : smoothstep(a, a + 0.03, p)
        const fadeOut = i === RANGES.length - 1 ? 1 : 1 - smoothstep(b - 0.03, b, p)
        const o = fadeIn * fadeOut
        el.style.opacity = String(o)
        el.style.transform = `translate3d(0, ${(1 - o) * 24}px, 0)`
        el.style.visibility = o < 0.01 ? "hidden" : "visible"
      })
      if (bar.current) bar.current.style.transform = `scaleY(${p})`
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          progress.current.value = self.progress
          apply(self.progress)
        },
      })
      apply(0)
      gsap.from(".cn-line", { opacity: 0, y: 36, duration: 1, stagger: 0.12, ease: "power3.out", delay: 0.2 })
    }, rootRef)

    return () => ctx.revert()
  }, [reduced])

  const canvas = glOk ? (
    <div className="absolute inset-0" role="img" aria-label={t.cityHome.a11y.canvas}>
      <CityCanvas progress={progress} lite={lite} still={reduced} active={active} />
    </div>
  ) : null

  /* Reduced motion: no scroll animation. Static city + the story as plain cards. */
  if (reduced) {
    return (
      <section
        ref={rootRef}
        aria-label={t.cityHome.a11y.stage}
        className="city-dark relative overflow-hidden"
        style={{ background: STAGE_BG }}
      >
        <div className="relative min-h-svh">
          {canvas}
          <div className="relative z-10 flex min-h-svh items-end px-5 pb-12 pt-28 md:items-center md:pl-[6vw]">
            <HeroBody />
          </div>
        </div>
        <div className="relative z-10 mx-auto grid max-w-5xl gap-6 px-5 py-20 md:grid-cols-2">
          {KEYS.filter((k): k is Exclude<SceneKey, "hero"> => k !== "hero").map((k) => (
            <SceneBody key={k} k={k} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section ref={rootRef} aria-label={t.cityHome.a11y.stage} className="city-dark relative h-[650svh]">
      <div className="sticky top-0 h-svh overflow-hidden" style={{ background: STAGE_BG }}>
        {canvas}

        {/* readable text over the city */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, color-mix(in oklab, var(--cn-bg) 70%, transparent), transparent 45%)",
          }}
          aria-hidden
        />

        {KEYS.map((k, i) => (
          <div
            key={k}
            ref={(el) => {
              captions.current[i] = el
            }}
            className="pointer-events-none absolute inset-0 flex items-end px-5 pb-12 md:items-center md:px-0 md:pb-0 md:pl-[6vw]"
            style={i === 0 ? undefined : { opacity: 0, visibility: "hidden" }}
          >
            <div className="pointer-events-auto">{k === "hero" ? <HeroBody /> : <SceneBody k={k} />}</div>
            {k === "hero" && <HeroLabels />}
          </div>
        ))}

        {/* progress rail */}
        <div
          className="absolute right-4 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-(--cn-line) md:block"
          role="presentation"
          aria-label={t.cityHome.a11y.progress}
        >
          <div ref={bar} className="h-full origin-top" style={{ background: "var(--cn-orange)", transform: "scaleY(0)" }} />
        </div>

        <p className="absolute inset-x-0 bottom-3 hidden text-center text-xs text-(--cn-muted) md:block" aria-hidden>
          {t.cityHome.hero.scroll}
        </p>
      </div>
    </section>
  )
}

export default CityExperience