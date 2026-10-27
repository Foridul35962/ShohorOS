"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { Loader2, X, XCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/auth-rules";
import { FormAlert } from "@/components/auth/AuthShell";
import { TextAreaField } from "@/components/auth/fields";

const MAX = 500; // reason max length (change if your backend has a different limit)

/** Reason popup. `onConfirm` may throw: the message is shown inside the popup. */
export function RejectDialog({ open, name, onClose, onConfirm }: {
  open: boolean; name: string; onClose: () => void; onConfirm: (reason: string) => Promise<void>;
}) {
  const { t } = useI18n(); const d = t.moderator.rejectDialog;
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, reset, watch, setFocus, formState: { errors, isSubmitting } } = useForm<{ reason: string }>({ defaultValues: { reason: "" } });
  const length = watch("reason").length;

  useEffect(() => {
    if (!open) return;
    reset({ reason: "" }); setServerError(null);
    const focus = setTimeout(() => setFocus("reason"), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { clearTimeout(focus); window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const submit = handleSubmit(async ({ reason }) => {
    setServerError(null);
    try { await onConfirm(reason.trim()); }
    catch (error) { setServerError(getErrorMessage(error, t.auth.errors.generic)); }
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-90 grid place-items-end p-4 sm:place-items-center" style={{ background: "rgba(3, 12, 9, .6)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.form role="dialog" aria-modal="true" aria-labelledby="reject-title" noValidate onSubmit={submit}
            className="card w-full max-w-md p-6 sm:p-7" style={{ boxShadow: "var(--shadow)" }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
            <div className="flex items-start justify-between gap-3">
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{ background: "color-mix(in oklab, var(--warm) 14%, transparent)", color: "var(--warm)" }}
              >
                <XCircle size={22} aria-hidden />
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label={d.close}
                className="focus-ring grid h-9 w-9 place-items-center rounded-full text-(--muted) hover:bg-(--bg) hover:text-(--ink)"
              >
                <X size={18} />
              </button>
            </div>
            <h2 id="reject-title" className="font-display mt-4 text-2xl font-semibold">{d.title}</h2>
            <p className="mt-1 text-sm text-(--muted)">{d.sub}</p>
            <p className="chip mt-4 inline-block max-w-full truncate px-3 py-1 text-sm font-medium">{name}</p>
            <div className="mt-5">
              <TextAreaField label={d.label} rows={4} maxLength={MAX} placeholder={d.placeholder} error={errors.reason?.message}
                {...register("reason", { validate: (v) => !!v.trim() || d.required })} />
              <p className="mt-1.5 text-right text-xs tabular-nums text-(--muted)">{length}/{MAX}</p>
            </div>
            <div className="mt-3"><FormAlert message={serverError} /></div>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium">{d.cancel}</button>
              <button type="submit" disabled={isSubmitting} className="focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: "var(--warm)", color: "var(--bg)" }}>
                {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden />}{d.confirm}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}