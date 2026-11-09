"use client"

import { Lock } from "lucide-react"
import { useI18n } from "@/lib/i18n/provider"

const ProjectLocked = () => {
  const { t } = useI18n()
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
        <Lock size={26} strokeWidth={1.8} aria-hidden />
      </div>
      <p className="font-display text-lg font-semibold text-(--ink)">{t.contractorProjects.locked.title}</p>
      <p className="mt-1 text-sm text-(--muted)">{t.contractorProjects.locked.text}</p>
    </div>
  )
}

export default ProjectLocked