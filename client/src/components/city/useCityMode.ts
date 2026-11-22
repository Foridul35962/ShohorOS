// useCityMode.ts
"use client"

import { useSyncExternalStore } from "react"

const REDUCED = "(prefers-reduced-motion: reduce)"
const LITE = "(max-width: 767px)"

const subscribe = (query: string) => (cb: () => void) => {
  const m = window.matchMedia(query)
  m.addEventListener("change", cb)
  return () => m.removeEventListener("change", cb)
}
const subReduced = subscribe(REDUCED)
const subLite = subscribe(LITE)

export function useCityMode() {
  const reduced = useSyncExternalStore(subReduced, () => window.matchMedia(REDUCED).matches, () => false)
  const lite = useSyncExternalStore(subLite, () => window.matchMedia(LITE).matches, () => false)
  return { reduced, lite }
}