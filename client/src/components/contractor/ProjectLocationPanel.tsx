"use client"

import React, { useMemo } from "react"
import { ExternalLink, MapPin } from "lucide-react"

import { Panel, Row, SectionHead } from "@/components/admin/AdminUi"
import { IssueMap } from "@/components/issues/IssueMap"
import { useI18n } from "@/lib/i18n/provider"

interface Props {
  // GeoJSON order from backend: [lon, lat]
  location?: [number, number] | null
}

const isValid = (lat: number, lon: number) =>
  Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180

const ProjectLocationPanel = ({ location }: Props) => {
  const { t, locale } = useI18n()

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }),
    [locale]
  )

  if (!location || location.length < 2) return null
  const [lon, lat] = location
  if (!isValid(lat, lon)) return null

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`

  return (
    <Panel>
      <SectionHead icon={MapPin} title={t.adminOps.common.coordinates} />

      <div className="mt-4 overflow-hidden rounded-2xl border border-(--line)">
        <IssueMap lat={lat} lon={lon} />
      </div>

      <dl className="mt-4 divide-y divide-(--line)">
        <Row icon={MapPin} label={t.adminOps.common.coordinates}>
          <span className="wrap-break-words tabular-nums">
            {nf.format(lat)}, {nf.format(lon)}
          </span>
        </Row>
      </dl>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost focus-ring mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
      >
        <ExternalLink size={16} aria-hidden />
        {t.adminOps.common.openMap}
      </a>
    </Panel>
  )
}

export default ProjectLocationPanel