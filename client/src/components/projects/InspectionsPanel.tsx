"use client"

import React from "react"
import { ShieldCheck } from "lucide-react"

import { Panel, PhotoGrid, SectionHead, StatusBadge, useFmt } from "@/components/admin/AdminUi"
import { useI18n } from "@/lib/i18n/provider"
import { Inspection } from "@/types/adminTypes"

const InspectionsPanel = ({ inspections }: { inspections?: Inspection[] }) => {
  const { t } = useI18n()
  const p = t.inspectionsPanel
  const f = useFmt()

  if (!inspections || inspections.length === 0) return null

  // newest visit first
  const list = [...inspections].sort(
    (a, b) => new Date(b.visitDate ?? b.createdAt).getTime() - new Date(a.visitDate ?? a.createdAt).getTime()
  )

  return (
    <Panel>
      <SectionHead icon={ShieldCheck} title={p.section} />
      <ul className="mt-4 space-y-5">
        {list.map((ins) => (
          <li key={ins._id} className="border-t border-(--line) pt-4 first:border-t-0 first:pt-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-display min-w-0 wrap-break-words text-sm font-semibold text-(--ink)">
                {ins.inspector?.name ?? t.adminOps.common.unknown}
              </p>
              {ins.result ? (
                <StatusBadge status={ins.result} label={t.adminOps.status.inspection[ins.result]} />
              ) : (
                <span className="text-xs text-(--muted)">{p.noResultYet}</span>
              )}
            </div>

            {ins.inspector?.email && <p className="mt-0.5 break-all text-xs text-(--muted)">{ins.inspector.email}</p>}

            {ins.visitDate && (
              <p className="mt-2 text-sm text-(--muted)">{p.visit.replace("{date}", f.dateTime(ins.visitDate))}</p>
            )}

            {ins.findings && (
              <>
                <p className="mt-3 text-sm font-medium text-(--muted)">{p.findings}</p>
                <p className="whitespace-pre-line wrap-break-words text-sm text-(--ink)">{ins.findings}</p>
              </>
            )}

            {ins.correctionNote && (
              <>
                <p className="mt-3 text-sm font-medium text-(--muted)">{p.correction}</p>
                <p className="whitespace-pre-line wrap-break-words text-sm text-(--ink)">{ins.correctionNote}</p>
              </>
            )}

            {ins.reinspectionRequired && (
              <p className="mt-2 text-sm font-medium" style={{ color: "var(--warm)" }}>
                {p.reinspection}
              </p>
            )}

            {ins.image && ins.image.length > 0 && (
              <div className="mt-3">
                <PhotoGrid images={ins.image} alt={p.photoAlt} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export default InspectionsPanel