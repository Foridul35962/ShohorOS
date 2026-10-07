"use client";
import { useI18n } from "@/lib/i18n/provider";
import { DISTRICT_VALUES } from "@/lib/districts";

// Mirrors the backend (express-validator) rules.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const BD_PHONE_RE = /^(\+?880|0)1[13456789][0-9]{8}$/; // validator.js isMobilePhone("bn-BD")

/** Trim every string (deep), same as `.trim()` in the backend validators. */
export function clean<T>(v: T): T {
  if (typeof v === "string") return v.trim() as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)])) as T;
  return v;
}

const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function useRules() {
  const { t } = useI18n();
  const e = t.auth.errors;
  const emailOk = (v: string) => EMAIL_RE.test(s(v)) || e.emailInvalid;
  return {
    /** login / citizen / contractor email: only "is email" */
    email: { validate: emailOk },
    /** forgot-password and OTP steps: not empty + is email */
    emailRequired: { required: e.emailRequired, validate: emailOk },
    required: (msg: string) => ({ validate: (v: string) => !!s(v) || msg }),
    phone: { validate: (v: string) => BD_PHONE_RE.test(s(v)) || e.phoneInvalid },
    district: { required: e.districtRequired, validate: (v: string) => DISTRICT_VALUES.includes(s(v)) || e.districtInvalid },
    otp: { required: e.otpRequired, validate: (v: string) => s(v).length === 6 || e.otpInvalid },
    /** login: all three failures show the same message */
    passwordLogin: {
      required: e.passwordRequired,
      validate: (v: string) => (s(v).length >= 8 && /[a-zA-Z]/.test(s(v)) && /[0-9]/.test(s(v))) || e.passwordMismatch,
    },
    /** registration / reset: specific messages */
    passwordNew: {
      required: e.passwordRequired,
      validate: {
        min: (v: string) => s(v).length >= 8 || e.passwordMin,
        letter: (v: string) => /[a-zA-Z]/.test(s(v)) || e.passwordLetter,
        number: (v: string) => /[0-9]/.test(s(v)) || e.passwordNumber,
      },
    },
    confirm: (getPassword: () => string) => ({
      required: e.confirmRequired,
      validate: (v: string) => v === getPassword() || e.confirmMismatch,
    }),
  };
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string") return error || fallback;
  const m = (error as { message?: string } | null)?.message;
  return m || fallback;
}
