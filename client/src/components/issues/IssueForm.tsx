"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  CheckCircle2,
  Droplets,
  FileText,
  Hash,
  ImagePlus,
  MapPin,
  Route,
  Signpost,
  Trash2,
  TrafficCone,
  TreePine,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import { useI18n } from "@/lib/i18n/provider";
import { clean, getErrorMessage } from "@/lib/auth-rules";
import { DISTRICTS } from "@/lib/districts";
import { FormAlert, SubmitButton } from "@/components/auth/AuthShell";
import { TextAreaField, TextField } from "@/components/auth/fields";
import { DistrictStatus, LocationPicker, PickedPoint } from "./LocationPicker";
import { ImageUploader } from "./ImageUploader";
import { createIssues } from "@/store/slice/issueSlice";
import { useRouter } from "next/navigation";

const CATEGORIES = ["ROAD", "DRAIN", "WATER", "ELEC", "WASTE", "BUILDING", "PARK", "TRAFFIC"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  ROAD: Route,
  DRAIN: Droplets,
  WATER: Droplets,
  ELEC: Zap,
  WASTE: Trash2,
  BUILDING: Building2,
  PARK: TreePine,
  TRAFFIC: TrafficCone,
};

type Values = {
  title: string;
  description: string;
  category: Category | "";
  address: { street: string; city: string; postalCode: string };
  location: { lat: string; lon: string };
};

