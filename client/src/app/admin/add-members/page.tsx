"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { CheckCircle2, Lock, Mail, MapPin, Phone, Plus, ShieldCheck, User, UserPlus } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICTS } from "@/lib/districts";
import { clean, getErrorMessage, useRules } from "@/lib/auth-rules";
import { AuthShell, FormAlert, Steps, SubmitButton } from "@/components/auth/AuthShell";
import { SelectField, TextField } from "@/components/auth/fields";
import { OtpStep } from "@/components/auth/OtpStep";
import { AppDispatch, RootState } from "@/store/store";
import { addMembers, verifyMembers } from "@/store/slice/adminSlice";
import { resendOtp } from "@/store/slice/authSlice";

const ROLES = ["moderator", "department-officer", "inspector"] as const;
type Role = (typeof ROLES)[number];
type Values = { name: string; email: string; phoneNumber: string; password: string; role: Role | "" };
type Member = { name: string; email: string; phoneNumber: string; role: string };   // backend response after OTP is verified

export default function AddMemberForm() {
    const { t, locale } = useI18n(); const a = t.auth; const m = a.addMember; const rules = useRules();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const district = user?.district;
    const districtLabel = DISTRICTS.find((d) => d.value === district);

    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [otpEmail, setOtpEmail] = useState("");
    const [member, setMember] = useState<Member | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        reset,
        formState: {
            errors,
            isSubmitting
        }
    } = useForm<Values>({ mode: "onTouched", defaultValues: { role: "" } });

    // Part 1 -> backend payload: { name, email, phoneNumber, password, district, role }
    const onDetails = async (values: Values) => {
        if (!district) return setServerError(m.noDistrict);

        if (!values.role) return setServerError(a.errors.roleRequired);

        setServerError(null);
        const payload = { ...clean(values), district, role: values.role };

        try {
            await dispatch(addMembers(payload)).unwrap();                  // backend sends the OTP
            setOtpEmail(payload.email);
            setStep(1);                       // OTP page only if backend accepted
        } catch (error) {
            setServerError(getErrorMessage(error, a.errors.generic));
        }
    };

    // Part 2 -> backend payload: { email, otp }. Errors are shown by <OtpStep /> itself.
    const onOtp = async (payload: { email: string; otp: string }) => {
        const res = await dispatch(verifyMembers(payload)).unwrap();
        const created: Member = res.data
        setMember(created);
        setStep(2);
    };

    const onResend = async () => {
        await dispatch(resendOtp({ email: otpEmail, topic: "addMembers" })).unwrap();
    };

    const addAnother = () => {
        reset({ role: "" });
        setMember(null);
        setOtpEmail("");
        setServerError(null);
        setStep(0);
    };

    const roleRule = {
        required: a.errors.roleRequired,
        validate: (v: string) => (ROLES as readonly string[]).includes(v) || a.errors.roleInvalid
    };
    const roleLabel = (r: string) => (m.roles as Record<string, string>)[r] ?? r;

    return (
        <AuthShell icon={UserPlus} wide title={m.title} sub={step === 2 ? undefined : m.sub}>
            {step < 2 && <Steps labels={m.steps} current={step} />}

            {step === 0 && (
                <form
                    noValidate
                    autoComplete="off"
                    onChange={() => serverError && setServerError(null)}
                    onSubmit={handleSubmit(onDetails)} className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <TextField
                            label={a.fields.name}
                            icon={User}
                            placeholder={a.fields.namePh}
                            error={errors.name?.message}
                            {...register("name", rules.required(a.errors.nameRequired))}
                        />
                    </div>
                    <TextField
                        label={a.fields.email}
                        icon={Mail}
                        type="email"
                        placeholder={a.fields.emailPh}
                        error={errors.email?.message}
                        {...register("email", rules.email)}
                    />
                    <TextField
                        label={a.fields.phone}
                        icon={Phone}
                        type="tel" placeholder={a.fields.phonePh}
                        error={errors.phoneNumber?.message}
                        {...register("phoneNumber", rules.phone)}
                    />
                    <SelectField
                        label={a.fields.role}
                        icon={ShieldCheck}
                        error={errors.role?.message}
                        {...register("role", roleRule)}
                    >
                        <option value="">{a.fields.rolePh}</option>
                        {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                    </SelectField>
                    <div>
                        {/* Not registered in the form: shown only, value is taken from the admin's account */}
                        <TextField
                            label={a.fields.district}
                            icon={MapPin}
                            readOnly disabled
                            value={districtLabel ? (locale === "bn" ? districtLabel.bn : districtLabel.value) : (district ?? "")}
                            className="cursor-not-allowed opacity-70" />
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-(--muted)"><Lock size={12} aria-hidden />{m.districtHint}</p>
                    </div>
                    <div className="sm:col-span-2">
                        <TextField label={a.fields.password}
                            icon={Lock} type="password"
                            autoComplete="new-password"
                            placeholder={a.fields.passwordPh}
                            error={errors.password?.message}
                            {...register("password", rules.passwordNew)} />
                    </div>
                    <div className="space-y-4 sm:col-span-2">
                        <FormAlert message={serverError ?? (!district ? m.noDistrict : null)} />
                        <SubmitButton loading={isSubmitting}>{m.submit}</SubmitButton>
                    </div>
                </form>
            )}

            {step === 1 && (
                <div>
                    <h2 className="font-display text-xl font-semibold">{m.otpTitle}</h2>
                    <p className="mb-6 mt-1 text-(--muted)">{m.otpSub}</p>
                    <OtpStep email={otpEmail} submitLabel={m.otpSubmit} backLabel={a.otp.back} onBack={() => setStep(0)} onSubmit={onOtp} onResend={onResend} />
                </div>
            )}

            {step === 2 && member && (
                <div className="py-2 text-center">
                    <span
                        className="mx-auto grid h-16 w-16 place-items-center rounded-full"
                        style={{ background: "color-mix(in oklab, var(--ok) 16%, transparent)", color: "var(--ok)" }}
                    >
                        <CheckCircle2 size={32} aria-hidden />
                    </span>
                    <h2 className="font-display mt-5 text-2xl font-semibold">{m.doneTitle}</h2>
                    <p className="mx-auto mt-2 max-w-sm text-(--muted)">{m.doneText}</p>
                    <dl className="mx-auto mt-7 grid max-w-xl gap-px overflow-hidden rounded-2xl border border-(--line) bg-(--line) text-left sm:grid-cols-2">
                        {([
                            [User, a.fields.name, member.name], [Mail, a.fields.email, member.email], [Phone, a.fields.phone, member.phoneNumber],
                            [ShieldCheck, a.fields.role, roleLabel(member.role)], [MapPin, a.fields.district, districtLabel ? (locale === "bn" ? districtLabel.bn : districtLabel.value) : (district ?? "")],
                        ] as const).map(([Icon, label, value]) => (
                            <div key={label} className="flex items-start gap-3 bg-(--surface) p-4">
                                <Icon size={18} className="mt-0.5 shrink-0 text-(--accent)" aria-hidden />
                                <div className="min-w-0"><dt className="text-xs text-(--muted)">{label}</dt><dd className="wrap-break-word font-medium">{value}</dd></div>
                            </div>
                        ))}
                    </dl>
                    <button type="button" onClick={addAnother} className="btn-primary focus-ring mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5">
                        <Plus size={18} aria-hidden />{m.another}
                    </button>
                </div>
            )}
        </AuthShell>
    );
}