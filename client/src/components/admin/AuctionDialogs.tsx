"use client";

import { useState, type FormEvent } from "react";
import { CalendarClock, Gavel, Loader2, Trophy } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/auth-rules";
import { FormAlert } from "@/components/auth/AuthShell";
import { TextField } from "@/components/auth/fields";
import { DialogShell } from "@/components/issues/ModerationDialogs";
import type { AuctionBid } from "@/types/adminTypes";
import { useFmt } from "./AdminUi";

function useAction(onClose: () => void) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const run = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setServerError(null);
    try {
      await fn();
      onClose();
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic));
      setBusy(false);
    }
  };
  return { busy, serverError, run };
}

function Actions({ busy, label, busyLabel, onClose }: { busy: boolean; label: string; busyLabel: string; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        disabled={busy}
        className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {t.issueDetail.cancel}
      </button>
      <button
        type="submit"
        disabled={busy}
        className="btn-primary focus-ring inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm disabled:opacity-60"
      >
        {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
        {busy ? busyLabel : label}
      </button>
    </div>
  );
}

export function StartAuctionDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: (deadlineIso: string) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const d = t.adminOps.startAuction;
  const { busy, serverError, run } = useAction(onClose);
  const [value, setValue] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) {
      setFieldError(d.required);
      return;
    }
    if (date.getTime() <= Date.now()) {
      setFieldError(d.future);
      return;
    }
    void run(() => onConfirm(date.toISOString()));
  };

  return (
    <DialogShell icon={Gavel} role="dialog" title={d.title} text={d.text} busy={busy} onClose={onClose}>
      <form noValidate onSubmit={submit} className="mt-5">
        <TextField
          label={d.deadline}
          icon={CalendarClock}
          type="datetime-local"
          value={value}
          error={fieldError ?? undefined}
          onChange={(ev) => {
            setValue(ev.target.value);
            setFieldError(null);
          }}
        />
        <div className="mt-4">
          <FormAlert message={serverError} />
        </div>
        <Actions busy={busy} label={d.confirm} busyLabel={d.confirming} onClose={onClose} />
      </form>
    </DialogShell>
  );
}

export function SelectWinnerDialog({
  bid,
  onConfirm,
  onClose,
}: {
  bid: AuctionBid;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const d = t.adminOps.selectWinner;
  const { money } = useFmt();
  const { busy, serverError, run } = useAction(onClose);
  const name = bid.company?.companyName ?? bid.contractor?.name ?? t.adminOps.common.unknown;

  return (
    <DialogShell
      icon={Trophy}
      role="alertdialog"
      title={d.title}
      text={d.text.replace("{name}", name).replace("{amount}", money(bid.proposedBudget))}
      busy={busy}
      onClose={onClose}
    >
      <form
        noValidate
        onSubmit={(ev) => {
          ev.preventDefault();
          void run(onConfirm);
        }}
        className="mt-5"
      >
        <FormAlert message={serverError} />
        <Actions busy={busy} label={d.confirm} busyLabel={d.confirming} onClose={onClose} />
      </form>
    </DialogShell>
  );
}