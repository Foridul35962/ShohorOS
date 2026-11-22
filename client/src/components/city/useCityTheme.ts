"use client"

import { useSyncExternalStore } from "react"

// Reads the "dark" class on <html> (same class your global CSS uses)
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb)
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => mo.disconnect()
}

export function useIsDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => true
  )
}