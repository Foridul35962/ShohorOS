"use client";
import { useId, useRef } from "react";
import { AlertCircle } from "lucide-react";

export function OtpInput({ value, onChange, label, error, length = 6 }: { value: string; onChange: (v: string) => void; label: string; error?: string; length?: number }) {
  const id = useId();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const set = (next: string) => onChange(next.replace(/\D/g, "").slice(0, length));
  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="mb-2 text-sm font-medium">{label}</p>
      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {digits.map((d, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1} aria-label={`${label} ${i + 1}`} aria-invalid={!!error}
            className="input h-14 min-w-0 px-0 text-center text-xl font-semibold tabular-nums"
            onFocus={(e) => e.target.select()}
            onChange={(e) => { const c = e.target.value.replace(/\D/g, "").slice(-1); const arr = [...digits]; arr[i] = c; set(arr.join("")); if (c) focus(i + 1); }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i]) { e.preventDefault(); focus(i - 1); }
              if (e.key === "ArrowLeft") focus(i - 1);
              if (e.key === "ArrowRight") focus(i + 1);
            }}
            onPaste={(e) => { e.preventDefault(); const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length); set(p); focus(p.length >= length ? length - 1 : p.length); }} />
        ))}
      </div>
      {error && <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-(--warm)"><AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />{error}</p>}
    </div>
  );
}
