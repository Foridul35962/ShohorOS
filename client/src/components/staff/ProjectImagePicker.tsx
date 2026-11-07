"use client"

import React, { useEffect, useId, useMemo, useRef } from "react"
import { AlertCircle, ImagePlus, X } from "lucide-react"

import { useI18n } from "@/lib/i18n/provider"
import { MAX_IMAGES, MAX_IMAGE_BYTES, MAX_IMAGE_MB, MIN_IMAGES } from "./staffProjectConfig"

interface Props {
    files: File[]
    onChange: (files: File[]) => void
    error: string | null
    onError: (message: string | null) => void
    disabled?: boolean
}

const ProjectImagePicker = ({ files, onChange, error, onError, disabled }: Props) => {
    const { t, locale } = useI18n()
    const p = t.staffProjectDetail
    const labelId = useId()
    const inputRef = useRef<HTMLInputElement>(null)
    const nf = useMemo(() => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en"), [locale])

    // Object URLs for the thumbnails (revoked when the list changes / dialog closes)
    const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
    useEffect(
        () => () => {
            previews.forEach((url) => URL.revokeObjectURL(url))
        },
        [previews]
    )

    const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? [])
        e.target.value = "" // so the same file can be picked again
        if (picked.length === 0) return

        let problem: string | null = null
        const next = [...files]
        for (const file of picked) {
            if (!file.type.startsWith("image/")) {
                if (!problem) problem = p.errors.imageType.replace("{name}", file.name)
                continue
            }
            if (file.size > MAX_IMAGE_BYTES) {
                if (!problem) {
                    problem = p.errors.imageSize.replace("{name}", file.name).replace("{size}", nf.format(MAX_IMAGE_MB))
                }
                continue
            }
            if (next.length >= MAX_IMAGES) {
                if (!problem) problem = p.errors.imagesMax.replace("{max}", nf.format(MAX_IMAGES))
                continue
            }
            next.push(file)
        }
        onChange(next)
        onError(problem)
    }

    const remove = (index: number) => {
        onChange(files.filter((_, i) => i !== index))
        onError(null)
    }

    return (
        <div role="group" aria-labelledby={labelId}>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <p id={labelId} className="text-sm font-medium">
                    {p.fields.photos}
                </p>
                <p className="text-xs text-(--muted)" aria-live="polite">
                    {p.fields.photoCount.replace("{count}", nf.format(files.length)).replace("{max}", nf.format(MAX_IMAGES))}
                </p>
            </div>
            <p className="mb-3 text-xs text-(--muted)">
                {p.fields.photosHint
                    .replace("{min}", nf.format(MIN_IMAGES))
                    .replace("{max}", nf.format(MAX_IMAGES))
                    .replace("{size}", nf.format(MAX_IMAGE_MB))}
            </p>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                tabIndex={-1}
                onChange={handlePick}
            />

            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {files.map((file, i) => (
                    <li
                        key={`${file.name}-${file.size}-${file.lastModified}-${i}`}
                        className="relative aspect-square overflow-hidden rounded-2xl border border-(--line)"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previews[i]}
                            alt={p.fields.previewAlt.replace("{n}", nf.format(i + 1))}
                            className="h-full w-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            disabled={disabled}
                            aria-label={p.fields.removePhoto.replace("{n}", nf.format(i + 1))}
                            className="focus-ring absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full border border-(--line) bg-(--surface) text-(--ink) hover:text-(--warm) disabled:opacity-60"
                        >
                            <X size={14} aria-hidden />
                        </button>
                    </li>
                ))}

                {files.length < MAX_IMAGES && (
                    <li>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={disabled}
                            className="focus-ring flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-(--line) p-1 text-center text-xs text-(--muted) transition-colors hover:border-(--accent) hover:text-(--accent) disabled:opacity-60"
                        >
                            <ImagePlus size={20} strokeWidth={1.8} aria-hidden />
                            <span className="wrap-break-words">{p.fields.addPhotos}</span>
                        </button>
                    </li>
                )}
            </ul>

            {error && (
                <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-(--warm)">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />
                    <span className="wrap-break-words">{error}</span>
                </p>
            )}
        </div>
    )
}

export default ProjectImagePicker