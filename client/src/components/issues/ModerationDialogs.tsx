"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, X, XCircle, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/auth-rules";
import { FormAlert } from "@/components/auth/AuthShell";
import type { IssuePriority } from "@/types/issueTypes";

const PRIORITIES: IssuePriority[] = [1, 2, 3, 4, 5];

type ShellProps = {
  icon: LucideIcon;
  danger?: boolean;
  title: string;
  text: string;
  role: "dialog" | "alertdialog";
  busy: boolean;
  onClose: () => void;
  children: ReactNode;
};

function DialogShell({ icon: Icon, danger, title, text, role, busy, onClose, children }: ShellProps) {
  const { t } = useI18n();
  const titleId = useId();
  const textId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(busy);
  const closeRef = useRef(onClose);

  useEffect(() => {
    busyRef.current = busy;
    closeRef.current = onClose;
  });

  // Esc, scroll lock, focus
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && !busyRef.current) closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget && !busy) onClose();
      }}
      className="fixed inset-0 z-70 flex items-end justify-center p-0 backdrop-blur-sm sm:items-center sm:p-4"
      style={{ background: "rgba(3,12,9,.6)" }}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="card relative max-h-[92dvh] w-full max-w-md overflow-y-auto p-6 outline-none sm:p-7"
        style={{ boxShadow: "var(--shadow)" }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label={t.issueDetail.close}
          className="focus-ring absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-(--muted) hover:text-(--ink) disabled:opacity-50"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <span
          className="grid h-11 w-11 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)"
          style={danger ? { background: "color-mix(in oklab, var(--warm) 12%, transparent)", color: "var(--warm)" } : undefined}
        >
          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="font-display mt-4 text-xl font-semibold leading-snug">
          {title}
        </h2>
        <p id={textId} className="mt-1.5 text-sm leading-relaxed text-(--muted)">
          {text}
        </p>

        {children}
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Accept (priority) ---------------- */

export function AcceptIssueDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: (priority: IssuePriority) => Promise<void>;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();
  const d = t.issueDetail;
  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en");
  const groupName = useId();
  const [priority, setPriority] = useState<IssuePriority | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (busy) return;
    if (priority == null) {
      setFieldError(d.accept.required);
      return;
    }
    setBusy(true);
    setServerError(null);
    try {
      await onConfirm(priority);
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic));
      setBusy(false);
    }
  };

  return (
    <DialogShell
      icon={CheckCircle2}
      role="dialog"
      title={d.accept.title}
      text={d.accept.text}
      busy={busy}
      onClose={onClose}
    >
      <form noValidate onSubmit={submit} className="mt-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{d.accept.priorityLabel}</legend>
          <div className="grid grid-cols-5 gap-2">
            {PRIORITIES.map((n) => (
              <label
                key={n}
                className="font-display grid h-12 cursor-pointer place-items-center rounded-2xl border border-(--line) bg-(--surface) text-base font-semibold transition-colors hover:border-(--accent) has-checked:border-(--accent) has-checked:bg-(--accent) has-checked:text-(--accent-ink) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--accent)"
              >
                <input
                  type="radio"
                  name={groupName}
                  value={n}
                  checked={priority === n}
                  onChange={() => {
                    setPriority(n);
                    setFieldError(null);
                    setServerError(null);
                  }}
                  aria-label={d.accept.option.replace("{n}", nf.format(n))}
                  className="sr-only"
                />
                <span aria-hidden="true">{nf.format(n)}</span>
              </label>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-(--muted)" aria-hidden="true">
            <span>{d.accept.low}</span>
            <span>{d.accept.high}</span>
          </div>
          {fieldError ? (
            <p role="alert" className="mt-2 text-sm text-(--warm)">
              {fieldError}
            </p>
          ) : null}
        </fieldset>

        <div className="mt-4">
          <FormAlert message={serverError} />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {d.cancel}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn-primary focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
            {busy ? d.accept.confirming : d.accept.confirm}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

/* ---------------- Reject ---------------- */

export function RejectIssueDialog({ onConfirm, onClose }: { onConfirm: () => Promise<void>; onClose: () => void }) {
  const { t } = useI18n();
  const d = t.issueDetail;
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (busy) return;
    setBusy(true);
    setServerError(null);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic));
      setBusy(false);
    }
  };

  return (
    <DialogShell
      icon={XCircle}
      danger
      role="alertdialog"
      title={d.reject.title}
      text={d.reject.text}
      busy={busy}
      onClose={onClose}
    >
      <form noValidate onSubmit={submit} className="mt-5">
        <FormAlert message={serverError} />
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {d.cancel}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-60"
            style={{ background: "var(--warm)", color: "var(--bg)" }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
            {busy ? d.reject.confirming : d.reject.confirm}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}