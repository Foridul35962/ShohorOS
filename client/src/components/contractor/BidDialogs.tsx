"use client";

import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Ban, ClipboardList, Loader2, Timer, Wallet } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { clean, getErrorMessage } from "@/lib/auth-rules";
import { FormAlert } from "@/components/auth/AuthShell";
import { TextAreaField, TextField } from "@/components/auth/fields";
import { DialogShell } from "@/components/issues/ModerationDialogs";
import type { ContractorBid } from "@/types/contractorTypes";

export type BidValues = {
  proposedBudget: number;
  workPlan: string;
  estimatedDurationDays: number;
};

type FormValues = {
  proposedBudget: string;
  estimatedDurationDays: string;
  workPlan: string;
};

type FormProps = {
  mode: "add" | "edit";
  bid?: ContractorBid;
  /** all = form er shob value, changed = edit e shudhu je field bodleche */
  onSubmit: (all: BidValues, changed: Partial<BidValues>) => Promise<void>;
  onClose: () => void;
};

export function BidFormDialog({ mode, bid, onSubmit, onClose }: FormProps) {
  const { t, locale } = useI18n();
  const f = t.contractor.form;
  const e = f.errors;
  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onTouched",
    defaultValues: {
      proposedBudget: bid ? String(bid.proposedBudget) : "",
      estimatedDurationDays: bid ? String(bid.estimatedDurationDays) : "",
      workPlan: bid?.workPlan ?? "",
    },
  });

  const planLen = (watch("workPlan") ?? "").length;
  const isEdit = mode === "edit";

  const submit = async (raw: FormValues) => {
    setServerError(null);
    const v = clean(raw);
    const all: BidValues = {
      proposedBudget: Number(v.proposedBudget),
      estimatedDurationDays: Number(v.estimatedDurationDays),
      workPlan: v.workPlan,
    };

    const changed: Partial<BidValues> = {};
    if (bid) {
      if (all.proposedBudget !== bid.proposedBudget) changed.proposedBudget = all.proposedBudget;
      if (all.estimatedDurationDays !== bid.estimatedDurationDays) {
        changed.estimatedDurationDays = all.estimatedDurationDays;
      }
      if (all.workPlan !== bid.workPlan) changed.workPlan = all.workPlan;
      if (Object.keys(changed).length === 0) {
        setServerError(e.noChanges);
        return;
      }
    }

    try {
      await onSubmit(all, changed);
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic));
    }
  };

  const onFormSubmit = (ev: FormEvent<HTMLFormElement>) => void handleSubmit(submit)(ev);

  return (
    <DialogShell
      icon={Wallet}
      role="dialog"
      title={isEdit ? f.editTitle : f.addTitle}
      text={isEdit ? f.editText : f.addText}
      busy={isSubmitting}
      onClose={onClose}
    >
      <form
        noValidate
        autoComplete="off"
        onChange={() => serverError && setServerError(null)}
        onSubmit={onFormSubmit}
        className="mt-5 space-y-5"
      >
        <TextField
          label={f.budget}
          icon={Wallet}
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          placeholder={f.budgetPh}
          error={errors.proposedBudget?.message}
          {...register("proposedBudget", {
            validate: (v) => {
              const x = String(v ?? "").trim();
              if (!x) return e.budgetRequired;
              const n = Number(x);
              return (Number.isFinite(n) && n > 0) || e.budgetPositive;
            },
          })}
        />

        <TextField
          label={f.duration}
          icon={Timer}
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          placeholder={f.durationPh}
          error={errors.estimatedDurationDays?.message}
          {...register("estimatedDurationDays", {
            validate: (v) => {
              const x = String(v ?? "").trim();
              if (!x) return e.durationRequired;
              const n = Number(x);
              return (Number.isInteger(n) && n >= 1) || e.durationInt;
            },
          })}
        />

        <div>
          <TextAreaField
            label={f.workPlan}
            rows={6}
            placeholder={f.workPlanPh}
            error={errors.workPlan?.message}
            {...register("workPlan", {
              validate: (v) => {
                const x = (v ?? "").trim();
                if (!x) return e.workPlanRequired;
                return x.length <= 10000 || e.workPlanMax;
              },
            })}
          />
          <p className="mt-1 text-right text-xs text-(--muted)" aria-live="polite">
            {f.counter.replace("{n}", nf.format(planLen)).replace("{max}", nf.format(10000))}
          </p>
        </div>

        <FormAlert message={serverError} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {t.issueDetail.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
            {isSubmitting ? (isEdit ? f.submittingEdit : f.submittingAdd) : isEdit ? f.submitEdit : f.submitAdd}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

/* ---------------- Withdraw ---------------- */

export function WithdrawBidDialog({ onConfirm, onClose }: { onConfirm: () => Promise<void>; onClose: () => void }) {
  const { t } = useI18n();
  const w = t.contractor.withdraw;
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
    <DialogShell icon={Ban} danger role="alertdialog" title={w.title} text={w.text} busy={busy} onClose={onClose}>
      <form noValidate onSubmit={submit} className="mt-5">
        <FormAlert message={serverError} />
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {t.issueDetail.cancel}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-60"
            style={{ background: "var(--warm)", color: "var(--bg)" }}
          >
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
            {busy ? w.confirming : w.confirm}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}