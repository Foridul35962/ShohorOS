"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Lock, LogIn, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { clean, useRules } from "@/lib/auth-rules";
import { AuthShell, FormAlert, SubmitButton } from "@/components/auth/AuthShell";
import { TextField } from "@/components/auth/fields";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { login } from "@/store/slice/authSlice";
import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginValues = { email: string; password: string };

export default function LoginPage() {
  const { t } = useI18n(); const a = t.auth; const rules = useRules();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ mode: "onTouched" });
  const [serverError, setServerError] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const onSubmit = async (values: LoginValues) => {
    const payload = clean(values);
    try {
      await dispatch(login(payload)).unwrap()
      router.push("/")
    } catch (error: any) {
      const msg = typeof error === "string" ? error : (error as { message?: string } | null)?.message;
      setServerError(msg || a.errors.generic);
    }
  };

  console.log(errors)

  return (
    <AuthShell
      icon={LogIn}
      title={a.login.title}
      sub={a.login.sub}
      footer={<>{a.login.noAccount}
        <Link href="/registration"
          className="font-medium text-(--accent) hover:underline"
        >
          {a.login.register}
        </Link></>
      }>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        onChange={() => serverError && setServerError(null)}
        className="space-y-5">
        <TextField
          label={a.fields.email}
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder={a.fields.emailPh}
          error={errors.email?.message} {...register("email", rules.email)}
        />
        <TextField
          label={a.fields.password}
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", rules.passwordLogin)}
        />
        <div className="-mt-1 text-right text-sm">
          <Link href="/forgot-password" className="font-medium text-(--accent) hover:underline">{a.login.forgot}</Link>
        </div>
        <FormAlert message={serverError} />
        <SubmitButton loading={isSubmitting}>{a.login.submit}</SubmitButton>
      </form>
    </AuthShell>
  );
}