"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getAllAuctions } from "@/store/slice/adminSlice";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/auth-rules";
import { ISSUE_CATEGORIES } from "@/components/issues/issueConfig";
import { AUCTION_STATUSES, type AuctionFilterValues } from "./AuctionFilters";
import { AuctionsView } from "./AuctionsView";

type Params = Parameters<typeof getAllAuctions>[0];

function buildParams(page: number, f: AuctionFilterValues): Params {
    const p: Params = { page: String(page) };
    if (f.category) p.category = f.category;
    if (f.status) p.status = f.status;
    // 💡 true ebong false duto state-i backend-e pathabe, undefined hole kichu pathabe na
    if (f.deadline !== undefined) p.deadline = f.deadline;
    return p;
}

function buildQuery(page: number, f: AuctionFilterValues) {
    const q = new URLSearchParams({ page: String(page) });
    if (f.category) q.set("category", f.category);
    if (f.status) q.set("status", f.status);
    // 💡 URL-e "true" athoba "false" value set korbe
    if (f.deadline !== undefined) q.set("deadline", String(f.deadline));
    return q;
}

export function AdminAuctionsClient() {
    const { t } = useI18n();
    const generic = t.auth.errors.generic;
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { allAuctions } = useSelector((state: RootState) => state.admin);

    /* ---------- URL theke filter parse ---------- */
    const rawPage = searchParams.get("page");
    const parsedPage = Number(rawPage);
    const page = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

    const rawCategory = searchParams.get("category");
    const rawStatus = searchParams.get("status");
    const rawDeadline = searchParams.get("deadline");

    const category = ISSUE_CATEGORIES.find((c) => c === rawCategory) ?? "";
    const status = AUCTION_STATUSES.find((s) => s === rawStatus) ?? "";

    // 💡 URL parse logic: "true" -> true, "false" -> false, otherwise -> undefined
    const deadline =
        rawDeadline === "true" ? true : rawDeadline === "false" ? false : undefined;

    const filters: AuctionFilterValues = useMemo(
        () => ({ category, status, deadline }),
        [category, status, deadline],
    );
    const hasFilters = Boolean(category || status || deadline !== undefined);

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
        const request = dispatch(getAllAuctions(params));
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
    const totalPages = allAuctions.pagination.totalPages;
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

    const onApply = (v: AuctionFilterValues) => {
        if (JSON.stringify(buildParams(1, v)) === key) {
            setTick((n) => n + 1);
            return;
        }
        router.push(`${pathname}?${buildQuery(1, v).toString()}`, { scroll: false });
    };

    const onClear = () => {
        if (!hasFilters && page === 1) {
            setTick((n) => n + 1);
            return;
        }
        router.push(`${pathname}?page=1`, { scroll: false });
    };

    return (
        <AuctionsView
            auctions={loaded ? allAuctions.auctions : []}
            pagination={allAuctions.pagination}
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