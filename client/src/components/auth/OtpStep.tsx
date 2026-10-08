"use client";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, MailCheck, RotateCw } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage, useRules } from "@/lib/auth-rules";
import { OtpInput } from "./OtpInput";
import { FormAlert, SubmitButton } from "./AuthShell";

export type OtpPayload = { email: string; otp: string };

const RESEND_COOLDOWN = 60; // seconds

/** Shared OTP step. `onSubmit` / `onResend` may throw: the message is shown inside this component. */
export function OtpStep({ email, submitLabel, backLabel, onBack, onSubmit, onResend }: {
  email: string; submitLabel: string; backLabel: string; onBack: () => void;
  onSubmit: (p: OtpPayload) => Promise<void> | void; onResend: () => Promise<void> | void;
}) {
  const { t, locale } = useI18n();
  const rules = useRules();
  const [serverError, setServerError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [left, setLeft] = useState(RESEND_COOLDOWN);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ otp: string }>({ defaultValues: { otp: "" } });

  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);

  const num = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", { minimumIntegerDigits: 2 });
  const clock = `${num.format(Math.floor(left / 60))}:${num.format(left % 60)}`;

  const submit = handleSubmit(async (v) => {
    setServerError(null);
    try {
      await onSubmit({ email: email.trim(), otp: v.otp.trim() });
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic));   // e.g. "OTP is wrong / expired"
    }
  });

  const resend = async () => {
    if (left > 0 || resending) return;
    setServerError(null); setResending(true);
    try {
      await onResend();
      setLeft(RESEND_COOLDOWN);
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic));
    } finally {
      setResending(false);
    }
  };

  return (
    <form noValidate className="space-y-6" onSubmit={submit}>
      <p className="chip inline-flex max-w-full items-center gap-2 px-4 py-2 text-sm"><MailCheck size={16} className="shrink-0 text-(--accent)" aria-hidden /><span className="truncate">{email}</span></p>
      <Controller name="otp" control={control} rules={rules.otp}
        render={({ field }) => (
          <OtpInput value={field.value} label={t.auth.fields.otp} error={errors.otp?.message}
            onChange={(v) => { field.onChange(v); if (serverError) setServerError(null); }} />
        )} />
      <FormAlert message={serverError} />
      <SubmitButton loading={isSubmitting}>{submitLabel}</SubmitButton>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <button type="button" onClick={onBack} className="focus-ring cursor-pointer inline-flex items-center gap-1.5 text-(--muted) hover:text-(--ink)"><ArrowLeft size={16} aria-hidden />{backLabel}</button>
        <button type="button" onClick={resend} disabled={resending || left > 0} className="focus-ring inline-flex cursor-pointer items-center gap-1.5 font-medium text-(--accent) disabled:cursor-not-allowed disabled:opacity-50">
          <RotateCw size={15} className={resending ? "animate-spin" : ""} aria-hidden />
          {t.auth.otp.resend}{left > 0 && <span className="tabular-nums"> ({clock})</span>}
        </button>
      </div>
    </form>
  );
}