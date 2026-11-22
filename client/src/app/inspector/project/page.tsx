import { Suspense } from "react"
import { AdminPageShell } from "@/components/admin/AdminUi"
import InspectorProjectsPageClient from "@/components/inspector/InspectorProjectsPageClient"
import { InspectorProjectsListSkeleton } from "@/components/inspector/InspectorProjectsView"

export default function InspectorProjectsPage() {
    return (
        <AdminPageShell>
            <Suspense fallback={<InspectorProjectsListSkeleton />}>
                <InspectorProjectsPageClient />
            </Suspense>
        </AdminPageShell>
    )
}