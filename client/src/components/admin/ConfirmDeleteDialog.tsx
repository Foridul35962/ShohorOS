"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Trash2, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/auth-rules";
import { FormAlert } from "@/components/auth/AuthShell";

/** Confirmation popup. `onConfirm` may throw: the message is shown inside the popup. */
export function ConfirmDeleteDialog({ member, onClose, onConfirm }: {
  member: { name: string; email: string; roleLabel: string } | null; onClose: () => void; onConfirm: () => Promise<void>;
}) {
  const { t } = useI18n(); const d = t.admin.members.deleteDialog;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = !!member;

  useEffect(() => {
    if (!open) return;
    setError(null); setBusy(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const confirm = async () => {
    setBusy(true); setError(null);
    try { await onConfirm(); }                       // success: the member is removed from the list and the parent closes this popup
    catch (e) { setError(getErrorMessage(e, t.auth.errors.generic)); setBusy(false); }
  };

  return (
    <AnimatePresence>
      {member && (
        <motion.div className="fixed inset-0 z-90 grid place-items-end p-4 sm:place-items-center" style={{ background: "rgba(3, 12, 9, .6)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
          <motion.div role="alertdialog" aria-modal="true" aria-labelledby="del-title" aria-describedby="del-text" className="card w-full max-w-md p-6 sm:p-7" style={{ boxShadow: "var(--shadow)" }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: "color-mix(in oklab, var(--warm) 14%, transparent)", color: "var(--warm)" }}><Trash2 size={22} aria-hidden /></span>
              <button type="button" onClick={onClose} disabled={busy} aria-label={d.close} className="focus-ring grid h-9 w-9 place-items-center rounded-full text-(--muted) hover:bg-(--bg) hover:text-(--ink)"><X size={18} /></button>
            </div>
            <h2 id="del-title" className="font-display mt-4 text-2xl font-semibold">{d.title}</h2>
            <div className="mt-4 rounded-2xl bg-(--bg) p-4">
              <p className="wrap-break-word font-medium">{member.name}</p>
              <p className="break-all text-sm text-(--muted)">{member.email}</p>
              <p className="mt-2 inline-block rounded-full bg-(--accent-soft) px-3 py-0.5 text-xs font-medium text-(--accent)">{member.roleLabel}</p>
            </div>
            <p id="del-text" className="mt-4 text-sm text-(--muted)">{d.text}</p>
            {error && <div className="mt-4"><FormAlert message={error} /></div>}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={onClose} disabled={busy} className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50">{d.cancel}</button>
              <button type="button" onClick={confirm} disabled={busy} className="focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: "var(--warm)", color: "var(--bg)" }}>
                {busy && <Loader2 size={16} className="animate-spin" aria-hidden />}{d.confirm}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}