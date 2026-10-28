"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, MotionConfig } from "motion/react"
import { AlertTriangle, BellOff, CheckCheck, Loader2, RotateCcw } from "lucide-react"

import { getAllNotification, getUnReadNotificationCount } from "@/store/slice/notificationSlice"
import { AppDispatch, RootState } from "@/store/store"
import type { Notification } from "@/types/notificationTypes"
import { AdminPageShell } from "@/components/admin/AdminUi"
import { FormAlert } from "@/components/auth/AuthShell"
import { getErrorMessage } from "@/lib/auth-rules"
import { useI18n } from "@/lib/i18n/provider"
import { NotificationItem, NotificationSkeleton, useNotificationActions, useNumberFormat } from "./notificationShared"

type Filter = "all" | "unread"
type GroupName = "today" | "yesterday" | "earlier"
const GROUP_ORDER: GroupName[] = ["today", "yesterday", "earlier"]

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

const groupOf = (iso?: string): GroupName => {
    if (!iso) return "earlier"
    const dayDiff = Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / 86400000)
    if (dayDiff <= 0) return "today"
    if (dayDiff === 1) return "yesterday"
    return "earlier"
}

const NotificationsView = () => {
    const { t } = useI18n()
    const nf = useNumberFormat()
    const dispatch = useDispatch<AppDispatch>()
    const { allNotificationData, notificationLoading, unreadNotificationCount } = useSelector(
        (state: RootState) => state.notification
    )
    const { notifications, pagination } = allNotificationData
    const { markRead, markAllRead, remove, deletingId, markingAll, actionError } = useNotificationActions()

    const [filter, setFilter] = useState<Filter>("all")
    const [initialized, setInitialized] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)

    const sentinelRef = useRef<HTMLDivElement | null>(null)
    const fetchingRef = useRef(false)

    const loadPage = useCallback(
        async (page: number) => {
            if (fetchingRef.current) return
            fetchingRef.current = true
            setLoadError(null)
            try {
                await dispatch(getAllNotification({ page })).unwrap()
            } catch (error) {
                setLoadError(getErrorMessage(error, t.auth.errors.generic))
            } finally {
                fetchingRef.current = false
            }
        },
        [dispatch, t]
    )

    // First load
    useEffect(() => {
        const init = async () => {
            dispatch(getUnReadNotificationCount(null))
            if (notifications.length === 0) {
                await loadPage(1)
            }
            setInitialized(true)
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Infinite scroll
    useEffect(() => {
        const el = sentinelRef.current
        if (!el || !initialized || !pagination.hasNextPage || notificationLoading || loadError) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadPage(pagination.currentPage + 1)
            },
            { rootMargin: "200px" }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [
        initialized,
        pagination.hasNextPage,
        pagination.currentPage,
        notifications.length,
        notificationLoading,
        loadError,
        filter,
        loadPage,
    ])

    // NOTE: the socket listener + sound live in NotificationMenu (header), so this page does not
    // add a second one (that would play the sound twice).

    const visible = filter === "unread" ? notifications.filter((n) => !n.isReaded) : notifications
    const groups = GROUP_ORDER.map((name) => ({
        name,
        items: visible.filter((n) => groupOf(n.createdAt) === name),
    })).filter((group) => group.items.length > 0)

    const loadingMore = notificationLoading && notifications.length > 0
    const firstLoadFailed = !!loadError && notifications.length === 0

    const subtitle =
        unreadNotificationCount === 0
            ? t.notifications.subtitleCaughtUp
            : unreadNotificationCount === 1
              ? t.notifications.subtitleUnreadOne
              : t.notifications.subtitleUnreadMany.replace("{count}", nf.format(unreadNotificationCount))

    const tabs: { key: Filter; label: string; count: number }[] = [
        { key: "all", label: t.notifications.filters.all, count: pagination.totalNotifications },
        { key: "unread", label: t.notifications.filters.unread, count: unreadNotificationCount },
    ]

    return (
        <AdminPageShell>
            <MotionConfig reducedMotion="user">
                <div className="mx-auto max-w-3xl space-y-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.1] text-(--ink)">
                                {t.notifications.title}
                            </h1>
                            <p className="mt-2 max-w-xl text-(--muted)" aria-live="polite">
                                {subtitle}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={markAllRead}
                            disabled={markingAll || unreadNotificationCount === 0}
                            className="btn-ghost focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {markingAll ? (
                                <Loader2 size={16} className="animate-spin" aria-hidden />
                            ) : (
                                <CheckCheck size={16} aria-hidden />
                            )}
                            {t.notifications.markAllRead}
                        </button>
                    </div>

                    {actionError && <FormAlert message={actionError} />}

                    {/* Filter tabs */}
                    <div
                        role="group"
                        aria-label={t.notifications.filterLabel}
                        className="inline-flex gap-1 rounded-full border border-(--line) bg-(--surface) p-1"
                    >
                        {tabs.map((tab) => {
                            const active = filter === tab.key
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setFilter(tab.key)}
                                    aria-pressed={active}
                                    className={`focus-ring inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                                        active
                                            ? "bg-(--accent) text-(--accent-ink)"
                                            : "text-(--muted) hover:text-(--ink)"
                                    }`}
                                >
                                    {tab.label}
                                    <span
                                        className={`rounded-full px-1.5 text-xs ${
                                            active ? "bg-[color-mix(in_oklab,var(--accent-ink)_20%,transparent)]" : "bg-(--accent-soft) text-(--accent)"
                                        }`}
                                    >
                                        {nf.format(tab.count)}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Content */}
                    {!initialized ? (
                        <div className="card overflow-hidden">
                            <NotificationSkeleton rows={6} />
                        </div>
                    ) : firstLoadFailed ? (
                        <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center" role="alert">
                            <div
                                className="mb-4 grid h-16 w-16 place-items-center rounded-full"
                                style={{
                                    background: "color-mix(in oklab, var(--warm) 12%, transparent)",
                                    color: "var(--warm)",
                                }}
                            >
                                <AlertTriangle size={26} strokeWidth={1.8} aria-hidden />
                            </div>
                            <p className="font-display text-lg font-semibold text-(--ink)">{t.notifications.error.title}</p>
                            <p className="mt-1 wrap-break-word text-sm text-(--muted)">{loadError}</p>
                            <button
                                type="button"
                                onClick={() => loadPage(1)}
                                className="btn-primary focus-ring mt-5 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
                            >
                                <RotateCcw size={14} aria-hidden />
                                {t.notifications.error.retry}
                            </button>
                        </div>
                    ) : groups.length === 0 && !pagination.hasNextPage ? (
                        <div className="card mx-auto flex max-w-md flex-col items-center p-8 text-center">
                            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
                                <BellOff size={26} strokeWidth={1.8} aria-hidden />
                            </div>
                            <p className="font-display text-lg font-semibold text-(--ink)">
                                {filter === "unread" ? t.notifications.empty.unreadTitle : t.notifications.empty.allTitle}
                            </p>
                            <p className="mt-1 text-sm text-(--muted)">
                                {filter === "unread" ? t.notifications.empty.unreadText : t.notifications.empty.allText}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groups.map((group) => (
                                <motion.section
                                    key={group.name}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                >
                                    <h2 className="mb-2 px-1 text-sm font-medium text-(--muted)">
                                        {t.notifications.groups[group.name]}
                                    </h2>
                                    <div className="card overflow-hidden">
                                        <ul className="divide-y divide-(--line)">
                                            {group.items.map((notification: Notification) => (
                                                <NotificationItem
                                                    key={notification._id}
                                                    notification={notification}
                                                    onRead={markRead}
                                                    onDelete={remove}
                                                    deleting={deletingId === notification._id}
                                                />
                                            ))}
                                        </ul>
                                    </div>
                                </motion.section>
                            ))}

                            {/* Scroll sentinel */}
                            {pagination.hasNextPage && <div ref={sentinelRef} className="h-1" aria-hidden />}

                            {loadingMore && (
                                <div
                                    className="flex items-center justify-center gap-2 py-4 text-sm text-(--muted)"
                                    role="status"
                                >
                                    <Loader2 size={18} className="animate-spin text-(--accent)" aria-hidden />
                                    {t.notifications.loadingMore}
                                </div>
                            )}

                            {loadError && notifications.length > 0 && (
                                <div className="flex flex-col items-center gap-3 py-4" role="alert">
                                    <p className="text-sm text-(--muted)">{t.notifications.loadMoreFailed}</p>
                                    <button
                                        type="button"
                                        onClick={() => loadPage(pagination.currentPage + 1)}
                                        className="btn-ghost focus-ring inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                                    >
                                        <RotateCcw size={14} aria-hidden />
                                        {t.notifications.error.retry}
                                    </button>
                                </div>
                            )}

                            {!pagination.hasNextPage && notifications.length > 0 && (
                                <p className="py-4 text-center text-sm text-(--muted)">{t.notifications.endReached}</p>
                            )}
                        </div>
                    )}
                </div>
            </MotionConfig>
        </AdminPageShell>
    )
}

export default NotificationsView