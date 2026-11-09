import { Suspense } from "react"
import { AdminPageShell } from "@/components/admin/AdminUi"
import StaffPageClient from "@/components/contractor/StaffPageClient"
import { StaffListSkeleton } from "@/components/contractor/StaffView"

export default function ContractorStaffPage() {
  return (
    <AdminPageShell>
      <Suspense fallback={<StaffListSkeleton />}>
        <StaffPageClient />
      </Suspense>
    </AdminPageShell>
  )
}