'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, CheckCheck, AlertTriangle, RotateCw } from 'lucide-react'
import type { Notification } from '@prisma/client'
import { Modal } from '@/components/ui/Modal'
import { getMyNotificationsAction, markAllNotificationsReadAction } from '@/lib/actions/notifications'
import { markNotificationAsRead } from '@/actions/dashboard-actions'
import { NotificationRowContent, unreadRowBg } from './notification-shared'

type LoadStatus = 'loading' | 'error' | 'ready'

export function NotificationHistoryModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [reloadKey, setReloadKey] = useState(0)
  const [isPending, startTransition] = useTransition()

  // Fetch perezoso del historial: al abrir y en cada Reintentar (reloadKey).
  // El setState ocurre solo DESPUÉS del await (no sincrónico en el effect), y
  // 'loading' es el estado inicial/reseteado → spinner sin parpadeo de stale.
  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      const res = await getMyNotificationsAction()
      if (cancelled) return
      if (res.success && res.data) {
        setNotifications(res.data)
        setStatus('ready')
      } else {
        setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, reloadKey])

  const handleClose = () => {
    onClose()
    // Reset para que el próximo open arranque en loading, no en la lista vieja.
    setStatus('loading')
    setNotifications([])
  }

  const handleRetry = () => {
    setStatus('loading')
    setReloadKey((k) => k + 1)
  }

  const handleMarkAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(async () => {
      await markAllNotificationsReadAction()
      router.refresh()
    })
  }

  const handleRowClick = (notif: Notification) => {
    if (!notif.read) {
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
      startTransition(async () => {
        await markNotificationAsRead(notif.id)
        router.refresh()
      })
    }
    // Navegación imperativa tras marcar leída (la fila es un botón con efecto
    // colateral previo, no un <Link>); cierra y resetea antes de navegar.
    if (notif.actionUrl) {
      handleClose()
      router.push(notif.actionUrl)
    }
  }

  const hasUnread = notifications.some((n) => !n.read)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="xl"
      title="Notificaciones"
      description={
        status === 'ready' && notifications.length > 0
          ? `${notifications.length} en total`
          : undefined
      }
      footer={
        status === 'ready' && hasUnread ? (
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06] disabled:opacity-40"
          >
            <CheckCheck size={14} strokeWidth={1.5} />
            Marcar todas como leídas
          </button>
        ) : undefined
      }
    >
      {status === 'loading' && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" strokeWidth={1.5} />
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-400" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-zinc-400">No se pudieron cargar las notificaciones.</p>
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/[0.06]"
          >
            <RotateCw size={13} strokeWidth={1.5} />
            Reintentar
          </button>
        </div>
      )}

      {status === 'ready' && notifications.length === 0 && (
        <div className="flex flex-col items-center gap-2.5 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="h-5 w-5 text-emerald-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300">Todo al día ✓</p>
            <p className="mt-0.5 text-xs text-zinc-600">No tenés notificaciones</p>
          </div>
        </div>
      )}

      {status === 'ready' && notifications.length > 0 && (
        <div className="-m-6 flex flex-col divide-y divide-white/[0.05]">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              type="button"
              onClick={() => handleRowClick(notif)}
              className="relative flex w-full gap-3 px-6 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
              style={unreadRowBg(notif)}
            >
              <NotificationRowContent notif={notif} />
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
