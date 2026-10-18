"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export const MAX_IMAGES = 5;
export const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  files: File[];
  error?: string | null;
  onChange: (files: File[]) => void;
};

export function ImageUploader({ files, error, onChange }: Props) {
  const { t, locale } = useI18n();
  const p = t.issues.photos;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [notices, setNotices] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  // preview URL (effect e banai jate StrictMode e revoke bug na hoy)
  useEffect(() => {
    const made = files.map((f) => URL.createObjectURL(f));
    setUrls(made);
    return () => made.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", { maximumFractionDigits: 1 });

  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const msgs: string[] = [];
    const next = [...files];

    for (const f of Array.from(incoming)) {
      if (!ALLOWED.includes(f.type)) {
        msgs.push(p.badType.replace("{name}", f.name));
        continue;
      }
      if (f.size > MAX_SIZE) {
        msgs.push(p.tooLarge.replace("{name}", f.name).replace("{size}", nf.format(f.size / 1024 / 1024)));
        continue;
      }
      if (next.some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)) continue;
      if (next.length >= MAX_IMAGES) {
        msgs.push(p.tooMany.replace("{max}", nf.format(MAX_IMAGES)));
        break;
      }
      next.push(f);
    }
    setNotices(msgs);
    if (next.length !== files.length) onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (i: number) => {
    setNotices([]);
    onChange(files.filter((_, idx) => idx !== i));
  };

  const full = files.length >= MAX_IMAGES;

  return (
    <div>
      <input
        ref={inputRef}
        id="issue-photos"
        type="file"
        accept={ALLOWED.join(",")}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(ev) => addFiles(ev.target.files)}
      />

      <div
        onDragOver={(ev) => {
          ev.preventDefault();
          if (!full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(ev) => {
          ev.preventDefault();
          setDragging(false);
          if (!full) addFiles(ev.dataTransfer.files);
        }}
        className={`flex flex-col items-center gap-3 rounded-2xl border border-dashed px-5 py-8 text-center transition-colors ${
          dragging ? "border-(--accent) bg-(--accent-soft)" : "border-(--line)"
        }`}
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
          <UploadCloud size={24} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-(--muted)">{p.drop}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={full}
          className="btn-ghost focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          <ImagePlus size={16} aria-hidden="true" />
          {p.browse}
        </button>
        <p className="text-xs text-(--muted)" aria-live="polite">
          {p.count.replace("{count}", nf.format(files.length)).replace("{max}", nf.format(MAX_IMAGES))}
        </p>
      </div>

      {notices.length > 0 ? (
        <ul role="alert" className="mt-3 space-y-1 text-sm text-(--warm)">
          {notices.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-(--warm)">
          {error}
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}`} className="card relative overflow-hidden rounded-2xl!">
              {urls[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urls[i]} alt={p.previewAlt.replace("{n}", nf.format(i + 1))} className="aspect-square w-full object-cover" />
              ) : (
                <div className="aspect-square w-full animate-pulse bg-(--map)" />
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={p.remove.replace("{n}", nf.format(i + 1))}
                className="focus-ring absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-(--line) bg-(--surface) text-(--ink) hover:border-(--warm) hover:text-(--warm)"
              >
                <X size={14} aria-hidden="true" />
              </button>
              <p className="truncate px-2.5 py-2 text-xs text-(--muted)">{f.name}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}