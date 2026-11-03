"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Lock } from "lucide-react"

import { getAllocatedProjects } from "@/store/slice/staffSlice"
import { AppDispatch, RootState } from "@/store/store"
import { isProjectCategory } from "@/components/contractor/projectConfig"
import { getErrorMessage } from "@/lib/auth-rules"
import { useI18n } from "@/lib/i18n/provider"
import type { StaffProjectFilterValues } from "./StaffProjectFilters"
import StaffProjectsView, { type StaffProjectsQuery } from "./StaffProjectsView"

const buildUrl = (pathname: string, q: StaffProjectsQuery) => {
  const sp = new URLSearchParams()
  sp.set("page", String(q.page))
  if (q.category) sp.set("category", q.category)
  return `${pathname}?${sp.toString()}`
}

interface Loaded {
  token: string
  error: string | null
}

const StaffProjectsPageClient = () => {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { allProject } = useSelector((state: RootState) => state.staff) // TODO: tomar store key thik koro

  const isStaff = user?.role?.toLowerCase() === "project-staff"
  const [tick, setTick] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  // Parse + validate every URL value
  const pageParam = searchParams.get("page")
  const rawPage = Number(pageParam)
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1
  const rawCategory = searchParams.get("category") ?? ""
  const category = isProjectCategory(rawCategory) ? rawCategory : ""

  const query: StaffProjectsQuery = { page, category }
  const token = `${page}|${category}#${tick}`

  // Loading is derived: until the request for THIS token finishes, we show the skeleton
  const loading = loaded?.token !== token
  const error = loaded?.token === token ? loaded.error : null

  // Add ?page=1 if it is missing or invalid
  useEffect(() => {
    if (pageParam !== String(page)) {
      router.replace(buildUrl(pathname, { page, category }))
    }
  }, [pageParam, page, category, pathname, router])

  // No cache: every page / filter / Search click calls the backend
  useEffect(() => {
    if (!isStaff) return
    let ignore = false

    const request = dispatch(getAllocatedProjects({ page: String(page), ...(category ? { category } : {}) }))

    request
      .unwrap()
      .then(() => {
        if (!ignore) setLoaded({ token, error: null })
      })
      .catch((err) => {
        if (!ignore) setLoaded({ token, error: getErrorMessage(err, t.auth.errors.generic) })
      })

    return () => {
      ignore = true
      request.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isStaff, token])

  // If page is bigger than the last page, go to the last page
  const totalPages = allProject.pagination.totalPages
  useEffect(() => {
    if (!loading && !error && totalPages > 0 && page > totalPages) {
      router.replace(buildUrl(pathname, { page: totalPages, category }))
    }
  }, [loading, error, totalPages, page, category, pathname, router])

  const navigate = (next: StaffProjectsQuery) => {
    const url = buildUrl(pathname, next)
    if (url === buildUrl(pathname, query)) {
      setTick((n) => n + 1) // same URL: still refetch
    } else {
      router.push(url)
    }
  }

  const handleApply = (values: StaffProjectFilterValues) => navigate({ ...values, page: 1 })
  const handleClear = () => navigate({ page: 1, category: "" })
  const handlePage = (next: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    navigate({ ...query, page: next })
  }

  if (!isStaff) {
    return (
      <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
          <Lock size={26} strokeWidth={1.8} aria-hidden />
        </div>
        <p className="font-display text-lg font-semibold text-(--ink)">{t.staffProjects.locked.title}</p>
        <p className="mt-1 text-sm text-(--muted)">{t.staffProjects.locked.text}</p>
      </div>
    )
  }

  return (
    <StaffProjectsView
      query={query}
      data={allProject}
      loading={loading}
      error={error}
      onRetry={() => setTick((n) => n + 1)}
      onApply={handleApply}
      onClear={handleClear}
      onPage={handlePage}
    />
  )
}

export default StaffProjectsPageClient