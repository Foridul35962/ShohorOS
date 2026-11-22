"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { ArrowLeft, Lock, Mail, MailCheck, MapPin, Phone, UserPlus, UserRound } from "lucide-react"

import { addStaff, verifyStaff } from "@/store/slice/contractorSlice"
import { AppDispatch, RootState } from "@/store/store"
import type { addStaffType } from "@/types/contractorTypes"
import { AdminPageShell } from "@/components/admin/AdminUi"
import { AuthShell, FormAlert, Steps, SubmitButton } from "@/components/auth/AuthShell"
import { SelectField, TextField } from "@/components/auth/fields"
import { OtpStep, type OtpPayload } from "@/components/auth/OtpStep"
import { clean, getErrorMessage } from "@/lib/auth-rules"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"
import StaffLocked from "./StaffLocked"
import { resendOtp } from "@/store/slice/authSlice"

const LIST_ROUTE = "/contractor/staff?page=1"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^(\+?880|0)1[13456789][0-9]{8}$/ // same idea as validator.js isMobilePhone("bn-BD")
const LETTER_RE = /[a-zA-Z]/
const NUMBER_RE = /[0-9]/

type Step = "details" | "otp"

type AddStaffFormValues = addStaffType & {
  confirmPassword?: string
}

const StaffForm = () => {
  const { t, locale } = useI18n()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const isContractor = user?.role?.toLowerCase() === "contractor"

  const userDistrict = user?.district ?? ""
  const defaultDistrict = DISTRICTS.some((d) => d.value === userDistrict) ? userDistrict : ""

  const [step, setStep] = useState<Step>("details")
  const [email, setEmail] = useState("")
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<AddStaffFormValues>({
    mode: "onTouched",
    defaultValues: { name: "", email: "", phoneNumber: "", password: "", confirmPassword: "", district: defaultDistrict },
  })

  const submitDetails = form.handleSubmit(async (values) => {
    setServerError(null)
    try {
      const { confirmPassword, ...payloadData } = values
      const payload: addStaffType = clean(payloadData)
      console.log('first')
      console.log(payload)
      await dispatch(addStaff(payload)).unwrap()
      setEmail(payload.email)
      setStep("otp")
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic))
    }
  })

  // OtpStep shows the error message itself if these throw
  const handleVerify = async ({ otp, email: mail }: OtpPayload) => {
    await dispatch(verifyStaff({ otp, email: mail })).unwrap()
    router.push(LIST_ROUTE)
    // Keep the button in loading state during the redirect (this page unmounts on navigation)
    await new Promise<void>(() => {})
  }

  const handleResend = async () => {
    await dispatch(resendOtp({ email, topic:"addStaff" })).unwrap()
  }

  if (!isContractor) {
    return (
      <AdminPageShell>
        <StaffLocked />
      </AdminPageShell>
    )
  }

  const { errors } = form.formState
  const stepLabels = [t.staff.steps.details, t.staff.steps.verify]

  const footer = (
    <Link
      href="/contractor/staff"
      className="focus-ring inline-flex items-center gap-1.5 rounded-full font-medium text-(--accent) hover:underline"
    >
      <ArrowLeft size={16} aria-hidden />
      {t.staff.backToList}
    </Link>
  )

  return (
    <AuthShell
      icon={step === "details" ? UserPlus : MailCheck}
      title={step === "details" ? t.staff.form.title : t.staff.otp.title}
      sub={step === "details" ? t.staff.form.subtitle : t.staff.otp.text}
      footer={footer}
    >
      <div aria-label={t.staff.steps.label}>
        <Steps labels={stepLabels} current={step === "details" ? 0 : 1} />
      </div>

      {step === "details" ? (
        <form
          onSubmit={submitDetails}
          noValidate
          autoComplete="off"
          onChange={() => serverError && setServerError(null)}
          className="space-y-5"
        >
          <TextField
            label={t.staff.fields.name}
            icon={UserRound}
            type="text"
            autoComplete="off"
            placeholder={t.staff.fields.namePlaceholder}
            error={errors.name?.message}
            {...form.register("name", {
              validate: (v) => v.trim() !== "" || t.staff.errors.nameRequired,
            })}
          />

          <TextField
            label={t.staff.fields.email}
            icon={Mail}
            type="email"
            autoComplete="off"
            placeholder={t.staff.fields.emailPlaceholder}
            error={errors.email?.message}
            {...form.register("email", {
              validate: (v) => EMAIL_RE.test(v.trim()) || t.staff.errors.emailInvalid,
            })}
          />

          <TextField
            label={t.staff.fields.phone}
            icon={Phone}
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder={t.staff.fields.phonePlaceholder}
            error={errors.phoneNumber?.message}
            {...form.register("phoneNumber", {
              validate: (v) => PHONE_RE.test(v.trim()) || t.staff.errors.phoneInvalid,
            })}
          />

          <div>
            <TextField
              label={t.staff.fields.password}
              icon={Lock}
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...form.register("password", {
                validate: {
                  required: (v) => v.trim() !== "" || t.staff.errors.passwordRequired,
                  min: (v) => v.trim().length >= 8 || t.staff.errors.passwordMin,
                  letter: (v) => LETTER_RE.test(v) || t.staff.errors.passwordLetter,
                  number: (v) => NUMBER_RE.test(v) || t.staff.errors.passwordNumber,
                },
              })}
            />
            <p className="mt-1.5 text-xs text-(--muted)">{t.staff.fields.passwordHint}</p>
          </div>

          <TextField
            label={t.auth?.fields?.confirmPassword ?? "Confirm Password"}
            icon={Lock}
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...form.register("confirmPassword", {
              validate: (v) =>
                v === form.getValues("password") ||
                t.auth?.errors?.passwordMismatch ||
                "Passwords do not match",
            })}
          />

          <SelectField
            label={t.staff.fields.district}
            icon={MapPin}
            error={errors.district?.message}
            {...form.register("district", {
              validate: {
                required: (v) => v !== "" || t.staff.errors.districtRequired,
                valid: (v) => v === "" || DISTRICTS.some((d) => d.value === v) || t.staff.errors.districtInvalid,
              },
            })}
          >
            <option value="">{t.staff.fields.selectDistrict}</option>
            {DISTRICTS.map((d) => (
              <option key={d.value} value={d.value}>
                {locale === "bn" ? d.bn : d.value}
              </option>
            ))}
          </SelectField>

          <FormAlert message={serverError} />

          <SubmitButton loading={form.formState.isSubmitting}>{t.staff.form.submit}</SubmitButton>
        </form>
      ) : (
        <OtpStep
          email={email}
          submitLabel={t.staff.otp.verify}
          backLabel={t.staff.otp.changeDetails}
          onBack={() => {
            setServerError(null)
            setStep("details")
          }}
          onSubmit={handleVerify}
          onResend={handleResend}
        />
      )}
    </AuthShell>
  )
}

export default StaffForm