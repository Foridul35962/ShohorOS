"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { KeyRound, Lock, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { clean, getErrorMessage, useRules } from "@/lib/auth-rules";
import { AuthShell, FormAlert, Steps, SubmitButton, SuccessPanel } from "@/components/auth/AuthShell";
import { TextField } from "@/components/auth/fields";
import { OtpStep } from "@/components/auth/OtpStep";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { forgetPassword, resendOtp, resetPassword, verifyForgatePassword } from "@/store/slice/authSlice";

export default function ForgotPasswordPage() {
  const { t } = useI18n(); const a = t.auth; const f = a.forgot; const rules = useRules();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [email, setEmail] = useState("");
  const dispatch = useDispatch<AppDispatch>()
  const s1 = useForm<{ email: string }>({ mode: "onTouched" });
  const s3 = useForm<{ password: string; confirmPassword: string }>({ mode: "onTouched" });

  // state: email er niche
  const [serverError, setServerError] = useState<string | null>(null);

  // Part 1: email nei, account na thakle backend er error ekhane dekhabe
  const onEmail = async (v: { email: string }) => {
    setServerError(null);
    const payload = clean(v);
    try {
      await dispatch(forgetPassword(payload)).unwrap();
      setEmail(payload.email); setStep(1);
    } catch (error) {
      setServerError(getErrorMessage(error, a.errors.generic));
    }
  };

  // Part 2: OTP vul hole OtpStep nije dekhabe, ekhane try/catch lagbe na
  const onOtp = async (payload: { email: string; otp: string }) => {
    await dispatch(verifyForgatePassword(payload)).unwrap();
    setServerError(null); setStep(2);
  };

  const onResend = async () => {
    await dispatch(resendOtp({ email, topic: "forgotPass" })).unwrap();
  };

  // Part 3: notun password
  const onPassword = async ({ password }: { password: string }) => {
    setServerError(null);
    const payload = clean({ email, password });
    try {
      await dispatch(resetPassword(payload)).unwrap();
      setStep(3);
    } catch (error) {
      setServerError(getErrorMessage(error, a.errors.generic));
    }
  };

  const head = step === 0 ? f.s1 : step === 1 ? f.s2 : f.s3;
  return (
    <AuthShell icon={KeyRound} title={f.title} sub={step === 3 ? undefined : f.sub}
      footer={<Link href="/login" className="font-medium text-(--accent) hover:underline">{f.back}</Link>}>
      {step < 3 && <Steps labels={f.steps} current={step} />}
      {step < 3 && <h2 className="font-display text-xl font-semibold">{head.title}</h2>}
      {step === 0 && (
        <form noValidate onChange={() => serverError && setServerError(null)} onSubmit={s1.handleSubmit(onEmail)} className="mt-1 space-y-5">
          <p className="text-(--muted)">{f.s1.sub}</p>
          <TextField label={a.fields.email} icon={Mail} type="email" autoComplete="email" placeholder={a.fields.emailPh} error={s1.formState.errors.email?.message} {...s1.register("email", rules.emailRequired)} />
          <FormAlert message={serverError} />
          <SubmitButton loading={s1.formState.isSubmitting}>{f.s1.submit}</SubmitButton>
        </form>
      )}
      {step === 1 && (
        <div>
          <p className="mb-6 mt-1 text-(--muted)">{f.s2.sub}</p>
          <OtpStep email={email} submitLabel={f.s2.submit} backLabel={f.change} onBack={() => { setServerError(null); setStep(0); }} onSubmit={onOtp} onResend={onResend} />
        </div>
      )}
      {step === 2 && (
        <form noValidate onChange={() => serverError && setServerError(null)} onSubmit={s3.handleSubmit(onPassword)} className="mt-1 space-y-5">
          <p className="text-(--muted)">{f.s3.sub}</p>
          <TextField label={a.fields.newPassword} icon={Lock} type="password" autoComplete="new-password" placeholder={a.fields.passwordPh} error={s3.formState.errors.password?.message} {...s3.register("password", rules.passwordNew)} />
          <TextField label={a.fields.confirmPassword} icon={Lock} type="password" autoComplete="new-password" placeholder="••••••••" error={s3.formState.errors.confirmPassword?.message} {...s3.register("confirmPassword", rules.confirm(() => s3.getValues("password")))} />
          <FormAlert message={serverError} />
          <SubmitButton loading={s3.formState.isSubmitting}>{f.s3.submit}</SubmitButton>
        </form>
      )}
      {step === 3 && <SuccessPanel title={f.doneTitle} text={f.doneText} cta={f.back} href="/login" />}
    </AuthShell>
  );
}