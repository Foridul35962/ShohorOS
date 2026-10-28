"use client"

import React, { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { AnimatePresence, motion, MotionConfig } from "motion/react"
import { ArrowRight, Bell, BellOff, CheckCheck, Loader2, Volume2, VolumeX } from "lucide-react"

import { getAllNotification, getUnReadNotificationCount, updateNotification } from "@/store/slice/notificationSlice"
import { AppDispatch, RootState } from "@/store/store"
import type { Notification } from "@/types/notificationTypes"
import { FormAlert } from "@/components/auth/AuthShell"
import { useI18n } from "@/lib/i18n/provider"
import {
    NOTIFICATIONS_ROUTE,
    NotificationItem,
    NotificationSkeleton,
    useNotificationActions,
    useNumberFormat,
} from "./notificationShared"
import socket from "@/socket"
import {
    getSoundEnabled,
    playNotificationSound,
    setSoundEnabled,
    setupSoundUnlock,
} from "@/components/notification/notificationSound"

const NotificationMenu = () => {
    const { t } = useI18n()
    const nf = useNumberFormat()
    const dispatch = useDispatch<AppDispatch>()
    const { allNotificationData, notificationLoading, unreadNotificationCount } = useSelector(
        (state: RootState) => state.notification
    )
    const { markRead, markAllRead, remove, deletingId, markingAll, actionError } = useNotificationActions()

    const [open, setOpen] = useState(false)
    const [soundOn, setSoundOn] = useState(true)
    const [ringKey, setRingKey] = useState(0)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const bellRef = useRef<HTMLButtonElement>(null)
    const soundOnRef = useRef(true)
    const panelId = useId()

    // Menu only shows the first page of notifications
    const pageSize = allNotificationData.pagination.limit || 10
    const items = allNotificationData.notifications.slice(0, pageSize)

    useEffect(() => {
        const init = async () => {
            try {
                await dispatch(getUnReadNotificationCount(null)).unwrap()
                if (allNotificationData.notifications.length === 0) {
                    await dispatch(getAllNotification({ page: 1 })).unwrap()
                }
            } catch {
                // silent: the menu is a secondary surface, the full page shows load errors
            }
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Sound preference + unlock audio on the first user interaction
    useEffect(() => {
        const enabled = getSoundEnabled()
        setSoundOn(enabled)
        soundOnRef.current = enabled
        return setupSoundUnlock()
    }, [])

    // Real-time: this menu lives in the header, so it handles new notifications on EVERY page
    useEffect(() => {
        const handleUpdateNotification = ({ notification }: { notification: Notification }) => {
            dispatch(updateNotification({ notification }))
            setRingKey((k) => k + 1)
            if (soundOnRef.current) playNotificationSound()
        }
        socket.on("updateNotification", handleUpdateNotification)
        return () => {
            socket.off("updateNotification", handleUpdateNotification)
        }
    }, [dispatch])

    // Refresh the badge every time the menu is opened
    useEffect(() => {
        if (open) dispatch(getUnReadNotificationCount(null))
    }, [open, dispatch])

    // Close on outside click / Escape
    useEffect(() => {
        if (!open) return
        const onClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false)
                bellRef.current?.focus()
            }
        }
        document.addEventListener("mousedown", onClick)
        document.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("mousedown", onClick)
            document.removeEventListener("keydown", onKey)
        }
    }, [open])

    const toggleSound = () => {
        const next = !soundOn
        setSoundOn(next)
        soundOnRef.current = next
        setSoundEnabled(next)
        if (next) playNotificationSound(true)
    }

    const badge = unreadNotificationCount > 99 ? `${nf.format(99)}+` : nf.format(unreadNotificationCount)
    const bellLabel =
        unreadNotificationCount > 0
            ? t.notifications.menu.bellWithCount.replace("{count}", nf.format(unreadNotificationCount))
            : t.notifications.menu.bell
    const soundLabel = soundOn ? t.notifications.menu.muteSound : t.notifications.menu.unmuteSound

    return (
        <MotionConfig reducedMotion="user">
            <div ref={wrapperRef} className="relative">
                {/* Bell button */}
                <button
                    ref={bellRef}
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    aria-label={bellLabel}
                    aria-expanded={open}
                    aria-controls={open ? panelId : undefined}
                    className={`focus-ring relative grid h-10 w-10 place-items-center rounded-full text-(--ink) transition-colors hover:bg-(--accent-soft) ${open ? "bg-(--accent-soft)" : ""
                        }`}
                >
                    <motion.span
                        key={`ring-${ringKey}`}
                        className="inline-flex"
                        style={{ transformOrigin: "50% 0%" }}
                        animate={ringKey > 0 ? { rotate: [0, -18, 16, -12, 10, -6, 3, 0] } : undefined}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                        <Bell size={20} strokeWidth={1.8} aria-hidden />
                    </motion.span>

                    {unreadNotificationCount > 0 && (
                        <motion.span
                            key={`badge-${unreadNotificationCount}`}
                            initial={{ scale: 0.4 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            aria-hidden
                            className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold leading-none"
                            style={{ background: "var(--warm)", color: "var(--bg)" }}
                        >
                            {badge}
                        </motion.span>
                    )}
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            id={panelId}
                            role="dialog"
                            aria-label={t.notifications.title}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="card fixed inset-x-3 top-16 z-50 flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:max-h-[85vh] sm:w-104"
                        >
                            {/* Header */}
                            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-(--line) px-4 py-3">
                                <div className="flex min-w-0 items-center gap-2">
                                    <h3 className="font-display text-base font-semibold text-(--ink)">
                                        {t.notifications.title}
                                    </h3>
                                    {unreadNotificationCount > 0 && (
                                        <span className="chip rounded-full bg-(--accent-soft) px-2 py-0.5 text-xs font-medium text-(--accent)">
                                            {t.notifications.menu.newCount.replace("{count}", nf.format(unreadNotificationCount))}
                                        </span>
                                    )}
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    {unreadNotificationCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={markAllRead}
                                            disabled={markingAll}
                                            className="focus-ring inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-(--accent) hover:bg-(--accent-soft) disabled:opacity-60"
                                        >
                                            {markingAll ? (
                                                <Loader2 size={14} className="animate-spin" aria-hidden />
                                            ) : (
                                                <CheckCheck size={14} aria-hidden />
                                            )}
                                            {t.notifications.markAllRead}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={toggleSound}
                                        title={soundLabel}
                                        aria-label={soundLabel}
                                        aria-pressed={soundOn}
                                        className="focus-ring grid h-8 w-8 place-items-center rounded-full text-(--muted) transition-colors hover:bg-(--accent-soft) hover:text-(--accent)"
                                    >
                                        {soundOn ? <Volume2 size={16} aria-hidden /> : <VolumeX size={16} aria-hidden />}
                                    </button>
                                </div>
                            </div>

                            {actionError && (
                                <div className="border-b border-(--line) px-4 py-2">
                                    <FormAlert message={actionError} />
                                </div>
                            )}

                            {/* List */}
                            <div className="max-h-80 overflow-y-auto sm:max-h-96">
                                {notificationLoading && items.length === 0 ? (
                                    <NotificationSkeleton rows={4} />
                                ) : items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                        <div className="mb-3 grid h-16 w-16 place-items-center rounded-full bg-(--accent-soft) text-(--accent)">
                                            <BellOff size={26} strokeWidth={1.8} aria-hidden />
                                        </div>
                                        <p className="font-display text-sm font-semibold text-(--ink)">
                                            {t.notifications.empty.allTitle}
                                        </p>
                                        <p className="mt-1 text-xs text-(--muted)">{t.notifications.empty.allText}</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-(--line)">
                                        {items.map((notification) => (
                                            <NotificationItem
                                                key={notification._id}
                                                notification={notification}
                                                onRead={markRead}
                                                onDelete={remove}
                                                deleting={deletingId === notification._id}
                                                onNavigate={() => setOpen(false)}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Footer */}
                            <Link
                                href={NOTIFICATIONS_ROUTE}
                                onClick={() => setOpen(false)}
                                className="focus-ring flex shrink-0 items-center justify-center gap-1.5 border-t border-(--line) py-3 text-sm font-medium text-(--accent) transition-colors hover:bg-(--accent-soft)"
                            >
                                {t.notifications.menu.viewAll}
                                <ArrowRight size={14} aria-hidden />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MotionConfig>
    )
}

export default NotificationMenu