"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import axios from "axios";
import { AlertTriangle, Crosshair, Loader2, MapPin, Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export type DistrictStatus = "idle" | "checking" | "ok" | "outside" | "unknown";

export type PickedPoint = {
  lat: number;
  lon: number;
  address?: { street: string; city: string; postalCode: string };
  status: DistrictStatus;
};

type GeoProps = {
  formatted?: string;
  lat?: number;
  lon?: number;
  housenumber?: string;
  street?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  postcode?: string;
  county?: string;
  state_district?: string;
  district?: string;
  country_code?: string;
};
type GeoFeature = { properties: GeoProps };

const KEY = process.env.NEXT_PUBLIC_GEOAPI_KEY;
const BD_CENTER: [number, number] = [23.685, 90.3563];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Geoapify kokhono kokhono onno spelling dey (Chittagong, Comilla ...)
const ALIASES: Record<string, string[]> = {
  chattogram: ["chittagong"],
  cumilla: ["comilla"],
  barishal: ["barisal"],
  jashore: ["jessore"],
  bogura: ["bogra"],
  coxsbazar: ["coxbazar"],
  chapainawabganj: ["nawabganj"],
  netrokona: ["netrakona"],
  jhalakathi: ["jhalokati", "jhalokathi"],
  maulvibazar: ["moulvibazar"],
  narsingdi: ["narshingdi"],
};

function checkDistrict(p: GeoProps, district: string): DistrictStatus {
  if (p.country_code && p.country_code.toLowerCase() !== "bd") return "outside";
  const values = [p.state_district, p.county, p.city, p.district].filter(Boolean).map((v) => norm(v as string));
  if (!district || values.length === 0) return "unknown";
  const names = [district, ...(ALIASES[norm(district)] ?? [])].map(norm);
  return values.some((v) => names.some((n) => v.includes(n))) ? "ok" : "outside";
}

function toAddress(p: GeoProps) {
  const street = [p.housenumber, p.street].filter(Boolean).join(" ").trim() || p.suburb || "";
  const city = p.city || p.town || p.village || p.county || "";
  return { street, city, postalCode: p.postcode || "" };
}

type Props = {
  lat: number | null;
  lon: number | null;
  district: string;
  districtLabel: string;
  status: DistrictStatus;
  error?: string;
  onPick: (point: PickedPoint) => void;
};

export function LocationPicker({ lat, lon, district, districtLabel, status, error, onPick }: Props) {
  const { t, locale } = useI18n();
  const s = t.issues.location;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const flyRef = useRef(false);
  const reqRef = useRef(0);
  const skipSearchRef = useRef(false);
  const onPickRef = useRef(onPick);
  const districtRef = useRef(district);

  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    onPickRef.current = onPick;
    districtRef.current = district;
  });

  // pin set kore, reverse geocode kore, parent ke janay
  const resolve = useCallback(async (la: number, lo: number, fly: boolean) => {
    const id = ++reqRef.current;
    flyRef.current = fly;
    onPickRef.current({ lat: la, lon: lo, status: "checking" });
    try {
      const res = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${la}&lon=${lo}&apiKey=${KEY}`,
      );
      if (id !== reqRef.current) return;
      const p: GeoProps | undefined = res.data?.features?.[0]?.properties;
      if (!p) {
        onPickRef.current({ lat: la, lon: lo, status: "unknown" });
        return;
      }
      onPickRef.current({ lat: la, lon: lo, address: toAddress(p), status: checkDistrict(p, districtRef.current) });
    } catch {
      if (id === reqRef.current) onPickRef.current({ lat: la, lon: lo, status: "unknown" });
    }
  }, []);

  // map init (client only, dynamic import)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("leaflet");
      const L = ("default" in mod ? mod.default : mod) as typeof import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { center: BD_CENTER, zoom: 7 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      map.on("click", (ev) => resolve(ev.latlng.lat, ev.latlng.lng, false));

      leafletRef.current = L;
      mapRef.current = map;
      setReady(true);

      // user er district e map center kori
      if (districtRef.current) {
        axios
          .get(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
              `${districtRef.current}, Bangladesh`,
            )}&limit=1&apiKey=${KEY}`,
          )
          .then((r) => {
            const c: GeoProps | undefined = r.data?.features?.[0]?.properties;
            if (c?.lat != null && c?.lon != null && mapRef.current && !markerRef.current) {
              mapRef.current.setView([c.lat, c.lon], 11);
            }
          })
          .catch(() => undefined);
      }
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      setReady(false);
    };
  }, [resolve]);

  // marker sync
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map) return;

    if (lat == null || lon == null) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }
    if (!markerRef.current) {
      const icon = L.divIcon({
        className: "",
        iconSize: [34, 44],
        iconAnchor: [17, 44],
        html: `<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 43C17 43 3 28 3 17a14 14 0 1 1 28 0c0 11-14 26-14 26z" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/><circle cx="17" cy="17" r="5.5" fill="var(--accent-ink)"/></svg>`,
      });
      const m = L.marker([lat, lon], { draggable: true, icon, keyboard: false }).addTo(map);
      m.on("dragend", () => {
        const p = m.getLatLng();
        resolve(p.lat, p.lng, false);
      });
      markerRef.current = m;
    } else {
      markerRef.current.setLatLng([lat, lon]);
    }
    if (flyRef.current) {
      map.setView([lat, lon], Math.max(map.getZoom(), 16));
      flyRef.current = false;
    }
  }, [ready, lat, lon, resolve]);

  // debounced autocomplete
  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(false);
      try {
        const res = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&filter=countrycode:bd&limit=6&apiKey=${KEY}`,
          { signal: ctrl.signal },
        );
        setResults(res.data?.features ?? []);
        setOpen(true);
      } catch (err) {
        if (!axios.isCancel(err)) setSearchError(true);
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  const choose = (f: GeoFeature) => {
    const p = f.properties;
    if (p.lat == null || p.lon == null) return;
    const id = ++reqRef.current;
    void id;
    flyRef.current = true;
    skipSearchRef.current = true;
    setQuery(p.formatted ?? "");
    setOpen(false);
    setResults([]);
    onPick({ lat: p.lat, lon: p.lon, address: toAddress(p), status: checkDistrict(p, district) });
  };

  const locate = () => {
    setGeoError(null);
    if (!("geolocation" in navigator)) {
      setGeoError(s.geoUnsupported);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        void resolve(pos.coords.latitude, pos.coords.longitude, true);
      },
      () => {
        setLocating(false);
        setGeoError(s.geoDenied);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", { minimumFractionDigits: 5, maximumFractionDigits: 5 });

  return (
    <div>
      {/* search row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="issue-place-search" className="sr-only">
            {s.searchLabel}
          </label>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--muted)" />
          <input
            id="issue-place-search"
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="issue-place-results"
            aria-autocomplete="list"
            autoComplete="off"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            onKeyDown={(ev) => ev.key === "Escape" && setOpen(false)}
            placeholder={s.searchPh}
            className="input w-full py-3 pl-10 pr-10"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {searching ? (
              <Loader2 size={16} className="animate-spin text-(--muted)" aria-label={s.searching} />
            ) : query ? (
              <button
                type="button"
                aria-label={s.clearSearch}
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
                className="focus-ring grid h-6 w-6 place-items-center rounded-full text-(--muted) hover:text-(--ink)"
              >
                <X size={14} aria-hidden="true" />
              </button>
            ) : null}
          </span>

          {open && (results.length > 0 || searchError) ? (
            <ul
              id="issue-place-results"
              role="listbox"
              className="card absolute z-20 mt-2 max-h-72 w-full overflow-y-auto p-1.5"
              style={{ boxShadow: "var(--shadow)" }}
            >
              {searchError ? (
                <li className="px-3 py-2.5 text-sm text-(--warm)" role="alert">
                  {s.searchFailed}
                </li>
              ) : (
                results.map((f, i) => (
                  <li key={`${f.properties.formatted}-${i}`} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => choose(f)}
                      className="focus-ring flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm leading-relaxed hover:bg-(--accent-soft)"
                    >
                      <MapPin size={14} className="mt-1 shrink-0 text-(--accent)" aria-hidden="true" />
                      <span className="min-w-0 wrap-break-word">{f.properties.formatted}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          ) : null}
          {open && !searching && !searchError && results.length === 0 && query.trim().length >= 3 ? (
            <div className="card absolute z-20 mt-2 w-full px-3 py-2.5 text-sm text-(--muted)">{s.noResults}</div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="btn-ghost focus-ring inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
        >
          {locating ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Crosshair size={16} aria-hidden="true" />}
          {locating ? s.locating : s.useMyLocation}
        </button>
      </div>

      {geoError ? (
        <p role="alert" className="mt-2 text-sm text-(--warm)">
          {geoError}
        </p>
      ) : null}

      {/* map (isolate = leaflet z-index fixed header er upore jabe na) */}
      <div className="relative isolate mt-4 overflow-hidden rounded-2xl border border-(--line)">
        <div
          ref={containerRef}
          role="application"
          aria-label={s.mapLabel}
          className="h-72 w-full bg-(--map) sm:h-96"
        />
        {!ready ? (
          <div className="absolute inset-0 grid animate-pulse place-items-center bg-(--map)">
            <Loader2 size={22} className="animate-spin text-(--muted)" aria-hidden="true" />
          </div>
        ) : null}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-(--muted)">{s.pinHint}</p>

      {/* status */}
      <div className="mt-3 space-y-2" aria-live="polite">
        {lat != null && lon != null ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip inline-flex items-center gap-1.5 px-3 py-1 text-xs">
              <MapPin size={12} className="text-(--accent)" aria-hidden="true" />
              {s.lat}: {nf.format(lat)}
            </span>
            <span className="chip inline-flex items-center gap-1.5 px-3 py-1 text-xs">
              <MapPin size={12} className="text-(--accent)" aria-hidden="true" />
              {s.lon}: {nf.format(lon)}
            </span>
            {status === "checking" ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-(--muted)">
                <Loader2 size={12} className="animate-spin" aria-hidden="true" /> {s.detecting}
              </span>
            ) : null}
            {status === "ok" ? (
              <span className="rounded-full bg-(--accent-soft) px-3 py-1 text-xs font-medium text-(--accent)">
                {s.insideDistrict.replace("{district}", districtLabel)}
              </span>
            ) : null}
          </div>
        ) : null}

        {status === "outside" ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm leading-relaxed"
            style={{
              borderColor: "var(--warm)",
              color: "var(--warm)",
              background: "color-mix(in oklab, var(--warm) 10%, transparent)",
            }}
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{s.outside.replace("{district}", districtLabel)}</span>
          </p>
        ) : null}
        {status === "unknown" ? <p className="text-xs leading-relaxed text-(--muted)">{s.unknownDistrict.replace("{district}", districtLabel)}</p> : null}
        {error ? (
          <p role="alert" className="text-sm text-(--warm)">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}