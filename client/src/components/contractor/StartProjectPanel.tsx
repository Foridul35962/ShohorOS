"use client"

import React, { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useForm } from "react-hook-form"
import { AlertCircle, CalendarClock, Check, Loader2, MapPin, Search, UserRound } from "lucide-react"

import { getStaffName, startProject } from "@/store/slice/contractorSlice"
import { AppDispatch } from "@/store/store"
import type { AvailableStaff, GetAvailableStaffResponse } from "@/types/contractorTypes"
import { Panel, SectionHead } from "@/components/admin/AdminUi"
import { Pagination } from "@/components/admin/Pagination"
import { FormAlert, SubmitButton } from "@/components/auth/AuthShell"
import { SelectField, TextField } from "@/components/auth/fields"
import { getErrorMessage } from "@/lib/auth-rules"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"

const MAX_DAYS = 3
const DAY_MS = 86_400_000
const SEARCH_DELAY_MS = 2000 // auto search after the user stops typing for 3 seconds

const pad = (n: number) => String(n).padStart(2, "0")
// value for <input type="datetime-local"> in the user's local time
const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

interface Props {
  projectId: string
  onStarted: () => void
}

const StaffAvatar = ({ staff }: { staff: AvailableStaff }) => {
  const { t } = useI18n()
  const url = staff.profilePic?.url
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={t.contractorProjects.start.staffPhotoAlt.replace("{name}", staff.name)}
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

const StartProjectPanel = ({ projectId, onStarted }: Props) => {
  const { t, locale } = useI18n()
  const p = t.contractorProjects
  const dispatch = useDispatch<AppDispatch>()

  // min = next full minute, max = now + 3 days (fixed when the panel opens; re-checked on submit)
  const [bounds] = useState(() => {
    const now = Date.now()
    return {
      min: toLocalInput(new Date(Math.ceil(now / 60_000) * 60_000)),
      max: toLocalInput(new Date(now + MAX_DAYS * DAY_MS)),
    }
  })

  // staff search
  const [nameDraft, setNameDraft] = useState("")
  const [districtDraft, setDistrictDraft] = useState("")
  const [nameError, setNameError] = useState<string | null>(null)
  const [searchedName, setSearchedName] = useState("")
  const [searchedDistrict, setSearchedDistrict] = useState("")
  const [results, setResults] = useState<GetAvailableStaffResponse | null>(null)
  const [listOpen, setListOpen] = useState(true)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const requestRef = useRef(0)
  const lastKeyRef = useRef("")

  // selection + start form
  const [selected, setSelected] = useState<AvailableStaff | null>(null)
  const [staffError, setStaffError] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const form = useForm<{ startDate: string }>({ mode: "onTouched", defaultValues: { startDate: "" } })

  const runSearch = async (name: string, district: string, page: number) => {
    const id = ++requestRef.current
    lastKeyRef.current = page === 1 ? `${name}|${district}` : lastKeyRef.current
    setSearching(true)
    setSearchError(null)
    try {
      const res = (await dispatch(
        getStaffName({ page, name, ...(district ? { district } : {}) })
      ).unwrap()) as { data: GetAvailableStaffResponse }
      if (id !== requestRef.current) return // a newer search replaced this one
      setResults(res.data)
      setSearchedName(name)
      setSearchedDistrict(district)
      setListOpen(true)
    } catch (error) {
      if (id !== requestRef.current) return
      lastKeyRef.current = "" // allow the same search to be tried again
      setSearchError(getErrorMessage(error, t.auth.errors.generic))
    } finally {
      if (id === requestRef.current) setSearching(false)
    }
  }

  // Auto search: wait 3 seconds after the last change of name or district
  useEffect(() => {
    const name = nameDraft.trim()
    if (!name) return
    const timer = setTimeout(() => {
      if (lastKeyRef.current === `${name}|${districtDraft}`) return // Enter already searched this
      void runSearch(name, districtDraft, 1)
    }, SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameDraft, districtDraft])

  const handleNameChange = (value: string) => {
    setNameDraft(value)
    setListOpen(true)
    if (nameError) setNameError(null)
    if (!value.trim()) {
      // cleared: drop old results and ignore any request still running
      requestRef.current++
      lastKeyRef.current = ""
      setResults(null)
      setSearching(false)
      setSearchError(null)
    }
  }

  // Enter key: search right now
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const name = nameDraft.trim()
    if (!name) {
      setNameError(p.errors.searchRequired)
      return
    }
    setNameError(null)
    void runSearch(name, districtDraft, 1)
  }

  const choose = (staff: AvailableStaff) => {
    setSelected(staff)
    setListOpen(false)
    setStaffError(null)
    setServerError(null)
  }

  const submitStart = form.handleSubmit(async ({ startDate }) => {
    if (!selected) {
      setStaffError(p.errors.staffRequired)
      return
    }
    setServerError(null)
    try {
      await dispatch(
        startProject({ projectId, staffId: selected._id, startDate: new Date(startDate).toISOString() })
      ).unwrap()
      onStarted()
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic))
    }
  })

  const districtLabel = (value: string) =>
    locale === "bn" ? (DISTRICTS.find((d) => d.value === value)?.bn ?? value) : value

  const { errors } = form.formState
  const showList = listOpen && !selected

  return (
    <Panel>
      <SectionHead icon={CalendarClock} title={p.start.title} />
      <p className="mt-3 text-sm text-(--muted)">{p.start.text}</p>

      {/* 1. Find staff: name (auto search) + district */}
      <form onSubmit={submitSearch} role="search" aria-label={p.start.searchLabel} noValidate className="mt-5">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="relative min-w-0">
            <TextField
              label={p.start.searchLabel}
              icon={Search}
              type="text"
              autoComplete="off"
              maxLength={100}
              placeholder={p.start.searchPlaceholder}
              error={nameError ?? undefined}
              value={nameDraft}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            {searching && (
              <Loader2
                size={16}
                className="absolute right-4 top-[2.45rem] animate-spin text-(--accent)"
                aria-hidden
              />
            )}
          </div>

          <SelectField
            label={p.start.districtLabel}
            icon={MapPin}
            value={districtDraft}
            onChange={(e) => setDistrictDraft(e.target.value)}
          >
            <option value="">{p.start.allDistricts}</option>
            {DISTRICTS.map((d) => (
              <option key={d.value} value={d.value}>
                {locale === "bn" ? d.bn : d.value}
              </option>
            ))}
          </SelectField>
        </div>
      </form>

      {/* 2. Results */}
      {(showList || searching || searchError || results === null) && !selected && (
        <div className="mt-4" aria-live="polite" aria-busy={searching}>
          {searching ? (
            <p role="status" className="text-sm text-(--muted)">
              {p.start.searching}
            </p>
          ) : searchError ? (
            <FormAlert message={searchError} />
          ) : results === null ? (
            <p className="text-sm text-(--muted)">{p.start.searchHint}</p>
          ) : results.staff.length === 0 ? (
            <p className="text-sm text-(--muted)">{p.start.noResults}</p>
          ) : (
            <>
              <ul className="space-y-2" aria-label={p.start.resultsLabel}>
                {results.staff.map((s) => (
                  <li key={s._id}>
                    <button
                      type="button"
                      onClick={() => choose(s)}
                      className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-(--line) p-3 text-left transition-colors hover:border-(--accent) hover:bg-(--accent-soft)"
                    >
                      <StaffAvatar staff={s} />
                      <span className="min-w-0 flex-1">
                        <span className="font-display block wrap-break-words text-sm font-semibold text-(--ink)">
                          {s.name}
                        </span>
                        <span className="block text-xs text-(--muted)">{districtLabel(s.district)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {results.pagination.totalPages > 1 && (
                <div className="mt-3 flex justify-center">
                  <Pagination
                    page={results.pagination.currentPage}
                    totalPages={results.pagination.totalPages}
                    onPage={(next) => void runSearch(searchedName, searchedDistrict, next)}
                    disabled={searching}
                    labels={{ prev: p.pagination.prev, next: p.pagination.next, label: p.pagination.label }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 3. Selected staff */}
      {selected && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-(--accent) bg-(--accent-soft) p-3">
          <StaffAvatar staff={selected} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-(--muted)">{p.start.selected}</p>
            <p className="font-display wrap-break-words text-sm font-semibold text-(--ink)">{selected.name}</p>
          </div>
          <Check size={18} className="shrink-0 text-(--accent)" aria-hidden />
          <button
            type="button"
            onClick={() => {
              setSelected(null)
              setListOpen(true)
            }}
            className="focus-ring rounded-full px-3 py-1.5 text-sm font-medium text-(--accent) hover:underline"
          >
            {p.start.change}
          </button>
        </div>
      )}
      {staffError && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-(--warm)">
          <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />
          {staffError}
        </p>
      )}

      {/* 4. Start date + submit */}
      <form
        onSubmit={(e) => {
          if (!selected) setStaffError(p.errors.staffRequired)
          return submitStart(e)
        }}
        noValidate
        autoComplete="off"
        onChange={() => serverError && setServerError(null)}
        className="mt-5 space-y-4"
      >
        <div>
          <TextField
            label={p.start.dateLabel}
            icon={CalendarClock}
            type="datetime-local"
            min={bounds.min}
            max={bounds.max}
            error={errors.startDate?.message}
            {...form.register("startDate", {
              validate: {
                required: (v) => v !== "" || p.errors.dateRequired,
                notPast: (v) => v === "" || new Date(v).getTime() >= Date.now() || p.errors.datePast,
                notTooFar: (v) =>
                  v === "" || new Date(v).getTime() <= Date.now() + MAX_DAYS * DAY_MS || p.errors.dateTooFar,
              },
            })}
          />
          <p className="mt-1.5 text-xs text-(--muted)">{p.start.dateHint}</p>
        </div>

        <FormAlert message={serverError} />

        <SubmitButton loading={form.formState.isSubmitting}>{p.start.submit}</SubmitButton>
      </form>
    </Panel>
  )
}

export default StartProjectPanel