"use client"

import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Hash, MapPin, Phone, User } from "lucide-react"
import { AppDispatch, RootState } from '@/store/store'
import { viewAllRequestedContractor, acceptContractor, rejectContractor } from "@/store/slice/moderatorSlice"   // <- tomar slice er path
import { useI18n } from "@/lib/i18n/provider"
import { getErrorMessage } from "@/lib/auth-rules"
import { RequestsView } from "@/components/moderator/RequestsView"
import { RequestCard, useFormat } from "@/components/moderator/RequestCard"

const Page = () => {
    const { t } = useI18n(); const m = t.moderator; const f = useFormat()
    const dispatch = useDispatch<AppDispatch>()
    const { moderatorLoading, requestedContractor } = useSelector((state: RootState) => state.moderator)
    const { users, pagination } = requestedContractor

    const [page, setPage] = useState(1)
    const [fetched, setFetched] = useState(false)
    const [loadFailed, setLoadFailed] = useState<string | null>(null)

    const load = useCallback((p: number) => {
        setLoadFailed(null)
        return dispatch(viewAllRequestedContractor({ page: String(p) })).unwrap()
            .catch((e) => setLoadFailed(getErrorMessage(e, "")))
            .finally(() => setFetched(true))
    }, [dispatch])

    useEffect(() => { load(page) }, [page, load])

    // The slice already removed the item from the list; now refill the page (or step back if this page is gone)
    const refill = () => {
        const newTotalPages = Math.max(1, Math.ceil((pagination.totalUsers - 1) / pagination.limit))
        const target = Math.min(page, newTotalPages)
        if (target !== page) setPage(target); else load(page)
    }

    return (
        <RequestsView active="contractor" loading={moderatorLoading || !fetched}
            error={loadFailed === null ? null : loadFailed || t.auth.errors.generic} onRetry={() => load(page)}
            total={pagination.totalUsers} page={page} totalPages={pagination.totalPages} onPage={setPage}
            items={users.map((u) => {
                const a = u.address
                return {
                    id: u._id,
                    node: (
                        <RequestCard title={u.companyName} subtitle={u.email} badge={f.district(a.district)} date={f.date(u.createdAt)}
                            details={[
                                { icon: User, label: m.fields.contact, value: u.name },
                                { icon: Phone, label: m.fields.phone, value: u.phoneNumber },
                                { icon: Hash, label: m.fields.regNo, value: u.registrationNumber },
                                { icon: MapPin, label: m.fields.address, wide: true, value: `${String(a.house)}, ${String(a.street)}, ${f.district(a.district)} - ${String(a.postalCode)}` },
                            ]}
                            note={u.description ? { label: m.fields.about, text: u.description } : undefined}
                            onAccept={async () => { await dispatch(acceptContractor({ requestId: u._id })).unwrap(); refill() }}
                            onReject={async (reason) => { await dispatch(rejectContractor({ requestId: u._id, reason })).unwrap(); refill() }} />
                    ),
                }
            })} />
    )
}

export default Page