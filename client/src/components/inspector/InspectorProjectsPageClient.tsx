"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"

import { getAllocatedInspectionProject } from "@/store/slice/inspectorSlice"
import { AppDispatch, RootState } from "@/store/store"
import { isProjectCategory } from "@/components/contractor/projectConfig"
import { getErrorMessage } from "@/lib/auth-rules"
import { useI18n } from "@/lib/i18n/provider"
import InspectorLocked from "./InspectorLocked"
import { isReviewFilter, type InspectorFilterValues, type ReviewFilter } from "./InspectorProjectFilters"
import InspectorProjectsView, { type InspectorQuery } from "./InspectorProjectsView"

const buildUrl = (pathname: string, q: InspectorQuery) => {
    const sp = new URLSearchParams()
    sp.set("page", String(q.page))
    if (q.category) sp.set("category", q.category)
    if (q.reviewed) sp.set("reviewed", q.reviewed)
    return `${pathname}?${sp.toString()}`
}

interface Loaded {
    token: string
    error: string | null
}

const InspectorProjectsPageClient = () => {
    const { t } = useI18n()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)
    const { allAllocatedProject } = useSelector((state: RootState) => state.inspector) // TODO: tomar store key thik koro

    const isInspector = user?.role?.toLowerCase() === "inspector"
    const [tick, setTick] = useState(0)
    const [loaded, setLoaded] = useState<Loaded | null>(null)

    // Parse + validate every URL value
    const pageParam = searchParams.get("page")
    const rawPage = Number(pageParam)
    const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1
    const rawCategory = searchParams.get("category") ?? ""
    const category = isProjectCategory(rawCategory) ? rawCategory : ""
    const rawReviewed = searchParams.get("reviewed")
    const reviewed: ReviewFilter = isReviewFilter(rawReviewed) ? rawReviewed : ""

    const query: InspectorQuery = { page, category, reviewed }
    const token = `${page}|${category}|${reviewed}#${tick}`

    // Loading is derived: until the request for THIS token finishes, we show the skeleton
    const loading = loaded?.token !== token
    const error = loaded?.token === token ? loaded.error : null

    // Add ?page=1 if it is missing or invalid
    useEffect(() => {
        if (pageParam !== String(page)) {
            router.replace(buildUrl(pathname, { page, category, reviewed }))
        }
    }, [pageParam, page, category, reviewed, pathname, router])

    // No cache: every page / filter / Search click calls the backend
    useEffect(() => {
        if (!isInspector) return
        let ignore = false

        const request = dispatch(
            getAllocatedInspectionProject({
                page: String(page),
                ...(category ? { category } : {}),
                ...(reviewed ? { reviewed: reviewed === "true" } : {}),
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
    }, [dispatch, isInspector, token])

    // If page is bigger than the last page, go to the last page
    const totalPages = allAllocatedProject.pagination.totalPages
    useEffect(() => {
        if (!loading && !error && totalPages > 0 && page > totalPages) {
            router.replace(buildUrl(pathname, { page: totalPages, category, reviewed }))
        }
    }, [loading, error, totalPages, page, category, reviewed, pathname, router])

    const navigate = (next: InspectorQuery) => {
        const url = buildUrl(pathname, next)
        if (url === buildUrl(pathname, query)) {
            setTick((n) => n + 1) // same URL: still refetch
        } else {
            router.push(url)
        }
    }

    const handleApply = (values: InspectorFilterValues) => navigate({ ...values, page: 1 })
    const handleClear = () => navigate({ page: 1, category: "", reviewed: "" })
    const handlePage = (next: number) => {
        window.scrollTo({ top: 0, behavior: "smooth" })
        navigate({ ...query, page: next })
    }

    if (!isInspector) return <InspectorLocked />

    return (
        <InspectorProjectsView
            query={query}
            data={allAllocatedProject}
            loading={loading}
            error={error}
            onRetry={() => setTick((n) => n + 1)}
            onApply={handleApply}
            onClear={handleClear}
            onPage={handlePage}
        />
    )
}

export default InspectorProjectsPageClient