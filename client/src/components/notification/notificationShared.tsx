"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import {
    Ban,
    BadgeCheck,
    Bell,
    CalendarClock,
    Check,
    CheckCheck,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Coins,
    FilePlus2,
    FolderKanban,
    Gavel,
    HardHat,
    Info,
    Loader2,
    Megaphone,
    Play,
    RotateCcw,
    Search,
    ShieldX,
    Timer,
    Trash2,
    TrendingUp,
    Trophy,
    XCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { AppDispatch, RootState } from "@/store/store"
import {
    deleteNotification,
    deleteNotificationPrev,
    readAllNotification,
    readNotification,
} from "@/store/slice/notificationSlice"
import type { Notification } from "@/types/notificationTypes"
import { useI18n } from "@/lib/i18n/provider"
import { getErrorMessage } from "@/lib/auth-rules"
import type notificationEn from "@/lib/i18n/translations/notification-en"

export const NOTIFICATIONS_ROUTE = "/notifications"

/* -------------------------------------------------------------------------- */
/*  Type meta (only the types from NOTIFICATION_TYPES)                        */
/* -------------------------------------------------------------------------- */

export type NotificationTypeKey = keyof typeof notificationEn.types
type Tone = "accent" | "gold" | "danger" | "muted"

interface TypeMeta {
    icon: LucideIcon
    tone: Tone
}

const TONE_STYLE: Record<Tone, React.CSSProperties> = {
    accent: { background: "var(--accent-soft)", color: "var(--accent)" },
    gold: { background: "color-mix(in oklab, var(--ok) 16%, transparent)", color: "var(--ok)" },
    danger: { background: "color-mix(in oklab, var(--warm) 12%, transparent)", color: "var(--warm)" },
    muted: { background: "color-mix(in oklab, var(--muted) 14%, transparent)", color: "var(--muted)" },
}

const TYPE_META: Record<NotificationTypeKey, TypeMeta> = {
    // Issue
    ISSUE_SUBMITTED: { icon: FilePlus2, tone: "accent" },
    ISSUE_UNDER_REVIEW: { icon: Search, tone: "muted" },
    ISSUE_APPROVED: { icon: CheckCircle2, tone: "accent" },
    ISSUE_REJECTED: { icon: XCircle, tone: "danger" },
    ISSUE_PROJECT_CREATED: { icon: FolderKanban, tone: "accent" },
    ISSUE_RESOLVED: { icon: BadgeCheck, tone: "gold" },
    ISSUE_REVISION_REQUIRED: { icon: RotateCcw, tone: "danger" },
    // Project
    PROJECT_ASSIGNED: { icon: HardHat, tone: "accent" },
    PROJECT_STARTED: { icon: Play, tone: "accent" },
    PROJECT_PROGRESS_UPDATED: { icon: TrendingUp, tone: "accent" },
    PROJECT_COMPLETED: { icon: CheckCheck, tone: "gold" },
    PROJECT_CANCELLED: { icon: Ban, tone: "danger" },
    // Auction
    AUCTION_STARTED: { icon: Gavel, tone: "accent" },
    AUCTION_ENDING_SOON: { icon: Timer, tone: "muted" },
    AUCTION_ENDED: { icon: Gavel, tone: "muted" },
    AUCTION_BID_RECEIVED: { icon: Coins, tone: "accent" },
    AUCTION_WINNER_SELECTED: { icon: Trophy, tone: "gold" },
    AUCTION_WON: { icon: Trophy, tone: "gold" },
    AUCTION_LOST: { icon: XCircle, tone: "muted" },
    AUCTION_CANCELLED: { icon: Ban, tone: "danger" },
    // Inspection
    INSPECTION_ASSIGNED: { icon: ClipboardList, tone: "accent" },
    INSPECTION_SCHEDULED: { icon: CalendarClock, tone: "accent" },
    INSPECTION_PASSED: { icon: ClipboardCheck, tone: "gold" },
    INSPECTION_FAILED: { icon: ShieldX, tone: "danger" },
    // Account and general
    ACCOUNT_NOTICE: { icon: Info, tone: "muted" },
    SYSTEM_ANNOUNCEMENT: { icon: Megaphone, tone: "accent" },
}

