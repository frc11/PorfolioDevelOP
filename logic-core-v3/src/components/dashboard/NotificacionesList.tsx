'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCheck,
  Bell,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react'
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/lib/actions/notifications'
import type { Notification } from '@prisma/client'
import Link from 'next/link'

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
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function exactDate(date: Date): string {
  return new Date(date).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Day grouping ──────────────────────────────────────────────────────────────

interface DayGroup {
  label: string
  items: Notification[]
}

function groupByDay(items: Notification[]): DayGroup[] {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - 7)

  const todayItems = items.filter((n) => new Date(n.createdAt) >= todayStart)
  const yesterdayItems = items.filter(
    (n) => new Date(n.createdAt) >= yesterdayStart && new Date(n.createdAt) < todayStart,
  )
  const weekItems = items.filter(
    (n) => new Date(n.createdAt) >= weekStart && new Date(n.createdAt) < yesterdayStart,
  )
  const olderItems = items.filter((n) => new Date(n.createdAt) < weekStart)

  const groups: DayGroup[] = []
  if (todayItems.length) groups.push({ label: 'Hoy', items: todayItems })
  if (yesterdayItems.length) groups.push({ label: 'Ayer', items: yesterdayItems })
  if (weekItems.length) groups.push({ label: 'Esta semana', items: weekItems })
  if (olderItems.length) groups.push({ label: 'Anteriores', items: olderItems })
  return groups
}

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  SUCCESS: {
    icon: <CheckCircle2 size={16} />,
    iconClass: 'text-emerald-400',
    bg: 'rgba(34,197,94,0.07)',
    border: 'rgba(34,197,94,0.2)',
    dot: 'bg-emerald-500',
    label: 'Éxito',
  },
  WARNING: {
    icon: <AlertTriangle size={16} />,
    iconClass: 'text-amber-400',
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.2)',
    dot: 'bg-amber-500',
    label: 'Advertencia',
  },
  INFO: {
    icon: <Info size={16} />,
    iconClass: 'text-cyan-400',
    bg: 'rgba(6,182,212,0.07)',
    border: 'rgba(6,182,212,0.2)',
    dot: 'bg-cyan-500',
    label: 'Info',
  },
  ACTION_REQUIRED: {
    icon: <AlertCircle size={16} />,
    iconClass: 'text-orange-400',
    bg: 'rgba(249,115,22,0.07)',
    border: 'rgba(249,115,22,0.2)',
    dot: 'bg-orange-500',
    label: 'Acción',
  },
} as const satisfies Record<string, {
  icon: React.ReactNode
  iconClass: string
  bg: string
  border: string
  dot: string
  label: string
}>

function getCfg(type: string) {
  return TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.INFO
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'unread', label: 'No leídas' },
] as const

const PAGE_SIZE = 10

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  notifications: Notification[]
  currentFilter: 'all' | 'unread'
  unreadCount: number
}

export function NotificacionesList({ notifications, currentFilter, unreadCount }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(notifications)
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1)

  const handleMarkOne = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    startTransition(async () => {
      await markNotificationReadAction(id)
      router.refresh()
    })
  }

  const handleMarkAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(async () => {
      await markAllNotificationsReadAction()
      router.refresh()
    })
  }

  const handleNotifClick = (notif: Notification) => {
    if (!notif.read) handleMarkOne(notif.id)
    if (notif.actionUrl) router.push(notif.actionUrl)
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pagedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const groups = groupByDay(pagedItems)

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs + actions row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key === 'unread' ? '?filter=unread' : '/dashboard/notificaciones'}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                currentFilter === tab.key
                  ? 'bg-white/[0.08] text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {tab.key === 'unread' && unreadCount > 0 && (
                <span className="rounded-full bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-40"
          >
            <CheckCheck size={13} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4 rounded-2xl py-20 text-center"
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10"
          >
            {currentFilter === 'unread' ? (
              <Check size={24} className="text-emerald-400" />
            ) : (
              <Bell size={22} className="text-zinc-600" />
            )}
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-zinc-300">
              {currentFilter === 'unread' ? 'Todo al día ✓' : 'Sin notificaciones todavía'}
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              {currentFilter === 'unread'
                ? 'No tenés notificaciones sin leer'
                : 'Acá aparecerán actualizaciones de tu proyecto'}
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Grouped list */}
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <div key={group.label} className="flex flex-col gap-2">
                {/* Day label */}
                <div className="flex items-center gap-3 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    {group.label}
                  </span>
                  <div className="flex-1 border-t border-white/[0.04]" />
                </div>

                {/* Notification cards */}
                <div className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {group.items.map((notif, i) => {
                      const cfg = getCfg(notif.type)
                      return (
                        <motion.div
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.25, delay: i < 6 ? i * 0.04 : 0 }}
                          onClick={() => handleNotifClick(notif)}
                          className="group relative flex cursor-pointer items-start gap-4 overflow-hidden rounded-xl px-4 py-4 transition-all hover:brightness-110"
                          style={{
                            border: `1px solid ${notif.read ? 'rgba(255,255,255,0.06)' : cfg.border}`,
                            background: notif.read ? 'rgba(255,255,255,0.03)' : cfg.bg,
                          }}
                        >
                          {/* Unread left bar */}
                          {!notif.read && (
                            <span
                              className={`absolute left-0 top-0 h-full w-0.5 rounded-l-xl ${cfg.dot}`}
                            />
                          )}

                          {/* Icon */}
                          <div
                            className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ${cfg.iconClass}`}
                          >
                            {cfg.icon}
                          </div>

                          {/* Body */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p
                                className={`text-sm font-semibold leading-snug ${
                                  notif.read ? 'text-zinc-400' : 'text-zinc-100'
                                }`}
                              >
                                {notif.title}
                              </p>
                              <span
                                className="flex-shrink-0 cursor-default text-xs text-zinc-600"
                                title={exactDate(notif.createdAt)}
                              >
                                {timeAgo(notif.createdAt)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                              {notif.message}
                            </p>
                            <div className="mt-2.5 flex items-center gap-4">
                              {!notif.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkOne(notif.id)
                                  }}
                                  disabled={isPending}
                                  className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${cfg.iconClass} opacity-70 transition-opacity hover:opacity-100 disabled:opacity-30`}
                                >
                                  <CheckCheck size={11} />
                                  Marcar leída
                                </button>
                              )}
                              {notif.actionUrl && (
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 transition-colors group-hover:text-zinc-300">
                                  Ir al enlace →
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-zinc-600">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, items.length)} de{' '}
                {items.length} notificaciones
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300 disabled:opacity-30"
                >
                  <ChevronLeft size={13} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                      p === page
                        ? 'border border-cyan-500/30 bg-cyan-500/20 text-cyan-400'
                        : 'border border-white/[0.06] bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-300 disabled:opacity-30"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
