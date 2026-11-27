import { Suspense } from "react"
import { AdminPageShell } from "@/components/admin/AdminUi"
import StaffProjectsPageClient from "@/components/staff/StaffProjectsPageClient"
import { StaffProjectsListSkeleton } from "@/components/staff/StaffProjectsView"

export default function StaffProjectsPage() {
  return (
    <AdminPageShell>
      <Suspense fallback={<StaffProjectsListSkeleton />}>
        <StaffProjectsPageClient />
      </Suspense>
    </AdminPageShell>
  )
}