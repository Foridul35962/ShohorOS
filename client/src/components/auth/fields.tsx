"use client";
import { forwardRef, useId, useState } from "react";
import { AlertCircle, ChevronDown, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

type Common = { label: string; error?: string; icon?: LucideIcon; optional?: string };

function Wrap({ id, label, error, optional, children }: { id: string; label: string; error?: string; optional?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between text-sm font-medium">
        {label}{optional && <span className="text-xs font-normal text-(--muted)">{optional}</span>}
      </label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-(--warm)"><AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />{error}</p>}
    </div>
  );
}
const iconCls = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)";

export const TextField = forwardRef<HTMLInputElement, Common & React.InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { label, error, icon: Icon, optional, type = "text", className = "", ...rest }, ref) {
  const id = useId(); const { t } = useI18n(); const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <Wrap id={id} label={label} error={error} optional={optional}>
      <div className="relative">
        {Icon && <Icon size={18} className={iconCls} aria-hidden />}
        <input ref={ref} id={id} type={isPw && show ? "text" : type} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
          className={`input py-3 ${Icon ? "pl-11" : "pl-4"} ${isPw ? "pr-12" : "pr-4"} ${className}`} {...rest} />
        {isPw && (
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? t.auth.actions.hide : t.auth.actions.show}
            className="focus-ring absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-(--muted) hover:text-(--ink)">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </Wrap>
  );
});

export const TextAreaField = forwardRef<HTMLTextAreaElement, Common & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextAreaField(
  { label, error, optional, className = "", ...rest }, ref) {
  const id = useId();
  return (
    <Wrap id={id} label={label} error={error} optional={optional}>
      <textarea ref={ref} id={id} rows={3} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={`input resize-y px-4 py-3 ${className}`} {...rest} />
    </Wrap>
  );
});

export const SelectField = forwardRef<HTMLSelectElement, Common & React.SelectHTMLAttributes<HTMLSelectElement>>(function SelectField(
  { label, error, icon: Icon, optional, children, className = "", ...rest }, ref) {
  const id = useId();
  return (
    <Wrap id={id} label={label} error={error} optional={optional}>
      <div className="relative">
        {Icon && <Icon size={18} className={iconCls} aria-hidden />}
        <select ref={ref} id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
          className={`input appearance-none py-3 pr-11 ${Icon ? "pl-11" : "pl-4"} ${className}`} {...rest}>{children}</select>
        <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--muted)" aria-hidden />
      </div>
    </Wrap>
  );
});
