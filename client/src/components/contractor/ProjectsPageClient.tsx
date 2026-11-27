"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"

import { getAllProjects } from "@/store/slice/contractorSlice"
import { AppDispatch, RootState } from "@/store/store"
import { getErrorMessage } from "@/lib/auth-rules"
import { useI18n } from "@/lib/i18n/provider"
import type { ProjectFilterValues } from "./ProjectFilters"
import ProjectLocked from "./ProjectLocked"
import { isProjectCategory, isProjectStatus } from "./projectConfig"
import ProjectsView, { type ProjectsQuery } from "./ProjectsView"

const buildUrl = (pathname: string, q: ProjectsQuery) => {
  const sp = new URLSearchParams()
  sp.set("page", String(q.page))
  if (q.category) sp.set("category", q.category)
  if (q.projectStatus) sp.set("projectStatus", q.projectStatus)
  return `${pathname}?${sp.toString()}`
}

interface Loaded {
  token: string
  error: string | null
}

const ProjectsPageClient = () => {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { allProject } = useSelector((state: RootState) => state.contractor)

  const isContractor = user?.role?.toLowerCase() === "contractor"
  const [tick, setTick] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  // Parse + validate every URL value
  const pageParam = searchParams.get("page")
  const rawPage = Number(pageParam)
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1
  const rawCategory = searchParams.get("category") ?? ""
  const category = isProjectCategory(rawCategory) ? rawCategory : ""
  const rawStatus = searchParams.get("projectStatus") ?? ""
  const projectStatus = isProjectStatus(rawStatus) ? rawStatus : ""

  const query: ProjectsQuery = { page, category, projectStatus }
  const token = `${page}|${category}|${projectStatus}#${tick}`

  // Loading is derived: until the request for THIS token finishes, we show the skeleton
  const loading = loaded?.token !== token
  const error = loaded?.token === token ? loaded.error : null

  // Add ?page=1 if it is missing or invalid
  useEffect(() => {
    if (pageParam !== String(page)) {
      router.replace(buildUrl(pathname, { page, category, projectStatus }))
    }
  }, [pageParam, page, category, projectStatus, pathname, router])

  // No cache: every page / filter / Search click calls the backend
  useEffect(() => {
    if (!isContractor) return
    let ignore = false

    const request = dispatch(
      getAllProjects({
        page: String(page),
        ...(category ? { category } : {}),
        ...(projectStatus ? { projectStatus } : {}),
      })
    )

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
  }, [dispatch, isContractor, token])

  // If page is bigger than the last page, go to the last page
  const totalPages = allProject.pagination.totalPages
  useEffect(() => {
    if (!loading && !error && totalPages > 0 && page > totalPages) {
      router.replace(buildUrl(pathname, { page: totalPages, category, projectStatus }))
    }
  }, [loading, error, totalPages, page, category, projectStatus, pathname, router])

  const navigate = (next: ProjectsQuery) => {
    const url = buildUrl(pathname, next)
    if (url === buildUrl(pathname, query)) {
      setTick((n) => n + 1) // same URL: still refetch
    } else {
      router.push(url)
    }
  }

  const handleApply = (values: ProjectFilterValues) => navigate({ ...values, page: 1 })
  const handleClear = () => navigate({ page: 1, category: "", projectStatus: "" })
  const handlePage = (next: number) => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    navigate({ ...query, page: next })
  }

  if (!isContractor) return <ProjectLocked />

  return (
    <ProjectsView
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

export default ProjectsPageClient