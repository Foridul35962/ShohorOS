"use client"

import React, { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { ClipboardCheck } from "lucide-react"

import { FormAlert, SubmitButton } from "@/components/auth/AuthShell"
import { SelectField, TextAreaField } from "@/components/auth/fields"
import { DialogShell } from "@/components/issues/ModerationDialogs"
import { clean, getErrorMessage } from "@/lib/auth-rules"
import { useI18n } from "@/lib/i18n/provider"
import ProjectImagePicker from "@/components/staff/ProjectImagePicker"
import { IMAGE_FIELD, MAX_IMAGES, MAX_IMAGE_MB } from "@/components/staff/staffProjectConfig"
import { MAX_REPORT_TEXT, RESULTS, type ReportResult } from "./inspectorConfig"

interface ReportForm {
    result: ReportResult | ""
    findings: string
    correctionNote: string
}

interface Props {
    projectId: string
    onClose: () => void
    // Throw to keep the dialog open: the message is shown inside the dialog
    onSubmit: (payload: FormData) => Promise<void>
    onDone: () => void
}

const ReportDialog = ({ projectId, onClose, onSubmit, onDone }: Props) => {
    const { t, locale } = useI18n()
    const p = t.inspector
    const nf = useMemo(() => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en"), [locale])

    const [serverError, setServerError] = useState<string | null>(null)
    const [failedReinspection, setFailedReinspection] = useState(false)
    const [files, setFiles] = useState<File[]>([])
    const [imageError, setImageError] = useState<string | null>(null)

    const form = useForm<ReportForm>({
        mode: "onTouched",
        defaultValues: { result: "", findings: "", correctionNote: "" },
    })
    const { errors, isSubmitting } = form.formState
    const result = form.watch("result")
    const findingsLength = form.watch("findings").length
    const noteLength = form.watch("correctionNote").length

    const needsNote = result === "FAILED" || result === "NEEDS_REINSPECTION"
    // PASSED -> false, NEEDS_REINSPECTION -> true, FAILED -> inspector decides
    const reinspection = result === "NEEDS_REINSPECTION" ? true : result === "FAILED" ? failedReinspection : false

    const send = form.handleSubmit(async (values) => {
        const v: ReportForm = clean(values)
        if (v.result === "") return
        setServerError(null)
        const fd = new FormData()
        fd.append("projectId", projectId)
        fd.append("findings", v.findings)
        fd.append("result", v.result)
        fd.append("correctionNote", v.correctionNote)
        fd.append("reinspectionRequired", String(reinspection))
        files.forEach((file) => fd.append(IMAGE_FIELD, file))

        try {
            await onSubmit(fd)
            onDone()
        } catch (error) {
            setServerError(getErrorMessage(error, t.auth.errors.generic))
        }
    })

    const counter = (len: number) =>
        p.fields.count.replace("{count}", nf.format(len)).replace("{max}", nf.format(MAX_REPORT_TEXT))

    return (
        <DialogShell
            icon={ClipboardCheck}
            title={p.dialog.title}
            text={p.dialog.text}
            role="dialog"
            busy={isSubmitting}
            onClose={onClose}
        >
            <form
                onSubmit={send}
                noValidate
                autoComplete="off"
                onChange={() => serverError && setServerError(null)}
                className="flex flex-col"
            >
                {/* Scroll area: only the fields scroll, the buttons below stay visible */}
                <div className="-mx-1 max-h-[min(52svh,28rem)] space-y-5 overflow-y-auto overscroll-contain px-1 pb-1 pt-1">
                    <SelectField
                        label={p.fields.result}
                        error={errors.result?.message}
                        {...form.register("result", {
                            validate: (v) => v !== "" || p.errors.resultRequired,
                        })}
                    >
                        <option value="">{p.fields.selectResult}</option>
                        {RESULTS.map((r) => (
                            <option key={r} value={r}>
                                {t.adminOps.status.inspection[r]}
                            </option>
                        ))}
                    </SelectField>

                    <div>
                        <TextAreaField
                            label={p.fields.findings}
                            rows={4}
                            placeholder={p.fields.findingsPlaceholder}
                            error={errors.findings?.message}
                            {...form.register("findings", {
                                validate: {
                                    required: (v) => v.trim() !== "" || p.errors.findingsRequired,
                                    max: (v) =>
                                        v.trim().length <= MAX_REPORT_TEXT ||
                                        p.errors.findingsMax.replace("{max}", nf.format(MAX_REPORT_TEXT)),
                                },
                            })}
                        />
                        <p
                            className="mt-1 text-right text-xs tabular-nums"
                            style={{ color: findingsLength > MAX_REPORT_TEXT ? "var(--warm)" : "var(--muted)" }}
                        >
                            {counter(findingsLength)}
                        </p>
                    </div>

                    <div>
                        <TextAreaField
                            label={p.fields.correction}
                            optional={needsNote ? undefined : p.fields.optional}
                            rows={3}
                            placeholder={p.fields.correctionPlaceholder}
                            error={errors.correctionNote?.message}
                            {...form.register("correctionNote", {
                                validate: {
                                    required: (v, all) =>
                                        all.result === "PASSED" || all.result === "" || v.trim() !== "" || p.errors.correctionRequired,
                                    max: (v) =>
                                        v.trim().length <= MAX_REPORT_TEXT ||
                                        p.errors.correctionMax.replace("{max}", nf.format(MAX_REPORT_TEXT)),
                                },
                            })}
                        />
                        <p
                            className="mt-1 text-right text-xs tabular-nums"
                            style={{ color: noteLength > MAX_REPORT_TEXT ? "var(--warm)" : "var(--muted)" }}
                        >
                            {counter(noteLength)}
                        </p>
                    </div>

                    <div>
                        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={reinspection}
                                disabled={result !== "FAILED" || isSubmitting}
                                onChange={(e) => setFailedReinspection(e.target.checked)}
                                className="focus-ring h-4 w-4 shrink-0 accent-(--accent) disabled:cursor-not-allowed"
                            />
                            {p.fields.reinspection}
                        </label>
                        <p className="mt-1.5 text-xs text-(--muted)">{p.fields.reinspectionHint}</p>
                    </div>
                    <ProjectImagePicker
                        files={files}
                        onChange={setFiles}
                        error={imageError}
                        onError={setImageError}
                        disabled={isSubmitting}
                        hint={p.fields.photosHint
                            .replace("{max}", nf.format(MAX_IMAGES))
                            .replace("{size}", nf.format(MAX_IMAGE_MB))}
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
                            <SubmitButton loading={isSubmitting}>{p.dialog.submit}</SubmitButton>
                        </div>
                    </div>
                </div>
            </form>
        </DialogShell>
    )
}

export default ReportDialog