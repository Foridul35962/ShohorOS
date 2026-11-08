"use client"

import React, { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { CheckCheck, RotateCcw, TrendingUp } from "lucide-react"

import { FormAlert, SubmitButton } from "@/components/auth/AuthShell"
import { TextAreaField, TextField } from "@/components/auth/fields"
import { DialogShell } from "@/components/issues/ModerationDialogs"
import { clean, getErrorMessage } from "@/lib/auth-rules"
import { useI18n } from "@/lib/i18n/provider"
import ProjectImagePicker from "./ProjectImagePicker"
import { IMAGE_FIELD, MAX_DESCRIPTION } from "./staffProjectConfig"

export type WorkKind = "progress" | "complete" | "resubmit"

interface WorkForm {
    description: string
    progressPercentage: string
}

interface Props {
    kind: WorkKind
    projectId: string
    minProgress?: number
    onClose: () => void
    // Throw to keep the dialog open: the message is shown inside the dialog
    onSubmit: (formData: FormData) => Promise<void>
    onDone: () => void
}

const ICONS = { progress: TrendingUp, complete: CheckCheck, resubmit: RotateCcw } as const
const ProjectWorkDialog = ({ kind, projectId, minProgress = 0, onClose, onSubmit, onDone }: Props) => {
    const { t, locale } = useI18n()
    const p = t.staffProjectDetail
    const copy = p.dialog[kind]
    const withProgress = kind === "progress" // complete and resubmit do not send a percentage
    const nf = useMemo(() => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en"), [locale])

    const [files, setFiles] = useState<File[]>([])
    const [imageError, setImageError] = useState<string | null>(null)
    const [serverError, setServerError] = useState<string | null>(null)

    const form = useForm<WorkForm>({
        mode: "onTouched",
        defaultValues: { description: "", progressPercentage: "" },
    })
    const { errors, isSubmitting } = form.formState
    const descLength = form.watch("description").length

    const send = form.handleSubmit(async (values) => {
        if (files.length === 0) {
            setImageError(p.errors.imagesMin)
            return
        }
        setServerError(null)

        const v: WorkForm = clean(values)
        const fd = new FormData()
        fd.append("projectId", projectId)
        fd.append("description", v.description)
        if (withProgress) fd.append("progressPercentage", String(Number(v.progressPercentage)))
        files.forEach((file) => fd.append(IMAGE_FIELD, file))

        try {
            await onSubmit(fd)
            onDone()
        } catch (error) {
            setServerError(getErrorMessage(error, t.auth.errors.generic))
        }
    })

    return (
        <DialogShell
            icon={ICONS[kind]}
            title={copy.title}
            text={copy.text}
            role="dialog"
            busy={isSubmitting}
            onClose={onClose}
        >
            <form
                onSubmit={(e) => {
                    if (files.length === 0) setImageError(p.errors.imagesMin)
                    return send(e)
                }}
                noValidate
                autoComplete="off"
                onChange={() => serverError && setServerError(null)}
                className="flex flex-col"
            >
                {/* Scroll area: only the fields scroll, the buttons below stay visible */}
                <div className="-mx-1 max-h-[min(52svh,28rem)] space-y-5 overflow-y-auto overscroll-contain px-1 pb-1 pt-1">
                    <div>
                        <TextAreaField
                            label={p.fields.description}
                            rows={4}
                            placeholder={p.fields.descriptionPlaceholder}
                            error={errors.description?.message}
                            {...form.register("description", {
                                validate: {
                                    required: (v) => v.trim() !== "" || p.errors.descriptionRequired,
                                    max: (v) =>
                                        v.trim().length <= MAX_DESCRIPTION ||
                                        p.errors.descriptionMax.replace("{max}", nf.format(MAX_DESCRIPTION)),
                                },
                            })}
                        />
                        <p
                            className="mt-1 text-right text-xs tabular-nums"
                            style={{ color: descLength > MAX_DESCRIPTION ? "var(--warm)" : "var(--muted)" }}
                        >
                            {p.fields.count.replace("{count}", nf.format(descLength)).replace("{max}", nf.format(MAX_DESCRIPTION))}
                        </p>
                    </div>

                    {withProgress && (
                        <div>
                            <TextField
                                label={p.fields.progress}
                                type="number"
                                inputMode="decimal"
                                min={minProgress}
                                max={100}
                                step="any"
                                autoComplete="off"
                                placeholder={p.fields.progressPlaceholder}
                                error={errors.progressPercentage?.message}
                                {...form.register("progressPercentage", {
                                    validate: {
                                        required: (v) => v.trim() !== "" || p.errors.progressRequired,
                                        range: (v) =>
                                            v.trim() === "" ||
                                            (Number.isFinite(Number(v)) && Number(v) >= 0 && Number(v) <= 100) ||
                                            p.errors.progressRange,
                                        notLower: (v) =>
                                            v.trim() === "" ||
                                            !Number.isFinite(Number(v)) ||
                                            Number(v) >= minProgress ||
                                            p.errors.progressLower.replace("{min}", nf.format(minProgress)),
                                    },
                                })}
                            />
                            <p className="mt-1.5 text-xs text-(--muted)">
                                {p.fields.progressLast.replace(/\{value\}/g, nf.format(minProgress))}
                            </p>
                        </div>
                    )}

                    <ProjectImagePicker
                        files={files}
                        onChange={setFiles}
                        error={imageError}
                        onError={setImageError}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Footer: always visible */}
                <div className="mt-4 space-y-3 border-t border-(--line) pt-4">
                    <FormAlert message={serverError} />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="btn-ghost focus-ring order-2 rounded-full px-5 py-3.5 text-sm font-medium disabled:opacity-60 sm:order-1"
                        >
                            {t.issueDetail.cancel}
                        </button>
                        <div className="order-1 sm:order-2">
                            <SubmitButton loading={isSubmitting}>{copy.submit}</SubmitButton>
                        </div>
                    </div>
                </div>
            </form>
        </DialogShell>
    )
}

export default ProjectWorkDialog