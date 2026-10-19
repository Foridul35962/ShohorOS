"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getAllIssues } from "@/store/slice/issueSlice";
import { useI18n } from "@/lib/i18n/provider";
import { getErrorMessage } from "@/lib/auth-rules";
import {
    canCreateIssue,
    canFilterMine,
    canFilterPriority,
    ISSUE_CATEGORIES,
    ISSUE_PRIORITIES,
    ISSUE_STATUSES,
    type AppliedFilters,
} from "./issueConfig";
import { IssuesView } from "./IssuesView";

type Params = Parameters<typeof getAllIssues>[0];

function buildParams(page: number, f: AppliedFilters, myIssue: boolean): Params {
    const p: Params = { page: String(page) };
    if (f.category) p.category = f.category;
    if (f.status) p.status = f.status;
    if (f.priority) p.priority = [f.priority];
    if (myIssue) p.myIssue = true;
    return p;
}

export function IssuesPageClient() {
    const { t } = useI18n();
    const generic = t.auth.errors.generic;
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { allIssue } = useSelector((state: RootState) => state.issue);
    const user = useSelector((state: RootState) => state.auth).user;
    const role = user?.role?.toLowerCase();
    const canPriority = canFilterPriority(role);
    const canMine = canFilterMine(role);
    const canReport = canCreateIssue(role);

    /* ---------- URL theke filter parse ---------- */
    const rawPage = searchParams.get("page");
    const parsedPage = Number(rawPage);
    const page = Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

    const rawCategory = searchParams.get("category");
    const rawStatus = searchParams.get("status");
    const rawPriority = Number(searchParams.get("priority"));

    const category = ISSUE_CATEGORIES.find((c) => c === rawCategory) ?? "";
    const status = ISSUE_STATUSES.find((s) => s === rawStatus) ?? "";
    const priority = canPriority ? (ISSUE_PRIORITIES.find((p) => p === rawPriority) ?? null) : null;

    // myIssue shudhu citizen / department-officer er jonno kaj kore, onno role e ignore
    const myIssue = canMine && searchParams.get("myIssue") === "true";

    const filters: AppliedFilters = useMemo(
        () => ({ category, status, priority }),
        [category, status, priority],
    );
    const hasFilters = Boolean(category || status || priority);

    const params = useMemo(() => buildParams(page, filters, myIssue), [page, filters, myIssue]);
    const key = JSON.stringify(params);

    /* ---------- fetch (cache nai, protibar backend e jay) ---------- */
    const [tick, setTick] = useState(0); // same filter e abar Search / Retry chaple baray
    const [outcome, setOutcome] = useState<{ token: string; error: string | null } | null>(null);

    const token = `${key}#${tick}`;
    const settled = outcome?.token === token;
    const error = settled ? outcome.error : null;
    const loading = !settled;
    const loaded = settled && !error;

    useEffect(() => {
        let ignore = false;
        const request = dispatch(getAllIssues(params));
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
    const totalPages = allIssue.pagination.totalPages;
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

    const onApply = (v: AppliedFilters) => {
        // URL same hole router.push kichu kore na, tai nijei refetch kori
        if (JSON.stringify(buildParams(1, v, myIssue)) === key) {
            setTick((n) => n + 1);
            return;
        }
        const next = new URLSearchParams({ page: "1" }); // notun search = page 1
        if (v.category) next.set("category", v.category);
        if (v.status) next.set("status", v.status);
        if (v.priority) next.set("priority", String(v.priority));
        if (myIssue) next.set("myIssue", "true"); // dashboard link er myIssue hariye jabe na
        router.push(`${pathname}?${next.toString()}`, { scroll: false });
    };

    const onClear = () => {
        if (!hasFilters && page === 1) {
            setTick((n) => n + 1);
            return;
        }
        router.push(`${pathname}?page=1${myIssue ? "&myIssue=true" : ""}`, { scroll: false });
    };

    return (
        <IssuesView
            issues={loaded ? allIssue.issues : []}
            pagination={allIssue.pagination}
            loaded={loaded}
            loading={loading}
            error={error}
            hasFilters={hasFilters}
            filters={filters}
            canPriority={canPriority}
            canReport={canReport}
            onApply={onApply}
            onClear={onClear}
            onPage={onPage}
            onRetry={onRetry} canMine={false}        />
    );
}