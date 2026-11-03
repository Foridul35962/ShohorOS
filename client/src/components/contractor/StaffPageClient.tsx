"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"

import { getAllStaff } from "@/store/slice/contractorSlice"
import { AppDispatch, RootState } from "@/store/store"
import { getErrorMessage } from "@/lib/auth-rules"
import { DISTRICTS } from "@/lib/districts"
import { useI18n } from "@/lib/i18n/provider"
import type { StaffFilterValues, WorkingFilter } from "./StaffFilters"
import StaffLocked from "./StaffLocked"
import StaffView, { type StaffQuery } from "./StaffView"

const isDistrict = (value: string) => DISTRICTS.some((d) => d.value === value)
const isWorkingFilter = (value: string | null): value is "true" | "false" => value === "true" || value === "false"

const buildUrl = (pathname: string, q: StaffQuery) => {
  const sp = new URLSearchParams()
  sp.set("page", String(q.page))
  if (q.name) sp.set("name", q.name)
  if (q.district) sp.set("district", q.district)
  if (q.workingProject) sp.set("workingProject", q.workingProject)
  return `${pathname}?${sp.toString()}`
}

const StaffPageClient = () => {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { allStaff } = useSelector((state: RootState) => state.contractor) // TODO: tomar store key thik koro

  const isContractor = user?.role?.toLowerCase() === "contractor"

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  // Parse + validate every URL value
  const pageParam = searchParams.get("page")
  const rawPage = Number(pageParam)
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1
  const name = (searchParams.get("name") ?? "").trim().slice(0, 100)
  const rawDistrict = searchParams.get("district") ?? ""
  const district = isDistrict(rawDistrict) ? rawDistrict : ""
  const rawWorking = searchParams.get("workingProject")
  const workingProject: WorkingFilter = isWorkingFilter(rawWorking) ? rawWorking : ""

  const query: StaffQuery = { page, name, district, workingProject }

  // Add ?page=1 if it is missing or invalid
  useEffect(() => {
    if (pageParam !== String(page)) {
      router.replace(buildUrl(pathname, { page, name, district, workingProject }))
    }
  }, [pageParam, page, name, district, workingProject, pathname, router])

  // No cache: every page / filter / Search click calls the backend
  useEffect(() => {
    if (!isContractor) return
    let ignore = false
    setLoading(true)
    setError(null)

    const request = dispatch(
      getAllStaff({
        page,
        ...(name && { name }),
        ...(district && { district }),
        ...(workingProject && { workingProject: workingProject === "true" }),
      })
    )

    request
      .unwrap()
      .then(() => {
        if (!ignore) setLoading(false)
      })
      .catch((err) => {
        if (ignore) return
        setError(getErrorMessage(err, t.auth.errors.generic))
        setLoading(false)
      })

    return () => {
      ignore = true
      request.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isContractor, page, name, district, workingProject, tick])

  // If page is bigger than the last page, go to the last page
  const totalPages = allStaff?.pagination.totalPages ?? 0
  useEffect(() => {
    if (!loading && !error && totalPages > 0 && page > totalPages) {
      router.replace(buildUrl(pathname, { page: totalPages, name, district, workingProject }))
    }
  }, [loading, error, totalPages, page, name, district, workingProject, pathname, router])

  const navigate = (next: StaffQuery) => {
    const url = buildUrl(pathname, next)
    if (url === buildUrl(pathname, query)) {
      setTick((n) => n + 1) // same URL: still refetch
    } else {
      router.push(url)
    }
  }

  const handleApply = (values: { name: string; district: string; workingProject: string }) =>
    navigate({
      page: 1,
      name: values.name,
      district: values.district,
      workingProject: isWorkingFilter(values.workingProject) ? values.workingProject : "",
    })
  const handleClear = () => navigate({ page: 1, name: "", district: "", workingProject: "" })
  const handlePage = (next: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    navigate({ ...query, page: next })
  }

  if (!isContractor) return <StaffLocked />

  return (
    <StaffView
      query={query}
      data={allStaff}
      loading={loading}
      error={error}
      onRetry={() => setTick((n) => n + 1)}
      onApply={handleApply}
      onClear={handleClear}
      onPage={handlePage}
    />
  )
}

export default StaffPageClient