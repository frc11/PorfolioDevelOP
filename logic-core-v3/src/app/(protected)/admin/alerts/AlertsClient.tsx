'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Inbox,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button, EmptyState, StatCard } from '@/components/ui'
import { acknowledgeAlert, resolveAlert } from '@/modules/chatbot/server/admin/manageAlerts'
import type { listAlerts } from '@/modules/chatbot/server/admin/manageAlerts'

type AlertRow = Awaited<ReturnType<typeof listAlerts>>[number]

interface AlertsClientProps {
  initialAlerts: AlertRow[]
}

const COLUMNS = [
  { id: 'PENDING', label: 'Pendientes', icon: Inbox, colorClass: 'text-amber-400' },
  { id: 'ACKNOWLEDGED', label: 'Vistas', icon: Eye, colorClass: 'text-cyan-400' },
  { id: 'RESOLVED', label: 'Resueltas', icon: CheckCircle, colorClass: 'text-emerald-400' },
] as const

type ColumnId = 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED'

export function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const pendingCritical = alerts.filter(
    (a) => a.status === 'PENDING' && a.severity === 'CRITICAL',
  ).length
  const totalPending = alerts.filter((a) => a.status === 'PENDING').length
  const resolvedThisWeek = alerts.filter(
    (a) =>
      a.status === 'RESOLVED' && a.resolvedAt && new Date(a.resolvedAt) >= oneWeekAgo,
  ).length

  const resolvedWithTime = alerts.filter((a) => a.status === 'RESOLVED' && a.resolvedAt)
  const avgResolutionMin =
    resolvedWithTime.length > 0
      ? Math.round(
          resolvedWithTime.reduce((acc, a) => {
            return (
              acc + (new Date(a.resolvedAt!).getTime() - new Date(a.createdAt).getTime()) / 60000
            )
          }, 0) / resolvedWithTime.length,
        )
      : 0

  const grouped: Record<ColumnId, AlertRow[]> = {
    PENDING: alerts.filter((a) => {
      if (a.status !== 'PENDING') return false
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false
      return true
    }),
    ACKNOWLEDGED: alerts.filter((a) => {
      if (a.status !== 'ACKNOWLEDGED') return false
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false
      return true
    }),
    RESOLVED: alerts.filter((a) => {
      if (a.status !== 'RESOLVED') return false
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false
      return true
    }),
  }

  async function handleAck(id: string) {
    setPendingAction(`${id}:ack`)
    try {
      const promise = acknowledgeAlert(id)
      toast.promise(promise, {
        loading: 'Marcando como vista...',
        success: 'Alerta marcada como vista',
        error: 'Error',
      })
      await promise
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: new Date() } : a,
        ),
      )
    } finally {
      setPendingAction(null)
    }
  }

  async function handleResolve(id: string) {
    setPendingAction(`${id}:resolve`)
    try {
      const promise = resolveAlert(id)
      toast.promise(promise, {
        loading: 'Resolviendo...',
        success: 'Alerta resuelta',
        error: 'Error',
      })
      await promise
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: 'RESOLVED', resolvedAt: new Date() } : a,
        ),
      )
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Críticas pendientes"
          value={pendingCritical}
          icon={AlertTriangle}
          accent={pendingCritical > 0 ? 'red' : 'zinc'}
        />
        <StatCard
          label="Totales pendientes"
          value={totalPending}
          icon={Inbox}
          accent="amber"
        />
        <StatCard
          label="Resueltas esta semana"
          value={resolvedThisWeek}
          icon={CheckCircle}
          accent="emerald"
        />
        <StatCard
          label="Tiempo prom. resolución"
          value={avgResolutionMin > 0 ? `${avgResolutionMin}m` : '—'}
          icon={Clock}
          accent="cyan"
          subtitle={avgResolutionMin > 0 ? 'minutos' : 'sin datos'}
        />
      </div>

      {/* Severity filter */}
      <div className="flex items-center gap-2">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-600 mr-1">Severidad</p>
        {(['all', 'CRITICAL', 'HIGH', 'WARNING', 'INFO'] as const).map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setSeverityFilter(sev)}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors ${
              severityFilter === sev
                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {sev === 'all' ? 'Todas' : sev === 'CRITICAL' ? 'Crítica' : sev === 'HIGH' ? 'Alta' : sev === 'WARNING' ? 'Warning' : 'Info'}
          </button>
        ))}
      </div>

      {/* Triage columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const items = grouped[col.id]
          const Icon = col.icon

          return (
            <div
              key={col.id}
              className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${col.colorClass}`} strokeWidth={1.5} />
                  <p className="text-sm font-medium text-zinc-200">{col.label}</p>
                </div>
                <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-500">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="py-10 text-center text-sm italic text-zinc-600">
                    {col.id === 'PENDING' ? 'Todo OK 🎉' : 'Vacío'}
                  </p>
                ) : (
                  items.map((alert) => (
                    <motion.div
                      key={alert.id}
                      layout
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-3"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <SeverityBadge severity={alert.severity} />
                        <span className="text-[10px] text-zinc-600 shrink-0">
                          {new Date(alert.createdAt).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </span>
                      </div>

                      <p className="mb-1 line-clamp-2 text-sm text-zinc-200">{alert.title}</p>
                      <p className="mb-3 line-clamp-2 text-xs text-zinc-500">
                        {alert.description}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/admin/chatbots/${alert.botConfig.id}?tab=overview`}
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                        >
                          Ver bot
                          <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                        </Link>

                        <div className="flex gap-1.5">
                          {alert.status === 'PENDING' && (
                            <Button
                              type="button"
                              onClick={() => void handleAck(alert.id)}
                              variant="secondary"
                              size="sm"
                              loading={pendingAction === `${alert.id}:ack`}
                              icon={<Eye className="h-3 w-3" strokeWidth={1.5} />}
                            >
                              Visto
                            </Button>
                          )}
                          {(alert.status === 'PENDING' || alert.status === 'ACKNOWLEDGED') && (
                            <Button
                              type="button"
                              onClick={() => void handleResolve(alert.id)}
                              variant="secondary"
                              size="sm"
                              loading={pendingAction === `${alert.id}:resolve`}
                              className="border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                              icon={<CheckCircle className="h-3 w-3" strokeWidth={1.5} />}
                            >
                              Resolver
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {alerts.length === 0 && (
        <EmptyState
          icon={CheckCircle}
          title="Sin alertas"
          description="Todo está funcionando correctamente"
        />
      )}
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { label: string; color: string }> = {
    CRITICAL: { label: 'Crítica', color: 'text-red-300 bg-red-500/15 border-red-400/30' },
    HIGH: { label: 'Alta', color: 'text-orange-300 bg-orange-500/15 border-orange-400/30' },
    WARNING: { label: 'Warning', color: 'text-amber-300 bg-amber-500/15 border-amber-400/30' },
    INFO: { label: 'Info', color: 'text-blue-300 bg-blue-500/15 border-blue-400/30' },
  }
  const { label, color } = config[severity] ?? {
    label: severity,
    color: 'text-zinc-300 bg-zinc-500/15 border-zinc-400/20',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${color}`}
    >
      <AlertTriangle className="h-2.5 w-2.5" strokeWidth={1.5} />
      {label}
    </span>
  )
}
