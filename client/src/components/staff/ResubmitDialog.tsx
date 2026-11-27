"use client"

import React, { useState } from "react"
import { RotateCcw } from "lucide-react"

import { FormAlert, SubmitButton } from "@/components/auth/AuthShell"
import { DialogShell } from "@/components/issues/ModerationDialogs"
import { getErrorMessage } from "@/lib/auth-rules"
import { useI18n } from "@/lib/i18n/provider"

interface Props {
    correctionNote: string | null
    onClose: () => void
    // Throw to keep the dialog open: the message is shown inside the dialog
    onConfirm: () => Promise<void>
    onDone: () => void
}

const ResubmitDialog = ({ correctionNote, onClose, onConfirm, onDone }: Props) => {
    const { t } = useI18n()
    const r = t.staffProjectDetail.dialog.resubmit
    const [busy, setBusy] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const confirm = async (e: React.FormEvent) => {
        e.preventDefault()
        setServerError(null)
        setBusy(true)
        try {
            await onConfirm()
            onDone()
        } catch (error) {
            setServerError(getErrorMessage(error, t.auth.errors.generic))
            setBusy(false)
        }
    }

    return (
        <DialogShell icon={RotateCcw} title={r.title} text={r.text} role="alertdialog" busy={busy} onClose={onClose}>
            <form onSubmit={confirm} className="flex flex-col">
                <div className="max-h-[min(40svh,18rem)] overflow-y-auto overscroll-contain rounded-2xl border border-(--line) p-4">
                    <p className="text-sm font-medium text-(--muted)">{r.noteLabel}</p>
                    <p className="mt-1 whitespace-pre-line wrap-break-word text-sm text-(--ink)">
                        {correctionNote ?? r.noNote}
                    </p>
                </div>

                <div className="mt-4 space-y-3 border-t border-(--line) pt-4">
                    <FormAlert message={serverError} />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={busy}
                            className="btn-ghost focus-ring order-2 rounded-full px-5 py-3.5 text-sm font-medium disabled:opacity-60 sm:order-1"
                        >
                            {t.issueDetail.cancel}
                        </button>
                        <div className="order-1 sm:order-2">
                            <SubmitButton loading={busy}>{r.confirm}</SubmitButton>
                        </div>
                    </div>
                </div>
            </form>
        </DialogShell>
    )
}

export default ResubmitDialog