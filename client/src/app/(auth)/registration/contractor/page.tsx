"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Building2, FileText, Hash, HardHat, Home, Lock, Mail, MapPin, Phone, Signpost, User } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICTS } from "@/lib/districts";
import { clean, getErrorMessage, useRules } from "@/lib/auth-rules";
import { AuthShell, FormAlert, Steps, SubmitButton, SuccessPanel } from "@/components/auth/AuthShell";
import { SelectField, TextAreaField, TextField } from "@/components/auth/fields";
import { OtpStep } from "@/components/auth/OtpStep";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { constractorRegistration, constractorRegiVerify, resendOtp } from "@/store/slice/authSlice";

type Values = {
    companyName: string; registrationNumber: string; description: string;
    address: { house: string; street: string; district: string; postalCode: string };
    name: string; email: string; phoneNumber: string; password: string; confirmPassword: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <fieldset className="sm:col-span-2">
            <legend className="font-display mb-4 flex w-full items-center gap-3 text-lg font-semibold">{title}<span className="h-px flex-1 bg-(--line)" aria-hidden /></legend>
            <div className="grid gap-5 sm:grid-cols-2">{children}</div>
        </fieldset>
    );
}

export default function ContractorRegisterPage() {
    const { t, locale } = useI18n(); const a = t.auth; const rules = useRules();
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [email, setEmail] = useState("");
    const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Values>({ mode: "onTouched", defaultValues: { address: { district: "" } } });
    const dispatch = useDispatch<AppDispatch>();

    const [serverError, setServerError] = useState<string | null>(null);

    const onDetails = async ({ confirmPassword, ...rest }: Values) => {
        void confirmPassword;
        setServerError(null);
        const payload = clean(rest);
        try {
            await dispatch(constractorRegistration(payload)).unwrap();
            setEmail(payload.email); setStep(1);
        } catch (error) {
            setServerError(getErrorMessage(error, a.errors.generic));
        }
    };
    const onOtp = async (payload: { email: string; otp: string }) => {
        await dispatch(constractorRegiVerify(payload)).unwrap();
        setStep(2);
    };
    const onResend = async () => {
        await dispatch(resendOtp({ email, topic: "registrationContractor" })).unwrap();
    };
    const f = a.fields, e = errors, ad = errors.address;

    return (
        <AuthShell icon={HardHat} wide title={a.contractor.title} sub={step === 2 ? undefined : a.contractor.sub}
            footer={<>{a.register.have} <Link href="/login" className="font-medium text-(--accent) hover:underline">{a.register.login}</Link></>}>
            {step < 2 && <Steps labels={a.contractor.steps} current={step} />}
            {step === 0 && (
                <form noValidate onChange={() => serverError && setServerError(null)} onSubmit={handleSubmit(onDetails)} className="grid gap-8 sm:grid-cols-2">
                    <Section title={a.contractor.sections.company}>
                        <TextField label={f.companyName} icon={Building2} error={e.companyName?.message} {...register("companyName", rules.required(a.errors.companyRequired))} />
                        <TextField label={f.registrationNumber} icon={Hash} error={e.registrationNumber?.message} {...register("registrationNumber", rules.required(a.errors.regNoRequired))} />
                        <div className="sm:col-span-2"><TextAreaField label={f.description} optional={f.optional} {...register("description")} /></div>
                    </Section>
                    <Section title={a.contractor.sections.address}>
                        <TextField label={f.house} icon={Home} error={ad?.house?.message} {...register("address.house", rules.required(a.errors.houseRequired))} />
                        <TextField label={f.street} icon={Signpost} error={ad?.street?.message} {...register("address.street", rules.required(a.errors.streetRequired))} />
                        <SelectField label={f.district} icon={MapPin} error={ad?.district?.message} {...register("address.district", rules.district)}>
                            <option value="">{f.districtPh}</option>
                            {DISTRICTS.map((d) => <option key={d.value} value={d.value}>{locale === "bn" ? d.bn : d.value}</option>)}
                        </SelectField>
                        <TextField label={f.postalCode} icon={Hash} inputMode="numeric" error={ad?.postalCode?.message} {...register("address.postalCode", rules.required(a.errors.postalRequired))} />
                    </Section>
                    <Section title={a.contractor.sections.account}>
                        <div className="sm:col-span-2"><TextField label={f.contactName} icon={User} autoComplete="name" placeholder={f.namePh} error={e.name?.message} {...register("name", rules.required(a.errors.nameRequired))} /></div>
                        <TextField label={f.email} icon={Mail} type="email" autoComplete="email" placeholder={f.emailPh} error={e.email?.message} {...register("email", rules.email)} />
                        <TextField label={f.phone} icon={Phone} type="tel" autoComplete="tel" placeholder={f.phonePh} error={e.phoneNumber?.message} {...register("phoneNumber", rules.phone)} />
                        <TextField label={f.password} icon={Lock} type="password" autoComplete="new-password" placeholder={f.passwordPh} error={e.password?.message} {...register("password", rules.passwordNew)} />
                        <TextField label={f.confirmPassword} icon={Lock} type="password" autoComplete="new-password" placeholder="••••••••" error={e.confirmPassword?.message} {...register("confirmPassword", rules.confirm(() => getValues("password")))} />
                    </Section>
                    <div className="space-y-4 sm:col-span-2">
                        <FormAlert message={serverError} />
                        <SubmitButton loading={isSubmitting}>{a.contractor.submit}</SubmitButton>
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