'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, ChevronDown, Clock, Filter, History, User } from 'lucide-react'
import { Badge, Button, Callout, Card, EmptyState, Select } from '@/components/ui'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { useIsClient } from '@/lib/use-is-client'
import { adminHoverCls } from '@/lib/hover'
import { listAuditLog } from '@/lib/audit-log-queries'

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
  stats: {
    total: number
    last7Days: number
    byActionType: Array<{ actionType: string; _count: number }>
  }
}

export function AuditLogClient({
  initialEntries,
  initialHasMore,
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
  const [filter, setFilter] = useState('all')

  async function loadMore() {
    setLoading(true)
    setError(null)
    try {
      const next = page + 1
      const result = await listAuditLog(undefined, next, PAGE_SIZE)
      setEntries((prev) => [...prev, ...result.entries])
      setHasMore(result.hasMore)
      setPage(next)
    } catch {
      setError('No se pudieron cargar mas registros.')
    } finally {
      setLoading(false)
    }
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

  const actionTypes = useMemo(
    () => ['all', ...new Set(entries.map((entry) => entry.actionType))],
    [entries],
  )
  const filtered =
    filter === 'all'
      ? entries
      : entries.filter((entry) => entry.actionType === filter)

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
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="w-auto py-1.5"
          options={actionTypes.map((type) => ({
            value: type,
            label: type === 'all' ? 'Todas las acciones' : type,
          }))}
        />
        <span className="text-xs text-zinc-500">
          Mostrando {filtered.length} entries
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin registros para este filtro"
          description="Cuando haya acciones administrativas que coincidan, van a aparecer aca."
        />
      ) : (
        <motion.div
          className="space-y-2"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced || mounted ? false : 'hidden'}
          animate={reduced ? undefined : 'visible'}
        >
          {filtered.map((entry) => {
            const diff = normalizeDiff(entry.diff)
            const isExpanded = expanded.has(entry.id)
            const hasDiff = Object.keys(diff).length > 0

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
                    onClick={() => hasDiff && toggleExpand(entry.id)}
                    disabled={!hasDiff}
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

                      {hasDiff && (
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
                    {isExpanded && hasDiff && (
                      <motion.div
                        initial={reduced ? false : { height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={reduced ? undefined : { height: 0 }}
                        transition={{ duration: reduced ? 0 : 0.2 }}
                        className="overflow-hidden border-t border-white/10"
                      >
                        <div className="bg-zinc-950/50 p-4">
                          <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                            Cambios
                          </p>
                          <DiffDisplay diff={diff} />
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
    <Card padding="sm">
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
