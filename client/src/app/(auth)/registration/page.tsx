"use client";
import Link from "next/link";
import { ArrowRight, HardHat, UserPlus, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { AuthShell } from "@/components/auth/AuthShell";

export default function RegisterChoicePage() {
  const { t } = useI18n(); const r = t.auth.register;
  const cards = [
    { href: "/registration/citizen", icon: UserRound, ...r.citizen },
    { href: "/registration/contractor", icon: HardHat, ...r.contractor },
  ];
  return (
    <AuthShell icon={UserPlus} wide title={r.title} sub={r.sub}
      footer={<>{r.have} <Link href="/login" className="font-medium text-(--accent) hover:underline">{r.login}</Link></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="group focus-ring relative flex flex-col overflow-hidden rounded-3xl border border-(--line) bg-(--bg) p-6 transition-colors hover:border-(--accent)">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)"><c.icon size={24} strokeWidth={1.7} aria-hidden /></span>
            <h2 className="font-display mt-5 text-xl font-semibold">{c.t}</h2>
            <p className="mt-2 flex-1 text-sm text-(--muted)">{c.d}</p>
            <span className="mt-6 grid h-9 w-9 place-items-center rounded-full bg-(--ink) text-(--bg) transition-transform group-hover:translate-x-1" aria-hidden><ArrowRight size={16} /></span>
          </Link>
        ))}
      </div>
    </AuthShell>
  );
}