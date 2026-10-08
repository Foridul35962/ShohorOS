"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n/provider";

const KEY = "shohoros_splash_seen"; // sessionStorage: splash shows once per browser session
const MIN_MS = 2000;               // minimum time the splash stays
const MAX_MS = 5000;               // hard cap, even if the page is still loading

const TEXT = {
  en: { tagline: "Civic technology for Bangladesh.", steps: ["Mapping the city", "Connecting departments", "Ready"] },
  bn: { tagline: "বাংলাদেশের জন্য নাগরিক প্রযুক্তি।", steps: ["শহরের মানচিত্র সাজানো হচ্ছে", "বিভাগগুলোকে যুক্ত করা হচ্ছে", "প্রস্তুত"] },
} as const;

export default function FirstLoad() {
  const { locale } = useI18n();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const tx = locale === "bn" ? TEXT.bn : TEXT.en;
  const min = reduce ? 600 : MIN_MS;

  useEffect(() => {
    try { if (sessionStorage.getItem(KEY) === "1") { setVisible(false); return; } } catch {}
    const start = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      setVisible(false);
    };
    const onReady = () => timers.push(setTimeout(finish, Math.max(0, min - (performance.now() - start))));
    if (document.readyState === "complete") onReady(); else window.addEventListener("load", onReady, { once: true });
    timers.push(setTimeout(finish, MAX_MS));
    const iv = setInterval(() => setStep((s) => Math.min(s + 1, 2)), min / 3);
    return () => { timers.forEach(clearTimeout); clearInterval(iv); window.removeEventListener("load", onReady); };
  }, [min]);

  // Lock page scroll while the splash is on screen
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [visible]);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div id="splash" suppressHydrationWarning role="status" aria-live="polite" aria-label="ShohorOS"
            className="fixed inset-0 z-100 grid place-items-center overflow-hidden bg-(--bg)"
            exit={{ y: "-100%" }} transition={{ duration: reduce ? 0.2 : 0.9, ease: [0.76, 0, 0.24, 1] }}>
            <div className="aurora absolute inset-0" aria-hidden />
            <div className="grid-bg absolute inset-0" aria-hidden />

            <motion.div className="relative flex flex-col items-center px-6 text-center" exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.4 }}>
              {/* Pin + ripples */}
              <div className="relative grid h-40 w-40 place-items-center">
                {!reduce && [0, 1, 2].map((i) => (
                  <motion.span key={i} className="absolute h-20 w-20 rounded-full border border-(--accent)" aria-hidden
                    initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 2.4, opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2.4, delay: 0.9 + i * 0.6, repeat: Infinity, ease: "easeOut" }} />
                ))}
                <motion.span className="relative grid h-20 w-20 place-items-center rounded-[1.6rem] bg-(--accent)" style={{ boxShadow: "var(--shadow)" }}
                  initial={reduce ? false : { y: -60, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}>
                  <svg width="38" height="38" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" fill="var(--accent-ink)" />
                    <circle cx="12" cy="9" r="2.6" fill="var(--accent)" />
                  </svg>
                </motion.span>
              </div>

              <motion.h1 className="font-display mt-2 text-5xl font-semibold sm:text-6xl"
                initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
                <span className="text-shine">ShohorOS</span>
              </motion.h1>
              <motion.p className="mt-3 max-w-xs text-(--muted)"
                initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.7 }}>{tx.tagline}</motion.p>

              {/* Progress */}
              <div className="mt-10 w-64 max-w-full">
                <div className="h-1 overflow-hidden rounded-full bg-(--line)" aria-hidden>
                  <motion.div className="h-full rounded-full bg-(--accent)" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: min / 1000, ease: [0.4, 0, 0.2, 1] }} />
                </div>
                <p className="mt-3 h-5 text-sm text-(--muted)">{tx.steps[step]}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Runs before first paint: hides the splash instantly for visitors who already saw it this session (no flash). */}
      <script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem("${KEY}")==="1"){var e=document.getElementById("splash");if(e)e.style.display="none"}}catch(e){}` }} />
    </>
  );
}