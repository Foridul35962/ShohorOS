"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Lock, Mail, MapPin, Phone, User, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICTS } from "@/lib/districts";
import { clean, getErrorMessage, useRules } from "@/lib/auth-rules";
import { AuthShell, FormAlert, Steps, SubmitButton, SuccessPanel } from "@/components/auth/AuthShell";
import { SelectField, TextField } from "@/components/auth/fields";
import { OtpStep } from "@/components/auth/OtpStep";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { registrationCitizen, verifyRegistrationCitizen } from "@/store/slice/authSlice";

type Values = { name: string; email: string; phoneNumber: string; password: string; confirmPassword: string; district: string };

export default function CitizenRegisterPage() {
  const { t, locale } = useI18n(); const a = t.auth; const rules = useRules();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Values>({ mode: "onTouched", defaultValues: { district: "" } });

  const dispatch = useDispatch<AppDispatch>()
  // Part 1 -> backend payload: { name, email, phoneNumber, password, district }
  const onDetails = async ({ confirmPassword, ...rest }: Values) => {
    void confirmPassword;
    setServerError(null);
    const payload = clean(rest);
    try {
      await dispatch(registrationCitizen(payload)).unwrap();
      setEmail(payload.email); setStep(1);
    } catch (error) {
      setServerError(getErrorMessage(error, a.errors.generic));
    }
  };

  // No try/catch here on purpose: OtpStep catches the error and shows it under the OTP boxes.
  const onOtp = async (payload: { email: string; otp: string }) => {
    await dispatch(verifyRegistrationCitizen(payload)).unwrap();
    setStep(2);
  };

  const onResend = async () => {
    // await dispatch(resendOtp({ email })).unwrap();
  };

  return (
    <AuthShell icon={UserRound} wide title={a.citizen.title} sub={step === 2 ? undefined : a.citizen.sub}
      footer={<>{a.register.have} <Link href="/login" className="font-medium text-(--accent) hover:underline">{a.register.login}</Link></>}>
      {step < 2 && <Steps labels={a.citizen.steps} current={step} />}
      {step === 0 && (
        <form noValidate onChange={() => serverError && setServerError(null)} onSubmit={handleSubmit(onDetails)} className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><TextField label={a.fields.name} icon={User} autoComplete="name" placeholder={a.fields.namePh} error={errors.name?.message} {...register("name", rules.required(a.errors.nameRequired))} /></div>
          <TextField label={a.fields.email} icon={Mail} type="email" autoComplete="email" placeholder={a.fields.emailPh} error={errors.email?.message} {...register("email", rules.email)} />
          <TextField label={a.fields.phone} icon={Phone} type="tel" autoComplete="tel" placeholder={a.fields.phonePh} error={errors.phoneNumber?.message} {...register("phoneNumber", rules.phone)} />
          <div className="sm:col-span-2">
            <SelectField label={a.fields.district} icon={MapPin} error={errors.district?.message} {...register("district", rules.district)}>
              <option value="">{a.fields.districtPh}</option>
              {DISTRICTS.map((d) => <option key={d.value} value={d.value}>{locale === "bn" ? d.bn : d.value}</option>)}
            </SelectField>
          </div>
          <TextField label={a.fields.password} icon={Lock} type="password" autoComplete="new-password" placeholder={a.fields.passwordPh} error={errors.password?.message} {...register("password", rules.passwordNew)} />
          <TextField label={a.fields.confirmPassword} icon={Lock} type="password" autoComplete="new-password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register("confirmPassword", rules.confirm(() => getValues("password")))} />
          <div className="space-y-4 sm:col-span-2">
            <FormAlert message={serverError} />
            <SubmitButton loading={isSubmitting}>{a.citizen.submit}</SubmitButton>
          </div>
        </form>
      )}
      {step === 1 && (
        <div>
          <h2 className="font-display text-xl font-semibold">{a.otp.title}</h2>
          <p className="mb-6 mt-1 text-(--muted)">{a.otp.sub}</p>
          <OtpStep email={email} submitLabel={a.otp.submit} backLabel={a.otp.back} onBack={() => setStep(0)} onSubmit={onOtp} onResend={onResend} />
        </div>
      )}
      {step === 2 && <SuccessPanel title={a.otp.doneTitle} text={a.otp.doneText} cta={a.otp.toLogin} href="/" />}
    </AuthShell>
  );
}