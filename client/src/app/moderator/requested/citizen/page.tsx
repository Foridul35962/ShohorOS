"use client"

import { useCallback, useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { MapPin, Phone, Mail } from "lucide-react"
import { AppDispatch, RootState } from '@/store/store'
import { useI18n } from "@/lib/i18n/provider"
import { getErrorMessage } from "@/lib/auth-rules"
import { RequestsView } from "@/components/moderator/RequestsView"
import { RequestCard, useFormat } from "@/components/moderator/RequestCard"
import { acceptCitizen, rejectCitizen, viewAllRequestedCitizen } from "@/store/slice/moderatorSlice"

const Page = () => {
    const { t } = useI18n(); const m = t.moderator; const f = useFormat()
    const dispatch = useDispatch<AppDispatch>()
    const { moderatorLoading, requestedCitizen } = useSelector((state: RootState) => state.moderator)
    const { users, pagination } = requestedCitizen

    const [page, setPage] = useState(1)
    const [fetched, setFetched] = useState(false)
    const [loadFailed, setLoadFailed] = useState<string | null>(null)

    const load = useCallback((p: number) => {
        setLoadFailed(null)
        return dispatch(viewAllRequestedCitizen({ page: String(p) })).unwrap()
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
        <RequestsView active="citizen" loading={moderatorLoading || !fetched}
            error={loadFailed === null ? null : loadFailed || t.auth.errors.generic} onRetry={() => load(page)}
            total={pagination.totalUsers} page={page} totalPages={pagination.totalPages} onPage={setPage}
            items={users.map((u) => ({
                id: u._id,
                node: (
                    <RequestCard title={u.name} subtitle={u.email} date={f.date(u.createdAt)}
                        details={[
                            { icon: Phone, label: m.fields.phone, value: u.phoneNumber },
                            { icon: MapPin, label: m.fields.district, value: f.district(u.district) },
                            { icon: Mail, label: m.fields.email, value: u.email },
                        ]}
                        onAccept={async () => { await dispatch(acceptCitizen({ requestId: u._id })).unwrap(); refill() }}
                        onReject={async (reason) => { await dispatch(rejectCitizen({ requestId: u._id, reason })).unwrap(); refill() }} />
                ),
            }))} />
    )
}

export default Page