function SectionHead({ icon: Icon, title, sub, id }: { icon: LucideIcon; title: string; sub?: string; id?: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-(--accent-soft) text-(--accent)">
        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 id={id} className="font-display text-lg font-semibold leading-snug">
          {title}
        </h2>
        {sub ? <p className="mt-0.5 text-sm leading-relaxed text-(--muted)">{sub}</p> : null}
      </div>
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <section className="card p-5 sm:p-7">{children}</section>;
}

export function IssueForm() {
  const { t, locale } = useI18n();
  const s = t.issues;
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth).user;
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      category: "",
      address: { street: "", city: "", postalCode: "" },
      location: { lat: "", lon: "" },
    },
  });

  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [districtStatus, setDistrictStatus] = useState<DistrictStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const e = s.errors;
  const districtValue = user?.district as string | undefined;
  const districtLabel = districtValue
    ? locale === "bn"
      ? (DISTRICTS.find((d) => d.value === districtValue)?.bn ?? districtValue)
      : districtValue
    : "";

  // lat/lon hidden-but-validated fields (map theke setValue hoy)
  register("location.lat", {
    validate: (v) => {
      if (!String(v ?? "").trim()) return e.locationRequired;
      const n = Number(v);
      return (Number.isFinite(n) && n >= -90 && n <= 90) || e.latRange;
    },
  });
  register("location.lon", {
    validate: (v) => {
      if (!String(v ?? "").trim()) return e.locationRequired;
      const n = Number(v);
      return (Number.isFinite(n) && n >= -180 && n <= 180) || e.lonRange;
    },
  });

  const lat = watch("location.lat");
  const lon = watch("location.lon");
  const titleLen = (watch("title") ?? "").length;
  const descLen = (watch("description") ?? "").length;
  const numLat = lat === "" ? null : Number(lat);
  const numLon = lon === "" ? null : Number(lon);

  const handlePick = (point: PickedPoint) => {
    setValue("location.lat", point.lat.toFixed(6), { shouldValidate: true });
    setValue("location.lon", point.lon.toFixed(6), { shouldValidate: true });
    setDistrictStatus(point.status);
    if (point.address) {
      if (point.address.street) setValue("address.street", point.address.street, { shouldValidate: true });
      if (point.address.city) setValue("address.city", point.address.city, { shouldValidate: true });
      if (point.address.postalCode) setValue("address.postalCode", point.address.postalCode, { shouldValidate: true });
    }
    if (serverError) setServerError(null);
  };

  const onSubmit = async (raw: Values) => {
    setServerError(null);
    if (images.length < 1) {
      setImageError(s.photos.required);
      return;
    }
    if (districtStatus === "outside") {
      setServerError(s.location.outside.replace("{district}", districtLabel));
      return;
    }

    const v = clean(raw);
    const fd = new FormData();
    fd.append("title", v.title);
    fd.append("description", v.description);
    fd.append("category", v.category);
    fd.append("address[street]", v.address.street);
    fd.append("address[city]", v.address.city);
    fd.append("address[postalCode]", v.address.postalCode);
    fd.append("location[lat]", String(Number(v.location.lat)));
    fd.append("location[lon]", String(Number(v.location.lon)));
    images.forEach((file) => fd.append("images", file));

    try {
      const res = await dispatch(createIssues(fd)).unwrap();
      const issueId: string = res.data.issue._id;
      setRedirecting(true);
      router.push(`/issues/${issueId}`);
    } catch (error) {
      setServerError(getErrorMessage(error, t.auth.errors.generic));
    }
  };

  const submit = (ev: React.FormEvent<HTMLFormElement>) => {
    if (images.length < 1) setImageError(s.photos.required);
    return handleSubmit(onSubmit)(ev);
  };

  const another = () => {
    reset();
    setImages([]);
    setImageError(null);
    setDistrictStatus("idle");
    setServerError(null);
    setDone(false);
    setFormKey((k) => k + 1);
  };

  if (done) {
    return (
      <div className="card mx-auto mt-6 max-w-md p-8 text-center" role="status">
        <span
          className="mx-auto grid h-16 w-16 place-items-center rounded-full text-(--ok)"
          style={{ background: "color-mix(in oklab, var(--ok) 16%, transparent)" }}
        >
          <CheckCircle2 size={28} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h1 className="font-display mt-4 text-xl font-semibold">{s.success.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-(--muted)">{s.success.text}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-primary focus-ring rounded-full px-7 py-3 text-sm">
            {s.success.cta}
          </Link>
          <button type="button" onClick={another} className="btn-ghost focus-ring rounded-full px-5 py-2.5 text-sm font-medium">
            {s.success.another}
          </button>
        </div>
      </div>
    );
  }

  const locError = errors.location?.lat?.message ?? errors.location?.lon?.message;

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1]">{s.title}</h1>
        <p className="mt-2 max-w-xl text-(--muted)">{s.sub}</p>
        <p className="chip mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 text-sm">
          <MapPin size={14} className="text-(--accent)" aria-hidden="true" />
          <span>{s.districtNote.replace("{district}", districtLabel)}</span>
        </p>
      </header>

      <form
        noValidate
        autoComplete="off"
        onChange={() => serverError && setServerError(null)}
        onSubmit={submit}
        className="space-y-6"
      >
        {/* 1. Details */}
        <Panel>
          <SectionHead icon={FileText} title={s.sections.details} sub={s.sections.detailsSub} />

          <fieldset className="mb-6">
            <legend className="mb-2 text-sm font-medium">{s.fields.category}</legend>
            <div role="radiogroup" aria-label={s.fields.category} className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICONS[c];
                return (
                  <label
                    key={c}
                    className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-(--line) bg-(--surface) px-3 py-3 text-sm transition-colors hover:border-(--accent) has-checked:border-(--accent) has-checked:bg-(--accent-soft) has-checked:text-(--accent) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-(--accent)"
                  >
                    <input
                      type="radio"
                      value={c}
                      className="sr-only"
                      {...register("category", { required: e.categoryRequired })}
                    />
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />
                    <span className="min-w-0 leading-snug">{s.categories[c]}</span>
                  </label>
                );
              })}
            </div>
            {errors.category?.message ? (
              <p role="alert" className="mt-2 text-sm text-(--warm)">
                {errors.category.message}
              </p>
            ) : null}
          </fieldset>

          <div className="space-y-5">
            <div>
              <TextField
                label={s.fields.title}
                icon={Type}
                placeholder={s.fields.titlePh}
                error={errors.title?.message}
                {...register("title", {
                  validate: (v) => {
                    const x = (v ?? "").trim();
                    if (!x) return e.titleRequired;
                    return x.length <= 200 || e.titleMax;
                  },
                })}
              />
              <p className="mt-1 text-right text-xs text-(--muted)" aria-live="polite">
                {s.counter.replace("{n}", new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(titleLen)).replace("{max}", new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(200))}
              </p>
            </div>

            <div>
              <TextAreaField
                label={s.fields.description}
                rows={6}
                placeholder={s.fields.descriptionPh}
                error={errors.description?.message}
                {...register("description", {
                  validate: (v) => {
                    const x = (v ?? "").trim();
                    if (!x) return e.descRequired;
                    return x.length <= 5000 || e.descMax;
                  },
                })}
              />
              <p className="mt-1 text-right text-xs text-(--muted)" aria-live="polite">
                {s.counter.replace("{n}", new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(descLen)).replace("{max}", new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(5000))}
              </p>
            </div>
          </div>
        </Panel>

        {/* 2. Location */}
        <Panel>
          <SectionHead icon={MapPin} title={s.sections.location} sub={s.sections.locationSub} />

          <LocationPicker
            key={`loc-${formKey}`}
            lat={numLat}
            lon={numLon}
            district={districtValue ?? ""}
            districtLabel={districtLabel}
            status={districtStatus}
            error={locError}
            onPick={handlePick}
          />

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                label={s.fields.street}
                icon={Signpost}
                error={errors.address?.street?.message}
                {...register("address.street", {
                  validate: (v) => !!(v ?? "").trim() || e.streetRequired,
                })}
              />
            </div>
            <TextField
              label={s.fields.city}
              icon={Building2}
              error={errors.address?.city?.message}
              {...register("address.city", {
                validate: (v) => !!(v ?? "").trim() || e.cityRequired,
              })}
            />
            <TextField
              label={s.fields.postalCode}
              icon={Hash}
              inputMode="numeric"
              error={errors.address?.postalCode?.message}
              {...register("address.postalCode", {
                validate: (v) => !!(v ?? "").trim() || e.postalRequired,
              })}
            />
          </div>
        </Panel>

        {/* 3. Photos */}
        <Panel>
          <SectionHead icon={ImagePlus} title={s.sections.photos} sub={s.photos.hint} />
          <ImageUploader
            key={`img-${formKey}`}
            files={images}
            error={imageError}
            onChange={(next: File[]) => {
              setImages(next);
              if (next.length > 0) setImageError(null);
            }}
          />
        </Panel>

        <FormAlert message={serverError} />
        <div className="mx-auto max-w-md">
          <SubmitButton loading={isSubmitting || redirecting}>
            {isSubmitting || redirecting ? s.actions.submitting : s.actions.submit}
          </SubmitButton>
        </div>
      </form>
    </>
  );
}