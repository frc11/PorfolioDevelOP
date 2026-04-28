'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import { markNotificationAsRead } from '@/actions/dashboard-actions'
import { markAllNotificationsReadAction } from '@/lib/actions/notifications'
import type { Notification } from '@prisma/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'ahora mismo'
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  return new Date(date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  SUCCESS: {
    icon: <CheckCircle2 size={13} />,
    dot: 'bg-emerald-500',
    iconClass: 'text-emerald-400',
    bg: 'rgba(34,197,94,0.06)',
  },
  WARNING: {
    icon: <AlertTriangle size={13} />,
    dot: 'bg-amber-500',
    iconClass: 'text-amber-400',
    bg: 'rgba(245,158,11,0.06)',
  },
  INFO: {
    icon: <Info size={13} />,
    dot: 'bg-cyan-500',
    iconClass: 'text-cyan-400',
    bg: 'rgba(6,182,212,0.06)',
  },
  ACTION_REQUIRED: {
    icon: <AlertCircle size={13} />,
    dot: 'bg-orange-500',
    iconClass: 'text-orange-400',
    bg: 'rgba(249,115,22,0.06)',
  },
} as const satisfies Record<string, { icon: React.ReactNode; dot: string; iconClass: string; bg: string }>

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.INFO
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NotificationCenter({
  initialNotifications,
}: {
  initialNotifications: Notification[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkOne = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    startTransition(async () => {
      await markNotificationAsRead(id)
      router.refresh()
    })
  }

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(async () => {
      await markAllNotificationsReadAction()
      router.refresh()
    })
  }

  const handleNotifClick = (notif: Notification) => {
    if (!notif.read) handleMarkOne(notif.id)
    if (notif.actionUrl) {
      setIsOpen(false)
      router.push(notif.actionUrl)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)
  const hasUnread = unreadCount > 0

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-zinc-800/40 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <Bell size={15} />

        <AnimatePresence>
          {hasUnread && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-cyan-500 px-0.5 ring-2 ring-zinc-950 shadow-[0_0_8px_rgba(6,182,212,0.7)]"
            >
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-60" />
              <span className="relative z-10 text-[9px] font-bold leading-none text-black">
                {badgeLabel}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, y: -8, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="absolute right-0 z-50 mt-3 flex w-80 origin-top-right flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 shadow-[0_16px_48px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">Notificaciones</h3>
                {hasUnread && (
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    {unreadCount} nuevas
                  </span>
                )}
              </div>
              {hasUnread && (
                <button
                  onClick={handleMarkAll}
                  disabled={isPending}
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-40"
                >
                  <CheckCheck size={11} />
                  Marcar todas
                </button>
              )}
            </div>

            {/* Notification list */}
            <div className="max-h-[340px] overflow-y-auto">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-2.5 py-10 text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <Check size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">Todo al día ✓</p>
                    <p className="mt-0.5 text-[10px] text-zinc-600">No hay notificaciones pendientes</p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col">
                  <AnimatePresence initial={false}>
                    {notifications.map((notif) => {
                      const cfg = getTypeConfig(notif.type)
                      return (
                        <motion.div
                          layout
                          key={notif.id}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          onClick={() => handleNotifClick(notif)}
                          className="relative flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                          style={!notif.read ? { background: cfg.bg } : undefined}
                        >
                          {/* Unread dot */}
                          {!notif.read && (
                            <span
                              className={`absolute left-1.5 top-4 h-1.5 w-1.5 rounded-full ${cfg.dot} shadow-[0_0_6px_currentColor]`}
                            />
                          )}

                          {/* Type icon */}
                          <div
                            className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.04] ${cfg.iconClass}`}
                          >
                            {cfg.icon}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={`text-xs font-semibold leading-snug ${
                                  !notif.read ? 'text-zinc-100' : 'text-zinc-400'
                                }`}
                              >
                                {notif.title}
                              </p>
                              <span className="flex-shrink-0 text-[10px] text-zinc-600">
                                {timeAgo(notif.createdAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
                              {notif.message}
                            </p>
                            {notif.actionUrl && (
                              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                                Ir al enlace →
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 transition-colors hover:text-cyan-400"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              Ver todas las notificaciones
              <ChevronRight size={11} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
