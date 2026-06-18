'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Clock, Eye, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState, StatCard } from '@/components/ui'
import { adminHoverCls } from '@/lib/hover'
import { AlertsDateFilter } from './_components/alerts-date-filter'
import { DEFAULT_DATE_FILTER, matchesDateFilter, type DateFilterState } from './_components/alerts-filters'
import { AlertCard } from './_components/alert-card'
import { AlertColumnOverview } from './_components/alert-column-overview'
import type { AlertRow, ColumnId } from './_components/alert-types'
import { acknowledgeAlert, resolveAlert } from '@/modules/chatbot/server/admin/manageAlerts'

interface AlertsClientProps {
  initialAlerts: AlertRow[]
}

const COLUMNS = [
  { id: 'PENDING', label: 'Pendientes', icon: Inbox, colorClass: 'text-amber-400' },
  { id: 'ACKNOWLEDGED', label: 'Vistas', icon: Eye, colorClass: 'text-cyan-400' },
  { id: 'RESOLVED', label: 'Resueltas', icon: CheckCircle, colorClass: 'text-emerald-400' },
] as const

// Umbral del difuminado + overview de columna (en Leads es 2; acá 5 por pedido).
// Se evalúa sobre las alertas YA filtradas (severidad + fecha).
const OVERVIEW_THRESHOLD = 5
const MAX_VISIBLE = 5

export function AlertsClient({ initialAlerts }: AlertsClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<DateFilterState>(DEFAULT_DATE_FILTER)
  const [overviewCol, setOverviewCol] = useState<ColumnId | null>(null)

  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const pendingCritical = alerts.filter(
    (a) => a.status === 'PENDING' && a.severity === 'CRITICAL',
  ).length
  const totalPending = alerts.filter((a) => a.status === 'PENDING').length
  const resolvedThisWeek = alerts.filter(
    (a) => a.status === 'RESOLVED' && a.resolvedAt && new Date(a.resolvedAt) >= oneWeekAgo,
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

  const passesFilters = (a: AlertRow): boolean => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false
    if (!matchesDateFilter(a.createdAt, dateFilter, now)) return false
    return true
  }

  const grouped: Record<ColumnId, AlertRow[]> = {
    PENDING: alerts.filter((a) => a.status === 'PENDING' && passesFilters(a)),
    ACKNOWLEDGED: alerts.filter((a) => a.status === 'ACKNOWLEDGED' && passesFilters(a)),
    RESOLVED: alerts.filter((a) => a.status === 'RESOLVED' && passesFilters(a)),
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

  const renderAlertCard = (alert: AlertRow) => (
    <AlertCard
      key={alert.id}
      alert={alert}
      pendingAction={pendingAction}
      onAck={(id) => void handleAck(id)}
      onResolve={(id) => void handleResolve(id)}
    />
  )

  const overviewLabel = overviewCol
    ? COLUMNS.find((c) => c.id === overviewCol)?.label ?? null
    : null

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={'grid rounded-2xl ' + adminHoverCls}>
          <StatCard
            label="Críticas pendientes"
            value={pendingCritical}
            icon={AlertTriangle}
            accent={pendingCritical > 0 ? 'red' : 'zinc'}
          />
        </div>
        <div className={'grid rounded-2xl ' + adminHoverCls}>
          <StatCard label="Totales pendientes" value={totalPending} icon={Inbox} accent="amber" />
        </div>
        <div className={'grid rounded-2xl ' + adminHoverCls}>
          <StatCard
            label="Resueltas esta semana"
            value={resolvedThisWeek}
            icon={CheckCircle}
            accent="emerald"
          />
        </div>
        <div className={'grid rounded-2xl ' + adminHoverCls}>
          <StatCard
            label="Tiempo prom. resolución"
            value={avgResolutionMin > 0 ? `${avgResolutionMin}m` : '—'}
            icon={Clock}
            accent="cyan"
            subtitle={avgResolutionMin > 0 ? 'minutos' : 'sin datos'}
          />
        </div>
      </div>

      {/* Filters: severidad + período (ambos client-side, se combinan) */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
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

        <AlertsDateFilter
          value={dateFilter}
          onChange={(patch) => setDateFilter((prev) => ({ ...prev, ...patch }))}
        />
      </div>

      {/* Triage columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const items = grouped[col.id]
          const Icon = col.icon
          const hasOverview = items.length >= OVERVIEW_THRESHOLD
          const visible = items.slice(0, MAX_VISIBLE)

          const header = (
            <>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${col.colorClass}`} strokeWidth={1.5} />
                <p className="text-sm font-medium text-zinc-200">{col.label}</p>
              </div>
              <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-500">
                {items.length}
              </span>
            </>
          )

          return (
            <div
              key={col.id}
              className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4"
            >
              {hasOverview ? (
                <button
                  type="button"
                  onClick={() => setOverviewCol(col.id)}
                  aria-label={`Ver todas las alertas de ${col.label}`}
                  className="mb-4 flex w-full items-center justify-between rounded-xl px-1 py-1 text-left transition-colors hover:bg-white/[0.04]"
                >
                  {header}
                </button>
              ) : (
                <div className="mb-4 flex items-center justify-between px-1 py-1">{header}</div>
              )}

              {items.length === 0 ? (
                <p className="py-10 text-center text-sm italic text-zinc-600">
                  {col.id === 'PENDING' ? 'Todo OK 🎉' : 'Vacío'}
                </p>
              ) : (
                <>
                  {/* relative: ancla el difuminado. SIN overflow-hidden ni altura fija,
                      para que el hover por card (Sprint 3) pueda escalar sin recortarse. */}
                  <div className="relative space-y-2">
                    {visible.map((alert) => renderAlertCard(alert))}
                    {hasOverview && (
                      // Fade a #141618 = superficie compuesta de la columna
                      // (root #080a0c + panel white/[0.03] + columna white/[0.02]),
                      // para que el degradado matchee el fondo y no deje banda.
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-b from-transparent to-[#141618]"
                      />
                    )}
                  </div>
                  {hasOverview && (
                    <button
                      type="button"
                      onClick={() => setOverviewCol(col.id)}
                      className="mt-2 w-full rounded-xl px-3 py-1.5 text-center text-[11px] font-medium text-cyan-300/80 transition-colors hover:bg-cyan-400/10 hover:text-cyan-200"
                    >
                      Ver todas ({items.length}) →
                    </button>
                  )}
                </>
              )}
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

      <AlertColumnOverview
        title={overviewLabel}
        alerts={overviewCol ? grouped[overviewCol] : []}
        renderCard={renderAlertCard}
        onClose={() => setOverviewCol(null)}
      />
    </div>
  )
}
