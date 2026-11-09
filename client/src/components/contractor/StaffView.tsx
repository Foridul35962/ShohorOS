"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { motion, MotionConfig } from "motion/react"
import { AlertTriangle, Briefcase, Mail, MapPin, Phone, Plus, RotateCcw, UserRound, Users } from "lucide-react"

import { Pagination } from "@/components/admin/Pagination"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"
import type { CompanyStaff, GetAllStaffResponse } from "@/types/contractorTypes"
import StaffFilters from "./StaffFilters"

type StaffFilterValues = {
  name: string
  district: string
  workingProject: string
}

export interface StaffQuery extends StaffFilterValues {
  workingProject: any
  district: any
  name: any
  page: number
}

interface Props {
  query: StaffQuery
  data: GetAllStaffResponse | null
  loading: boolean
  error: string | null
  onRetry: () => void
  onApply: (values: StaffFilterValues) => void
  onClear: () => void
  onPage: (page: number) => void
}

export const StaffListSkeleton = () => (
  <ul className="space-y-3" aria-busy="true">
    {Array.from({ length: 5 }).map((_, i) => (
      <li
        key={i}
        className="card h-24 animate-pulse"
        style={{ opacity: Math.max(0.35, 1 - i * 0.15) }}
      />
    ))}
  </ul>
)

const Avatar = ({ staff }: { staff: CompanyStaff }) => {
  const { t } = useI18n()
  const url = staff.profilePic?.url

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={t.staff.photoAlt.replace("{name}", staff.name)}
        className="h-11 w-11 shrink-0 rounded-2xl object-cover"
      />
    )
  }
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
      <UserRound size={20} strokeWidth={1.8} aria-hidden />
    </div>
  )
}

const StaffRow = ({ staff, nf }: { staff: CompanyStaff; nf: Intl.NumberFormat }) => {
  const { t, locale } = useI18n()
  const districtLabel =
    locale === "bn" ? (DISTRICTS.find((d) => d.value === staff.district)?.bn ?? staff.district) : staff.district
  const working = staff.isWorkingOnProject
  const projectCount = staff.assignedProjects?.length ?? 0

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="card flex items-start gap-3 p-4 sm:gap-4 sm:p-5"
    >
      <Avatar staff={staff} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display min-w-0 wrap-break-word text-base font-semibold text-(--ink)">{staff.name}</p>
          <span
            className="chip rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={
              working
                ? { background: "var(--accent-soft)", color: "var(--accent)" }
                : { background: "color-mix(in oklab, var(--muted) 14%, transparent)", color: "var(--muted)" }
            }
          >
            {working ? t.staff.status.working : t.staff.status.available}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--muted)">
          <span className="inline-flex min-w-0 items-center gap-1.5 break-all">
            <Mail size={14} aria-hidden className="shrink-0" />
            {staff.email}
          </span>
          {staff.phoneNumber && (
            <span className="inline-flex items-center gap-1.5">
              <Phone size={14} aria-hidden className="shrink-0" />
              {staff.phoneNumber}
            </span>
          )}
          {staff.district && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} aria-hidden className="shrink-0" />
              {districtLabel}
            </span>
          )}
          {projectCount > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Briefcase size={14} aria-hidden className="shrink-0" />
              {t.staff.projects.replace("{count}", nf.format(projectCount))}
            </span>
          )}
        </div>
      </div>
    </motion.li>
  )
}

const StaffView = ({ query, data, loading, error, onRetry, onApply, onClear, onPage }: Props) => {
  const { t, locale } = useI18n()
  const nf = useMemo(() => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en"), [locale])

  const hasFilters = !!(query.name || query.district || query.workingProject)
  const staff = data?.staff ?? []
  const pagination = data?.pagination
  const total = pagination?.totalStaff ?? 0
  const companyName = data?.company?.companyName

  const from = pagination ? (pagination.currentPage - 1) * pagination.limit + 1 : 0
  const to = from + staff.length - 1

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1] text-(--ink)">
                {t.staff.title}
              </h1>
              {!loading && !error && data && (
                <span className="chip rounded-full bg-(--accent-soft) px-3 py-1 text-sm font-medium text-(--accent)">
                  {t.staff.count.replace("{count}", nf.format(total))}
                </span>
              )}
            </div>
            <p className="mt-2 max-w-xl text-(--muted)">{t.staff.subtitle}</p>
            {companyName && (
              <p className="mt-1 wrap-break-word text-sm font-medium text-(--accent)">
                {t.staff.companyLine.replace("{company}", companyName)}
              </p>
            )}
          </div>

          <Link
            href="/contractor/staff/new"
            className="btn-primary focus-ring inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
          >
            <Plus size={16} aria-hidden />
            {t.staff.add}
          </Link>
        </div>

        <StaffFilters
          key={`${query.name}|${query.district}|${query.workingProject}`}
          applied={{ name: query.name, district: query.district, workingProject: query.workingProject }}
          disabled={loading}
          onApply={onApply}
          onClear={onClear}
        />

        {loading ? (
          <div role="status" aria-label={t.staff.loading}>
            <StaffListSkeleton />
          </div>
        ) : error ? (
          <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center" role="alert">
            <div
              className="mb-4 grid h-16 w-16 place-items-center rounded-full"
              style={{ background: "color-mix(in oklab, var(--warm) 12%, transparent)", color: "var(--warm)" }}
            >
              <AlertTriangle size={26} strokeWidth={1.8} aria-hidden />
            </div>
            <p className="font-display text-lg font-semibold text-(--ink)">{t.staff.error.title}</p>
            <p className="mt-1 wrap-break-word text-sm text-(--muted)">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="btn-primary focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
            >
              <RotateCcw size={14} aria-hidden />
              {t.staff.error.retry}
            </button>
          </div>
        ) : staff.length === 0 ? (
          <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
              <Users size={26} strokeWidth={1.8} aria-hidden />
            </div>
            <p className="font-display text-lg font-semibold text-(--ink)">
              {hasFilters ? t.staff.empty.filteredTitle : t.staff.empty.title}
            </p>
            <p className="mt-1 text-sm text-(--muted)">
              {hasFilters ? t.staff.empty.filteredText : t.staff.empty.text}
            </p>
            {!hasFilters && (
              <Link
                href="/contractor/staff/new"
                className="btn-primary focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
              >
                <Plus size={16} aria-hidden />
                {t.staff.add}
              </Link>
            )}
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {staff.map((s) => (
                <StaffRow key={s._id} staff={s} nf={nf} />
              ))}
            </ul>

            {pagination && (
              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-sm text-(--muted)" aria-live="polite">
                  {t.staff.showing
                    .replace("{from}", nf.format(from))
                    .replace("{to}", nf.format(to))
                    .replace("{total}", nf.format(total))}
                </p>
                <Pagination
                  page={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPage={onPage}
                  labels={{
                    prev: t.staff.pagination.prev,
                    next: t.staff.pagination.next,
                    label: t.staff.pagination.label,
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </MotionConfig>
  )
}

export default StaffView