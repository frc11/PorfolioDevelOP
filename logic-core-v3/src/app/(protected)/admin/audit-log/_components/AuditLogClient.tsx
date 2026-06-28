'use client'

import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, ChevronDown, Clock, Filter, History, User } from 'lucide-react'
import { Badge, Button, Callout, Card, Select } from '@/components/ui'
import { EmptyStateMuted } from '@/components/ui/EmptyStateMuted'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { useIsClient } from '@/lib/use-is-client'
import { adminHoverCls } from '@/lib/hover'
import { listAuditLog } from '@/lib/audit-log-queries'
import { AuditPeriodFilter } from './audit-period-filter'
import { periodToRange, type AuditPeriod } from './audit-filters'

const PAGE_SIZE = 10

type DiffValue = Record<string, { before: unknown; after: unknown }>

interface AuditEntry {
  id: string
  userId: string
  userEmail: string | null
  userName: string | null
  actionType: string
  action: string
  targetType: string
  targetId: string
  diff: unknown
  metadata: unknown
  ipAddress: string | null
  createdAt: Date
}

interface AuditLogClientProps {
  initialEntries: AuditEntry[]
  initialHasMore: boolean
  actionTypes: string[]
  stats: {
    total: number
    last7Days: number
    byActionType: Array<{ actionType: string; _count: number }>
  }
}

