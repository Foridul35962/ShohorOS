"use client"

import React, { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useForm } from "react-hook-form"
import { AlertCircle, CalendarClock, Check, Loader2, Search, UserRound } from "lucide-react"

import { allocatedInspectorForProject, viewAvailableInspector } from "@/store/slice/officerSlice"
import { AppDispatch } from "@/store/store"
import type { availableInspectorTypes } from "@/types/officerTypes"
import { Panel, SectionHead } from "@/components/admin/AdminUi"
import { FormAlert, SubmitButton } from "@/components/auth/AuthShell"
import { TextField } from "@/components/auth/fields"
import { getErrorMessage } from "@/lib/auth-rules"
import { useI18n } from "@/lib/i18n/provider"

const SEARCH_DELAY_MS = 2000

const pad = (n: number) => String(n).padStart(2, "0")
const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

interface Props {
  projectId: string
  onAllocated: () => void
}

const InspectorAvatar = ({ inspector }: { inspector: availableInspectorTypes }) => {
  const { t } = useI18n()
  const url = inspector.profilePic?.url
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={t.officerProject.allocate.photoAlt.replace("{name}", inspector.name)}
        className="h-10 w-10 shrink-0 rounded-2xl object-cover"
      />
    )
  }
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
      <UserRound size={18} strokeWidth={1.8} aria-hidden />
    </div>
  )
}

const AllocateInspectorPanel = ({ projectId, onAllocated }: Props) => {
  const { t } = useI18n()
  const a = t.officerProject.allocate
  const dispatch = useDispatch<AppDispatch>()

  const [minDate] = useState(() => toLocalInput(new Date(Math.ceil(Date.now() / 60_000) * 60_000)))

  const [nameDraft, setNameDraft] = useState("")
  const [results, setResults] = useState<availableInspectorTypes[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const requestRef = useRef(0)
  const lastKeyRef = useRef("")

  const [selected, setSelected] = useState<availableInspectorTypes | null>(null)
  const [inspectorError, setInspectorError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm<{ date: string }>({ mode: "onTouched", defaultValues: { date: "" } })

  const runSearch = async (name: string) => {
    const id = ++requestRef.current
    lastKeyRef.current = name
    setSearching(true)
    setSearchError(null)
    try {
      const res = (await dispatch(viewAvailableInspector({ name })).unwrap()) as {
        data: availableInspectorTypes[]
      }
      if (id !== requestRef.current) return
      setResults(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      if (id !== requestRef.current) return
      lastKeyRef.current = "\u0000" // allow the same search to be tried again
      setSearchError(getErrorMessage(error, t.auth.errors.generic))
    } finally {
      if (id === requestRef.current) setSearching(false)
    }
  }

  // Load the available inspectors when the panel opens
  useEffect(() => {
    void runSearch("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto search: wait 3 seconds after the last change of the name
  useEffect(() => {
    const name = nameDraft.trim()
    if (name === lastKeyRef.current) return
    const timer = setTimeout(() => void runSearch(name), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameDraft])

  // Enter key: search right now
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    void runSearch(nameDraft.trim())
  }

  const choose = (inspector: availableInspectorTypes) => {
    setSelected(inspector)
    setInspectorError(null)
    setServerError(null)
  }

  const submitAllocate = form.handleSubmit(async ({ date }) => {
    if (!selected) {
      setInspectorError(t.officerProject.errors.inspectorRequired)
      return
    }
    setServerError(null)
    try {
      await dispatch(
        allocatedInspectorForProject({ projectId, inspectorId: selected._id, date: new Date(date).toISOString() })
      ).unwrap()
      onAllocated()
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic))
    }
  })

  const { errors } = form.formState

  return (
    <Panel>
      <SectionHead icon={UserRound} title={a.title} />
      <p className="mt-3 text-sm text-(--muted)">{a.text}</p>

      <form onSubmit={submitSearch} role="search" aria-label={a.searchLabel} noValidate className="mt-5">
        <div className="relative">
          <TextField
            label={a.searchLabel}
            icon={Search}
            type="text"
            autoComplete="off"
            maxLength={100}
            placeholder={a.searchPlaceholder}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
          />
          {searching && (
            <Loader2 size={16} className="absolute right-4 top-[2.45rem] animate-spin text-(--accent)" aria-hidden />
          )}
        </div>
      </form>

      {!selected && (
        <div className="mt-4" aria-live="polite" aria-busy={searching}>
          {searching ? (
            <p role="status" className="text-sm text-(--muted)">
              {a.searching}
            </p>
          ) : searchError ? (
            <FormAlert message={searchError} />
          ) : results && results.length === 0 ? (
            <p className="text-sm text-(--muted)">{a.noResults}</p>
          ) : (
            results && (
              <ul className="space-y-2" aria-label={a.resultsLabel}>
                {results.map((s) => (
                  <li key={s._id}>
                    <button
                      type="button"
                      onClick={() => choose(s)}
                      className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-(--line) p-3 text-left transition-colors hover:border-(--accent) hover:bg-(--accent-soft)"
                    >
                      <InspectorAvatar inspector={s} />
                      <span className="min-w-0 flex-1">
                        <span className="font-display block wrap-break-words text-sm font-semibold text-(--ink)">
                          {s.name}
                        </span>
                        <span className="block break-all text-xs text-(--muted)">{s.phoneNumber}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      )}

      {selected && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-(--accent) bg-(--accent-soft) p-3">
          <InspectorAvatar inspector={selected} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-(--muted)">{a.selected}</p>
            <p className="font-display wrap-break-words text-sm font-semibold text-(--ink)">{selected.name}</p>
          </div>
          <Check size={18} className="shrink-0 text-(--accent)" aria-hidden />
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-(--accent) hover:underline"
          >
            {a.change}
          </button>
        </div>
      )}
      {inspectorError && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-(--warm)">
          <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />
          {inspectorError}
        </p>
      )}

      <form
        onSubmit={(e) => {
          if (!selected) setInspectorError(t.officerProject.errors.inspectorRequired)
          return submitAllocate(e)
        }}
        noValidate
        autoComplete="off"
        onChange={() => serverError && setServerError(null)}
        className="mt-5 space-y-4"
      >
        <div>
          <TextField
            label={a.dateLabel}
            icon={CalendarClock}
            type="datetime-local"
            min={minDate}
            error={errors.date?.message}
            {...form.register("date", {
              validate: {
                required: (v) => v !== "" || t.officerProject.errors.dateRequired,
                notPast: (v) => v === "" || new Date(v).getTime() >= Date.now() || t.officerProject.errors.datePast,
              },
            })}
          />
          <p className="mt-1.5 text-xs text-(--muted)">{a.dateHint}</p>
        </div>

        <FormAlert message={serverError} />
        <SubmitButton loading={form.formState.isSubmitting}>{a.submit}</SubmitButton>
      </form>
    </Panel>
  )
}

export default AllocateInspectorPanel