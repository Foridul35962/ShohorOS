"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

type Props = { lat: number; lon: number };

export function IssueMap({ lat, lon }: Props) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const mod = await import("leaflet");
      const L = ("default" in mod ? mod.default : mod) as typeof import("leaflet");
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [lat, lon],
        zoom: 16,
        scrollWheelZoom: false, // page scroll atke jabe na
        dragging: !L.Browser.mobile, // mobile e ek angul e scroll korte dibe
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        html: `<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 43C17 43 3 28 3 17a14 14 0 1 1 28 0c0 11-14 26-14 26z" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/><circle cx="17" cy="17" r="5.5" fill="var(--accent-ink)"/></svg>`,
      });
      L.marker([lat, lon], { icon, keyboard: false, interactive: false }).addTo(map);

      setReady(true);
      cleanup = () => map.remove();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
      setReady(false);
    };
  }, [lat, lon]);

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-(--line)">
      <div
        ref={containerRef}
        role="application"
        aria-label={t.issueDetail.details.mapLabel}
        className="h-56 w-full bg-(--map) sm:h-72"
      />
      {!ready ? (
        <div className="absolute inset-0 grid animate-pulse place-items-center bg-(--map)">
          <Loader2 size={22} className="animate-spin text-(--muted)" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  );
}