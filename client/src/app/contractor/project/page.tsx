import { Suspense } from "react"
import { AdminPageShell } from "@/components/admin/AdminUi"
import ProjectsPageClient from "@/components/contractor/ProjectsPageClient"
import { ProjectsListSkeleton } from "@/components/contractor/ProjectsView"

export default function ContractorProjectsPage() {
  return (
    <AdminPageShell>
      <Suspense fallback={<ProjectsListSkeleton />}>
        <ProjectsPageClient />
      </Suspense>
    </AdminPageShell>
  )
}