const DEFAULT_META: TypeMeta = { icon: Bell, tone: "muted" }

const isTypeKey = (type?: string): type is NotificationTypeKey => !!type && type in TYPE_META

export const getTypeMeta = (type?: string): TypeMeta & { key: NotificationTypeKey | null } =>
    isTypeKey(type) ? { ...TYPE_META[type], key: type } : { ...DEFAULT_META, key: null }

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

// TODO: tomar route thik koro (moderator / inspector / project-staff route jante hobe)
export const getNotificationHref = (n: Notification, role?: string): string | null => {
    if (!n.relatedId) return null
    const r = role?.toLowerCase()
    const id = encodeURIComponent(n.relatedId)

    switch (n.relatedModel) {
        case "Issue":
            if (r === "city-admin") return `/admin/issues/${id}`
            if (r === "contractor") return `/contractor/issues/${id}`
            return `/issue/${id}`
        case "Project":
            return r === "city-admin" ? `/admin/projects/${id}` : null
        case "Auction":
            return r === "city-admin" ? `/admin/auctions/${id}` : null
        default:
            return null
    }
}

export const useNumberFormat = () => {
    const { locale } = useI18n()
    return useMemo(() => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en"), [locale])
}

export const useTimeAgo = () => {
    const { t, locale } = useI18n()
    return useMemo(() => {
        const tag = locale === "bn" ? "bn-BD" : "en-GB"
        const rtf = new Intl.RelativeTimeFormat(tag, { numeric: "auto", style: "narrow" })
        const dtf = new Intl.DateTimeFormat(tag, { dateStyle: "medium" })

        return (iso?: string): string => {
            if (!iso) return ""
            const date = new Date(iso)
            if (Number.isNaN(date.getTime())) return ""
            const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
            if (seconds < 60) return t.notifications.justNow
            const minutes = Math.floor(seconds / 60)
            if (minutes < 60) return rtf.format(-minutes, "minute")
            const hours = Math.floor(minutes / 60)
            if (hours < 24) return rtf.format(-hours, "hour")
            const days = Math.floor(hours / 24)
            if (days < 7) return rtf.format(-days, "day")
            return dtf.format(date)
        }
    }, [locale, t])
}

/* -------------------------------------------------------------------------- */
/*  Actions hook (used by both the menu and the page)                         */
/* -------------------------------------------------------------------------- */

export const useNotificationActions = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { t } = useI18n()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [markingAll, setMarkingAll] = useState(false)
    const [actionError, setActionError] = useState<string | null>(null)

    const fail = (error: unknown) => setActionError(getErrorMessage(error, t.auth.errors.generic))

    const markRead = async (notificationId: string) => {
        setActionError(null)
        try {
            await dispatch(readNotification({ notificationId })).unwrap()
        } catch (error) {
            fail(error)
        }
    }

    const markAllRead = async () => {
        setActionError(null)
        setMarkingAll(true)
        try {
            await dispatch(readAllNotification(null)).unwrap()
        } catch (error) {
            fail(error)
        } finally {
            setMarkingAll(false)
        }
    }

    const remove = async (notificationId: string) => {
        setActionError(null)
        setDeletingId(notificationId)
        try {
            await dispatch(deleteNotification({ notificationId })).unwrap()
            dispatch(deleteNotificationPrev(notificationId))
        } catch (error) {
            fail(error)
        } finally {
            setDeletingId(null)
        }
    }

    return {
        markRead,
        markAllRead,
        remove,
        deletingId,
        markingAll,
        actionError,
        clearActionError: () => setActionError(null),
    }
}

/* -------------------------------------------------------------------------- */
/*  UI                                                                        */
/* -------------------------------------------------------------------------- */

interface NotificationItemProps {
    notification: Notification
    onRead: (id: string) => void
    onDelete: (id: string) => void
    deleting?: boolean
    onNavigate?: () => void
}

