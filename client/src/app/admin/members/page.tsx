"use client"

import { useCallback, useEffect, useState } from 'react'
import { AppDispatch, RootState } from '@/store/store'
import { useDispatch, useSelector } from 'react-redux'
import { viewAllMembers, deleteMembers } from "@/store/slice/adminSlice"   // <- tomar slice er path
import { useI18n } from "@/lib/i18n/provider"
import { getErrorMessage } from "@/lib/auth-rules"
import { MembersView, type RoleValue } from "@/components/admin/MembersView"

type Query = { name: string; role: "" | RoleValue; page: number; n: number }

const page = () => {
    const { t } = useI18n()
    const dispatch = useDispatch<AppDispatch>()
    const { adminLoading, allMembers } = useSelector((state: RootState) => state.admin)
    const { users, pagination } = allMembers

    // `n` changes on every Search click, so clicking Search again re-fetches even with the same filters
    const [query, setQuery] = useState<Query>({ name: "", role: "", page: 1, n: 0 })
    const [fetched, setFetched] = useState(false)
    const [loadFailed, setLoadFailed] = useState<string | null>(null)

    const load = useCallback((q: Query) => {
        setLoadFailed(null)
        return dispatch(viewAllMembers({
            ...(q.name && { name: q.name }),
            ...(q.role && { role: q.role }),
            page: String(q.page),
        })).unwrap()
            .catch((e) => setLoadFailed(getErrorMessage(e, "")))
            .finally(() => setFetched(true))
    }, [dispatch])

    useEffect(() => { load(query) }, [query, load])

    const onSearch = (name: string, role: "" | RoleValue) => setQuery((q) => ({ name: name.trim(), role, page: 1, n: q.n + 1 }))
    const onPage = (p: number) => setQuery((q) => ({ ...q, page: p }))

    // The slice already removed the member from the list; refetch so the page is full again and the total is correct
    const onDelete = async (id: string) => {
        await dispatch(deleteMembers({ userId: id })).unwrap()
        const limit = pagination.limit || 15
        const newTotalPages = Math.max(1, Math.ceil((pagination.totalUsers - 1) / limit))
        const target = Math.min(query.page, newTotalPages)
        if (target !== query.page) onPage(target); else load(query)
    }

    return (
        <MembersView
            loading={adminLoading || !fetched}
            error={loadFailed === null ? null : loadFailed || t.auth.errors.generic} onRetry={() => load(query)}
            total={pagination.totalUsers} limit={pagination.limit || 15} page={query.page} totalPages={pagination.totalPages} onPage={onPage}
            applied={{ name: query.name, role: query.role }} onSearch={onSearch} onDelete={onDelete}
            items={users.map((u) => ({
                id: u._id, name: u.name, email: u.email, phone: u.phoneNumber, role: u.role,
                avatar: u.profilePic?.url, createdAt: u.createdAt,
            }))} />
    )
}

export default page