export function AuditLogClient({
  initialEntries,
  initialHasMore,
  actionTypes,
  stats,
}: AuditLogClientProps) {
  const reduced = useReducedMotion()
  const mounted = useIsClient()
  const [entries, setEntries] = useState(initialEntries)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [actionFilter, setActionFilter] = useState('all')
  const [period, setPeriod] = useState<AuditPeriod>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  // Ignora respuestas viejas si se cambia el filtro rapido (out-of-order).
  const requestSeq = useRef(0)

  async function runQuery(
    next: { action: string; period: AuditPeriod; from: string; to: string },
    targetPage: number,
    mode: 'replace' | 'append',
  ) {
    const seq = ++requestSeq.current
    setLoading(true)
    setError(null)
    try {
      const { fromDate, toDate } = periodToRange(next.period, next.from, next.to)
      const result = await listAuditLog(
        {
          ...(next.action !== 'all' && { actionType: next.action }),
          ...(fromDate && { fromDate }),
          ...(toDate && { toDate }),
        },
        targetPage,
        PAGE_SIZE,
      )
      if (seq !== requestSeq.current) {
        return
      }
      setEntries((prev) =>
        mode === 'append' ? [...prev, ...result.entries] : result.entries,
      )
      setHasMore(result.hasMore)
      setPage(targetPage)
    } catch {
      if (seq !== requestSeq.current) {
        return
      }
      setError('No se pudieron cargar los registros.')
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false)
      }
    }
  }

  function changeAction(value: string) {
    setActionFilter(value)
    setExpanded(new Set())
    runQuery({ action: value, period, from: dateFrom, to: dateTo }, 0, 'replace')
  }

  function changeDate(nextPeriod: AuditPeriod, nextFrom: string, nextTo: string) {
    setPeriod(nextPeriod)
    setDateFrom(nextFrom)
    setDateTo(nextTo)
    setExpanded(new Set())
    runQuery(
      { action: actionFilter, period: nextPeriod, from: nextFrom, to: nextTo },
      0,
      'replace',
    )
  }

  function loadMore() {
    runQuery({ action: actionFilter, period, from: dateFrom, to: dateTo }, page + 1, 'append')
  }

  function toggleExpand(id: string) {
    const next = new Set(expanded)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpanded(next)
  }

  const actionOptions = useMemo(
    () => [
      { value: 'all', label: 'Todas las acciones' },
      ...[...actionTypes].sort().map((type) => ({ value: type, label: type })),
    ],
    [actionTypes],
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatBox label="Total registros" value={stats.total} />
        <StatBox label="Ultimos 7 dias" value={stats.last7Days} accent="cyan" />
        <StatBox label="Tipos de accion" value={stats.byActionType.length} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
        <Select
          value={actionFilter}
          onChange={(event) => changeAction(event.target.value)}
          className="w-auto py-1.5"
          options={actionOptions}
        />
        <AuditPeriodFilter
          period={period}
          from={dateFrom}
          to={dateTo}
          onChange={changeDate}
        />
        <span className="text-xs text-zinc-500">
          {loading ? 'Cargando...' : `Mostrando ${entries.length} registros`}
        </span>
      </div>

      {entries.length === 0 ? (
        loading ? (
          <div className="py-12 text-center text-sm text-zinc-500">
            Cargando registros...
          </div>
        ) : (
          <EmptyStateMuted
            icon={History}
            title="Sin registros para este filtro"
            description="Cuando haya acciones administrativas que coincidan, van a aparecer aca."
          />
        )
      ) : (
        <motion.div
          className="space-y-2"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced || mounted ? false : 'hidden'}
          animate={reduced ? undefined : 'visible'}
          aria-busy={loading}
        >
          {entries.map((entry) => {
            const diff = normalizeDiff(entry.diff)
            const isExpanded = expanded.has(entry.id)
            const hasDiff = Object.keys(diff).length > 0
            const reason = extractReason(entry.metadata)
            const deletion = extractDeletionDetail(entry.metadata)
            const expandable = hasDiff || deletion !== null

            return (
              <motion.div
                key={entry.id}
                variants={reduced ? undefined : staggerItem}
              >
                <Card
                  padding="none"
                  className={`overflow-hidden ${adminHoverCls}`}
                >
                  <button
                    type="button"
                    onClick={() => expandable && toggleExpand(entry.id)}
                    disabled={!expandable}
                    className="w-full p-4 text-left transition-colors hover:bg-white/[0.02] disabled:cursor-default"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <ActionBadge type={entry.actionType} />
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <Clock className="h-3 w-3" strokeWidth={1.5} />
                            {new Date(entry.createdAt).toLocaleString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-200">{entry.action}</p>
                        {reason && (
                          <p className="mt-1.5 text-xs text-zinc-300">
                            <span className="text-zinc-500">Motivo:</span> {reason}
                          </p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" strokeWidth={1.5} />
                            {entry.userName ?? entry.userEmail ?? entry.userId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" strokeWidth={1.5} />
                            {entry.targetType} / {entry.targetId.slice(0, 12)}
                          </span>
                        </div>
                      </div>

                      {expandable && (
                        <motion.div
                          animate={reduced ? undefined : { rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.15 }}
                          className={reduced && isExpanded ? 'rotate-180' : undefined}
                        >
                          <ChevronDown
                            className="h-4 w-4 text-zinc-500"
                            strokeWidth={1.5}
                          />
                        </motion.div>
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && expandable && (
                      <motion.div
                        initial={reduced ? false : { height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={reduced ? undefined : { height: 0 }}
                        transition={{ duration: reduced ? 0 : 0.2 }}
                        className="overflow-hidden border-t border-white/10"
                      >
                        <div className="bg-zinc-950/50 p-4">
                          {deletion ? (
                            <DeletionDetail detail={deletion} />
                          ) : (
                            <>
                              <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                                Cambios
                              </p>
                              <DiffDisplay diff={diff} />
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {error ? <Callout tone="danger">{error}</Callout> : null}

      {hasMore ? (
        <div className="text-center">
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={loadMore}
          >
            {loading ? 'Cargando...' : 'Cargar mas'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: 'cyan'
}) {
  return (
    <Card padding="sm" className={adminHoverCls}>
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          accent === 'cyan' ? 'text-cyan-300' : 'text-zinc-100'
        }`}
      >
        {value.toLocaleString('es-AR')}
      </p>
    </Card>
  )
}

function ActionBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    CLIENT_CREATED: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
    CLIENT_UPDATED: 'border-cyan-400/30 bg-cyan-500/15 text-cyan-300',
    CLIENT_DELETED: 'border-red-400/30 bg-red-500/15 text-red-300',
    BOT_ACTIVATED: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
    BOT_DEACTIVATED: 'border-amber-400/30 bg-amber-500/15 text-amber-300',
    BOT_CONFIG_UPDATED: 'border-cyan-400/30 bg-cyan-500/15 text-cyan-300',
    BOT_DELETED: 'border-red-400/30 bg-red-500/15 text-red-300',
    KB_UPDATED: 'border-violet-400/30 bg-violet-500/15 text-violet-300',
    IMPERSONATION_STARTED:
      'border-orange-400/30 bg-orange-500/15 text-orange-300',
  }
  const className =
    colors[type] ?? 'border-zinc-400/30 bg-zinc-500/15 text-zinc-300'

  return (
    <Badge variant="default" className={className}>
      {type}
    </Badge>
  )
}

function DiffDisplay({ diff }: { diff: DiffValue }) {
  return (
    <div className="space-y-3">
      {Object.entries(diff).map(([key, change]) => (
        <div key={key} className="text-xs">
          <p className="mb-1 font-mono font-medium text-zinc-400">{key}</p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <DiffCell label="Antes" tone="before" value={change.before} />
            <DiffCell label="Despues" tone="after" value={change.after} />
          </div>
        </div>
      ))}
    </div>
  )
}

function DiffCell({
  label,
  tone,
  value,
}: {
  label: string
  tone: 'before' | 'after'
  value: unknown
}) {
  const toneClass =
    tone === 'before'
      ? 'border-red-400/20 bg-red-500/[0.06] text-red-200'
      : 'border-emerald-400/20 bg-emerald-500/[0.06] text-emerald-200'

  return (
    <div className={`rounded-lg border p-2 ${toneClass}`}>
      <p className="mb-1 text-[9px] uppercase tracking-wider opacity-80">
        {label}
      </p>
      <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words font-mono text-xs">
        {formatDiffValue(value)}
      </pre>
    </div>
  )
}

function normalizeDiff(value: unknown): DiffValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as DiffValue
}

// El motivo de un cambio (ej. cambio de plan) se persiste en
// AdminAuditLog.metadata.reason (Json). Se lee de forma segura, sin `any`.
function extractReason(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }
  const reason = (metadata as Record<string, unknown>).reason
  return typeof reason === 'string' && reason.trim() !== '' ? reason : null
}

interface DeletionInfo {
  deleted: Array<{ label: string; value: string }>
  preservedLeads: number | null
}

// Metadata del hard-delete de cliente (hardDeleteClient): { hardDelete:true,
// deleted:{label->count}, preservedLeads }. Se lee de forma segura, sin `any`.
function extractDeletionDetail(metadata: unknown): DeletionInfo | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null
  }
  const m = metadata as Record<string, unknown>
  if (m.hardDelete !== true) return null

  const deletedRaw =
    m.deleted && typeof m.deleted === 'object' && !Array.isArray(m.deleted)
      ? (m.deleted as Record<string, unknown>)
      : {}
  const deleted = Object.entries(deletedRaw)
    .filter(([, value]) => value !== null && value !== false)
    .map(([label, value]) => ({ label, value: String(value) }))

  const preservedLeads =
    typeof m.preservedLeads === 'number' ? m.preservedLeads : null
  return { deleted, preservedLeads }
}

function DeletionDetail({ detail }: { detail: DeletionInfo }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Se elimino
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {detail.deleted.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-rose-400/20 bg-rose-500/[0.06] px-2.5 py-1.5"
            >
              <p className="text-[9px] uppercase tracking-wider text-rose-200/70">
                {item.label}
              </p>
              <p className="text-sm font-medium text-rose-100">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-2 text-xs text-emerald-200">
        Se preservaron {detail.preservedLeads ?? 0} lead
        {detail.preservedLeads === 1 ? '' : 's'} en el pipeline de ventas.
      </p>
    </div>
  )
}

function formatDiffValue(value: unknown): string {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
