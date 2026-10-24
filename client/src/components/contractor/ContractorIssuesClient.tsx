"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getAllIssuesForContractor } from "@/store/slice/contractorSlice";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/auth-rules";
import { DISTRICTS } from "@/lib/districts";
import { ISSUE_CATEGORIES } from "@/components/issues/issueConfig";
import { ContractorIssuesView } from "./ContractorIssuesView";
import type { ContractorFilters } from "./ContractorIssueFilters";

type Params = Parameters<typeof getAllIssuesForContractor>[0];

function buildParams(page: number, f: ContractorFilters): Params {
  const p: Params = { page: String(page) };
  if (f.title) p.title = f.title;
  if (f.category) p.category = f.category;
  if (f.district) p.district = f.district;
  return p;
}

function buildQuery(page: number, f: ContractorFilters) {
  const q = new URLSearchParams({ page: String(page) });
  if (f.title) q.set("title", f.title);
  if (f.category) q.set("category", f.category);
  if (f.district) q.set("district", f.district);
  return q;
}

export function ContractorIssuesClient() {
  const { t } = useI18n();
  const generic = t.auth.errors.generic;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { allIssues } = useSelector((state: RootState) => state.contractor);

  /* ---------- URL theke filter parse ---------- */
  const rawPage = searchParams.get("page");
  const parsedPage = Number(rawPage);
  const page = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const title = (searchParams.get("title") ?? "").trim().slice(0, 100);
  const rawCategory = searchParams.get("category");
  const rawDistrict = searchParams.get("district");
  const category = ISSUE_CATEGORIES.find((c) => c === rawCategory) ?? "";
  const district = DISTRICTS.find((d) => d.value === rawDistrict)?.value ?? "";

  const filters: ContractorFilters = useMemo(() => ({ title, category, district }), [title, category, district]);
  const hasFilters = Boolean(title || category || district);

  const params = useMemo(() => buildParams(page, filters), [page, filters]);
  const key = JSON.stringify(params);

  /* ---------- fetch (protibar backend e jay) ---------- */
  const [tick, setTick] = useState(0);
  const [outcome, setOutcome] = useState<{ token: string; error: string | null } | null>(null);
  const token = `${key}#${tick}`;
  const settled = outcome?.token === token;
  const error = settled ? outcome.error : null;
  const loading = !settled;
  const loaded = settled && !error;

  useEffect(() => {
    let ignore = false;
    const request = dispatch(getAllIssuesForContractor(params));
    request
      .unwrap()
      .then(() => {
        if (!ignore) setOutcome({ token, error: null });
      })
      .catch((err: unknown) => {
        if (!ignore) setOutcome({ token, error: getErrorMessage(err, generic) });
      });
    return () => {
      ignore = true;
      request.abort();
    };
  }, [dispatch, generic, params, token]);

  const onRetry = () => setTick((n) => n + 1);

  /* ---------- URL normalize: ?page=1 default ---------- */
  useEffect(() => {
    if (rawPage === String(page)) return;
    const next = new URLSearchParams({ page: String(page) });
    searchParams.forEach((v, k) => {
      if (k !== "page") next.append(k, v);
    });
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [page, pathname, rawPage, router, searchParams]);

  /* ---------- page shesh er pore chole gele last page e nao ---------- */
  const totalPages = allIssues.pagination.totalPages;
  useEffect(() => {
    if (!loaded || totalPages < 1 || page <= totalPages) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(totalPages));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [loaded, page, pathname, router, searchParams, totalPages]);

  /* ---------- actions ---------- */
  const onPage = useCallback(
    (n: number) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("page", String(n));
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pathname, router, searchParams],
  );

  const onApply = (v: ContractorFilters) => {
    const clean = { ...v, title: v.title.trim() };
    // URL same hole router.push kichu kore na, tai nijei refetch kori
    if (JSON.stringify(buildParams(1, clean)) === key) {
      setTick((n) => n + 1);
      return;
    }
    router.push(`${pathname}?${buildQuery(1, clean).toString()}`, { scroll: false });
  };

  const onClear = () => {
    if (!hasFilters && page === 1) {
      setTick((n) => n + 1);
      return;
    }
    router.push(`${pathname}?page=1`, { scroll: false });
  };

  return (
    <ContractorIssuesView
      issues={loaded ? allIssues.issues : []}
      pagination={allIssues.pagination}
      loaded={loaded}
      loading={loading}
      error={error}
      hasFilters={hasFilters}
      filters={filters}
      onApply={onApply}
      onClear={onClear}
      onPage={onPage}
      onRetry={onRetry}
    />
  );
}