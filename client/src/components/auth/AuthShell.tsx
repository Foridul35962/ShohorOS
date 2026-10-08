"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Loader2, type LucideIcon } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { useI18n } from "@/lib/i18n/provider";

export function AuthShell({ icon: Icon, title, sub, wide, children, footer }: { icon: LucideIcon; title: string; sub?: string; wide?: boolean; children: React.ReactNode; footer?: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <>
      <Header />
      <main id="main" className="relative isolate overflow-hidden">
        <div className="aurora absolute inset-0 -z-10" aria-hidden />
        <div className="grid-bg absolute inset-0 -z-10" aria-hidden />
        <div className="mx-auto flex min-h-svh items-center justify-center px-5 pb-20 pt-28">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"}`}>
            <div className="card p-6 sm:p-10" style={{ borderRadius: "2rem", boxShadow: "var(--shadow)" }}>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)"><Icon size={22} strokeWidth={1.8} aria-hidden /></span>
              <h1 className="font-display mt-5 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
              {sub && <p className="mt-2 text-(--muted)">{sub}</p>}
              <div className="mt-8">{children}</div>
            </div>
            {footer && <p className="mt-6 text-center text-sm text-(--muted)">{footer}</p>}
            <p className="mt-3 text-center text-xs text-(--muted)">{t.auth.shell.side}</p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function Steps({ labels, current }: { labels: string[]; current: number }) {
  const { locale } = useI18n();
  const n = (i: number) => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(i);
  return (
    <ol className="mb-8 flex items-center gap-3">
      {labels.map((l, i) => {
        const done = i < current, active = i === current;
        return (
          <li key={l} aria-current={active ? "step" : undefined} className={`flex items-center gap-3 ${i < labels.length - 1 ? "flex-1" : ""}`}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors"
              style={{ background: done || active ? "var(--accent)" : "transparent", color: done || active ? "var(--accent-ink)" : "var(--muted)", borderColor: done || active ? "var(--accent)" : "var(--line)" }}>
              {done ? <Check size={16} strokeWidth={3} /> : n(i + 1)}
            </span>
            <span className={`hidden text-sm sm:inline ${active ? "font-medium" : "text-(--muted)"}`}>{l}</span>
            {i < labels.length - 1 && <span className="h-px flex-1 transition-colors" style={{ background: done ? "var(--accent)" : "var(--line)" }} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

export function SubmitButton({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  const { t } = useI18n();
  return (
    <button type="submit" disabled={loading} className="btn-primary focus-ring flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 disabled:opacity-60">
      {loading ? <><Loader2 size={18} className="animate-spin" aria-hidden />{t.auth.actions.loading}</> : <>{children}<ArrowRight size={18} aria-hidden /></>}
    </button>
  );
}

export function SuccessPanel({ title, text, cta, href }: { title: string; text: string; cta: string; href: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full" style={{ background: "color-mix(in oklab, var(--ok) 16%, transparent)", color: "var(--ok)" }}><CheckCircle2 size={32} aria-hidden /></span>
      <h2 className="font-display mt-5 text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-(--muted)">{text}</p>
      <Link href={href} className="btn-primary focus-ring mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5">{cta}<ArrowRight size={18} aria-hidden /></Link>
    </motion.div>
  );
}

export function FormAlert({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
      style={{ borderColor: "color-mix(in oklab, var(--warm) 40%, transparent)", background: "color-mix(in oklab, var(--warm) 10%, transparent)", color: "var(--warm)" }}>
      <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden />{message}
    </div>
  );
}