const iconButton =
    "focus-ring grid h-9 w-9 place-items-center rounded-full text-(--muted) transition-colors"

export const NotificationItem = ({ notification, onRead, onDelete, deleting, onNavigate }: NotificationItemProps) => {
    const { t } = useI18n()
    const timeAgo = useTimeAgo()
    const { user } = useSelector((state: RootState) => state.auth)
    const { icon: Icon, tone, key } = getTypeMeta(notification.type)
    const unread = !notification.isReaded
    const href = getNotificationHref(notification, user?.role)

    const typeLabel = key ? t.notifications.types[key] : t.notifications.typeFallback
    const meta = [typeLabel, notification.sender?.name, timeAgo(notification.createdAt)].filter(Boolean).join(" · ")

    const handleOpen = () => {
        if (unread) onRead(notification._id)
        onNavigate?.()
    }

    const body = (
        <>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={TONE_STYLE[tone]}>
                <Icon size={20} strokeWidth={1.8} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <p
                        className={`font-display line-clamp-2 min-w-0 flex-1 wrap-break-word text-sm ${
                            unread ? "font-semibold text-(--ink)" : "font-medium text-(--muted)"
                        }`}
                    >
                        {notification.title}
                    </p>
                    {unread && (
                        <>
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-(--accent)" aria-hidden />
                            <span className="sr-only">{t.notifications.unreadLabel}</span>
                        </>
                    )}
                </div>
                <p className="mt-0.5 line-clamp-2 wrap-break-word text-sm text-(--muted)">{notification.message}</p>
                <p className="mt-1 wrap-break-word text-xs text-(--muted)">{meta}</p>
            </div>
        </>
    )

    const bodyClass = "focus-ring flex min-w-0 flex-1 items-start gap-3 rounded-2xl text-left"

    return (
        <li
            aria-busy={deleting || undefined}
            className={`group relative flex items-start gap-1 px-4 py-3.5 transition-colors hover:bg-(--accent-soft) ${
                unread ? "bg-[color-mix(in_oklab,var(--accent)_7%,transparent)]" : ""
            } ${deleting ? "pointer-events-none opacity-50" : ""}`}
        >
            {href ? (
                <Link href={href} onClick={handleOpen} className={bodyClass}>
                    {body}
                </Link>
            ) : (
                <button type="button" onClick={handleOpen} className={bodyClass}>
                    {body}
                </button>
            )}

            {/* Hover actions (always visible on touch screens, also on keyboard focus) */}
            <div className="flex shrink-0 flex-col gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-within:opacity-100">
                {unread && (
                    <button
                        type="button"
                        onClick={() => onRead(notification._id)}
                        title={t.notifications.markRead}
                        aria-label={t.notifications.markRead}
                        className={`${iconButton} hover:bg-(--accent-soft) hover:text-(--accent)`}
                    >
                        <Check size={16} aria-hidden />
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onDelete(notification._id)}
                    title={t.notifications.delete}
                    aria-label={t.notifications.delete}
                    className={`${iconButton} hover:text-(--warm)`}
                >
                    {deleting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Trash2 size={16} aria-hidden />}
                </button>
            </div>
        </li>
    )
}

export const NotificationSkeleton = ({ rows = 4 }: { rows?: number }) => {
    const { t } = useI18n()
    return (
        <ul className="divide-y divide-(--line)" aria-busy="true" aria-label={t.notifications.loading}>
            {Array.from({ length: rows }).map((_, i) => (
                <li
                    key={i}
                    className="flex animate-pulse items-start gap-3 px-4 py-3.5"
                    style={{ opacity: Math.max(0.35, 1 - i * 0.14) }}
                >
                    <div className="h-11 w-11 shrink-0 rounded-2xl bg-(--line)" />
                    <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 w-2/5 rounded bg-(--line)" />
                        <div className="h-3 w-4/5 rounded bg-(--line)" />
                        <div className="h-2.5 w-1/4 rounded bg-(--line)" />
                    </div>
                </li>
            ))}
        </ul>
    )
}