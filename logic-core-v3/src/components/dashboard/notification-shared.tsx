'use client'

import { CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import type { Notification } from '@prisma/client'

// Vocabulario visual compartido entre el dropdown de la campanita
// (NotificationCenter) y el modal de historial completo
// (NotificationHistoryModal). Extraído para no duplicar la fila ni el config
// de tipos en dos lugares (regla anti-vibecode).

// ─── Time helper ────────────────────────────────────────────────────────────

export function timeAgo(date: Date): string {
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

// ─── Type config ────────────────────────────────────────────────────────────

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

export function getTypeConfig(type: string) {
  return TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.INFO
}

/** Fondo de la fila para notificaciones no leídas (tinte según tipo). */
export function unreadRowBg(notif: Notification): { background: string } | undefined {
  return notif.read ? undefined : { background: getTypeConfig(notif.type).bg }
}

// ─── Row content ──────────────────────────────────────────────────────────────
// Interior de una fila (dot de no-leída + icono de tipo + título/mensaje/fecha
// + "Ir al enlace"). NO incluye el contenedor clickeable ni el fondo: cada
// consumidor provee su propio wrapper `position: relative` (el dot es absolute).

export function NotificationRowContent({ notif }: { notif: Notification }) {
  const cfg = getTypeConfig(notif.type)

  return (
    <>
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
          <span className="flex-shrink-0 text-[10px] text-zinc-600">{timeAgo(notif.createdAt)}</span>
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
    </>
  )
}
