"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Phone, Plus, Search, Trash2, UsersRound } from "lucide-react";
import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { FormAlert } from "@/components/auth/AuthShell";
import { SelectField, TextField } from "@/components/auth/fields";
import { useI18n } from "@/lib/i18n/provider";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { Pagination } from "./Pagination";

const ADD_MEMBER_HREF = "/admin/add-members";
export const ROLES = ["moderator", "department-officer", "city-admin", "inspector"] as const;
export type RoleValue = (typeof ROLES)[number];
export type MemberItem = { id: string; name: string; email: string; phone: string; role: string; avatar?: string; createdAt: string };

export function MembersView({ items, loading, error, onRetry, total, limit, page, totalPages, onPage, applied, onSearch, onDelete }: {
  items: MemberItem[]; loading: boolean; error: string | null; onRetry: () => void;
  total: number; limit: number; page: number; totalPages: number; onPage: (p: number) => void;
  applied: { name: string; role: "" | RoleValue }; onSearch: (name: string, role: "" | RoleValue) => void; onDelete: (id: string) => Promise<void>;
}) {
  const { t, locale } = useI18n(); const m = t.admin.members; const bn = locale === "bn";
  const num = (n: number) => new Intl.NumberFormat(bn ? "bn-BD" : "en").format(n);
  const date = (iso: string) => new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", { dateStyle: "medium" }).format(new Date(iso));
  const roleLabel = (r: string) => (m.roles as Record<string, string>)[r] ?? r;

  // Draft inputs: typing never calls the backend. Only the Search button (or Enter) does.
  const [name, setName] = useState(applied.name);
  const [role, setRole] = useState<"" | RoleValue>(applied.role);
  const [target, setTarget] = useState<MemberItem | null>(null);
  const hasFilters = !!(applied.name || applied.role);

  const from = (page - 1) * limit + 1;
  const showing = m.showing.replace("{from}", num(from)).replace("{to}", num(from + items.length - 1)).replace("{total}", num(total));
  const goto = (p: number) => { onPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <>
      <Header />
      <main id="main" className="relative isolate overflow-hidden">
        <div className="aurora absolute inset-x-0 top-0 -z-10 h-96" aria-hidden />
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-28 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">{m.title}</h1>
              <p className="mt-2 max-w-xl text-(--muted)">{m.sub}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="chip px-4 py-1.5 text-sm font-medium"><span className="tabular-nums text-(--accent)">{num(total)}</span> {m.total}</span>
              <Link href={ADD_MEMBER_HREF} className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm"><Plus size={16} aria-hidden />{m.add}</Link>
            </div>
          </div>

          <form role="search" onSubmit={(e) => { e.preventDefault(); onSearch(name, role); }} className="card mt-8 grid gap-4 p-4 sm:grid-cols-[1fr_15rem_auto] sm:items-end sm:p-5">
            <TextField label={m.search.name} icon={Search} placeholder={m.search.namePh} value={name} onChange={(e) => setName(e.target.value)} />
            <SelectField label={m.search.role} value={role} onChange={(e) => setRole(e.target.value as "" | RoleValue)}>
              <option value="">{m.search.allRoles}</option>
              {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
            </SelectField>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary focus-ring inline-flex h-[2.9rem] flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm sm:flex-none"><Search size={16} aria-hidden />{m.search.submit}</button>
              {(hasFilters || name || role) && (
                <button type="button" onClick={() => { setName(""); setRole(""); onSearch("", ""); }} className="btn-ghost focus-ring h-[2.9rem] rounded-full px-4 text-sm font-medium">{m.search.clear}</button>
              )}
            </div>
          </form>

          <div className="mt-6">
            {error && items.length === 0 ? (
              <div className="space-y-4"><FormAlert message={error} />
                <button type="button" onClick={onRetry} className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium">{m.retry}</button></div>
            ) : loading && items.length === 0 ? (
              <ul className="space-y-3" aria-busy="true">{[0, 1, 2, 3].map((i) => <li key={i} className="card h-24 animate-pulse" style={{ opacity: 1 - i * 0.18 }} />)}</ul>
            ) : items.length === 0 ? (
              <div className="card grid place-items-center px-6 py-20 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)"><UsersRound size={30} aria-hidden /></span>
                <h2 className="font-display mt-5 text-xl font-semibold">{hasFilters ? m.noResultsTitle : m.noMembersTitle}</h2>
                <p className="mt-1 max-w-sm text-(--muted)">{hasFilters ? m.noResultsText : m.noMembersText}</p>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-(--muted)" aria-live="polite">{showing}</p>
                <ul className={`space-y-3 transition-opacity ${loading ? "opacity-60" : ""}`}>
                  <AnimatePresence initial={false} mode="popLayout">
                    {items.map((u) => (
                      <motion.li key={u.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, scale: 0.98 }} transition={{ duration: 0.25 }}>
                        <article className="card flex flex-wrap items-center gap-x-5 gap-y-3 p-4 sm:p-5">
                          <div className="flex min-w-56 flex-1 items-center gap-4">
                            {u.avatar
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={u.avatar} alt="" className="h-12 w-12 shrink-0 rounded-2xl object-cover" />
                              : <span className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-lg font-semibold text-(--accent)" aria-hidden>{u.name.trim().charAt(0).toUpperCase()}</span>}
                            <div className="min-w-0">
                              <h2 className="font-display wrap-break-word text-lg font-semibold leading-snug">{u.name}</h2>
                              <p className="break-all text-sm text-(--muted)">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-(--muted)">
                            <span className="inline-flex items-center gap-1.5"><Phone size={14} aria-hidden />{u.phone}</span>
                            <span className="hidden items-center gap-1.5 lg:inline-flex"><CalendarDays size={14} aria-hidden />{m.joined} {date(u.createdAt)}</span>
                            <span className="rounded-full px-3 py-1 text-xs font-medium"
                              style={u.role === "city-admin" ? { background: "color-mix(in oklab, var(--ok) 16%, transparent)", color: "var(--ok)" } : { background: "var(--accent-soft)", color: "var(--accent)" }}>{roleLabel(u.role)}</span>
                          </div>
                          <button type="button" onClick={() => setTarget(u)} aria-label={`${m.delete}: ${u.name}`}
                            className="focus-ring ml-auto inline-flex items-center gap-2 rounded-full border border-(--line) px-4 py-2 text-sm font-medium transition-colors hover:border-(--warm) hover:text-(--warm)"><Trash2 size={15} aria-hidden />{m.delete}</button>
                        </article>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </>
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={goto} disabled={loading} labels={m.pagination} />
        </div>
      </main>
      <Footer />

      <ConfirmDeleteDialog member={target ? { name: target.name, email: target.email, roleLabel: roleLabel(target.role) } : null}
        onClose={() => setTarget(null)} onConfirm={async () => { if (target) { await onDelete(target.id); setTarget(null); } }} />
    </>
  );
}