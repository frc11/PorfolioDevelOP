'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { Users, Flame, TrendingUp, Minus, Filter } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { BusinessLeadCard } from './BusinessLeadCard'
import type { ChatbotLead, ChatbotLeadStatus } from '@prisma/client'

// B5.5 — Tipo enriquecido con scoring efectivo (decay + explicabilidad)
type LeadClassification = 'hot' | 'warm' | 'cold' | 'dq'
type ScoreKind = 'positive' | 'combo' | 'penalty' | 'dq'
type ExplanationLine = { key: string; label: string; points: number; kind: ScoreKind }

export type LeadWithScore = ChatbotLead & {
  effectiveScore: number | null
  effectiveClassification: LeadClassification | null
  decayTierLabel: string | null
  scoreExplanation: ExplanationLine[]
}

const CLASS_CONFIG: Record<'hot' | 'warm' | 'cold', { label: string; activeClass: string }> = {
  hot:  { label: 'Calientes', activeClass: 'border-rose-500/30 bg-rose-500/15 text-rose-300' },
  warm: { label: 'Tibios',    activeClass: 'border-amber-500/30 bg-amber-500/15 text-amber-300' },
  cold: { label: 'Fríos',     activeClass: 'border-sky-500/30 bg-sky-500/15 text-sky-400' },
}

const CLASS_ICONS = { hot: Flame, warm: TrendingUp, cold: Minus }

const STATUS_LABELS: Record<ChatbotLeadStatus, string> = {
  NEW: 'Sin contactar',
  CONTACTED: 'Contactado',
  IN_NEGOTIATION: 'En negociación',
  WON: 'Cliente',
  LOST: 'Perdido',
}

const FILTER_ACCENT: Record<ChatbotLeadStatus | 'all', string> = {
  all: 'border-zinc-700 bg-zinc-800 text-zinc-100',
  NEW: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  CONTACTED: 'border-blue-500/30 bg-blue-500/15 text-blue-300',
  IN_NEGOTIATION: 'border-cyan-500/30 bg-cyan-500/15 text-cyan-300',
  WON: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  LOST: 'border-zinc-500/30 bg-zinc-500/15 text-zinc-400',
}

const FILTER_INACTIVE = 'border-white/[0.06] bg-transparent text-zinc-500 hover:text-zinc-300'

type DateRange = 'all' | 'today' | '7d' | '30d'
const DATE_LABELS: Record<DateRange, string> = {
  all: 'Cualquier fecha',
  today: 'Hoy',
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
}

// Inicio del día actual en TZ Argentina (UTC-3, sin DST). Devuelve un Date apuntando al
// instante UTC equivalente. Se usa para filtros relativos de fecha.
function startOfTodayInAR(): Date {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(new Date())
  const y = parts.find((p) => p.type === 'year')!.value
  const m = parts.find((p) => p.type === 'month')!.value
  const d = parts.find((p) => p.type === 'day')!.value
  // 00:00 AR == 03:00 UTC mismo día calendario AR
  return new Date(`${y}-${m}-${d}T03:00:00.000Z`)
}

function withinDateRange(capturedAt: Date | string, range: DateRange, todayAR: Date): boolean {
  if (range === 'all') return true
  const ts = new Date(capturedAt).getTime()
  const today = todayAR.getTime()
  if (range === 'today') return ts >= today
  if (range === '7d')  return ts >= today - 6  * 86_400_000
  if (range === '30d') return ts >= today - 29 * 86_400_000
  return true
}

interface ClientLeadsTableProps {
  leads: LeadWithScore[]
  hadOnlyDq?: boolean
}

export function ClientLeadsTable({ leads: initialLeads, hadOnlyDq = false }: ClientLeadsTableProps) {
  const reduced = useReducedMotion()
  const [leads, setLeads] = useState<LeadWithScore[]>(initialLeads)
  const [classFilter, setClassFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all')
  const [filter, setFilter] = useState<ChatbotLeadStatus | 'all'>('all')
  const [dateFilter, setDateFilter] = useState<DateRange>('all')
  const todayAR = useMemo(() => startOfTodayInAR(), [])

  // B5.7 — polling cada 30s, PAUSADO cuando la pestaña está oculta para no
  // gastar requests en tabs en background. Al volver a focus, fetch inmediato
  // para que el dueño vea fresco lo que pasó mientras tanto.
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null

    async function refresh() {
      try {
        const res = await fetch('/api/dashboard/leads/recent')
        if (res.ok) {
          const { leads: fresh } = (await res.json()) as { leads: LeadWithScore[] }
          setLeads(fresh)
        }
      } catch {
        // polling failure is silent — stale data is acceptable
      }
    }

    function start() {
      if (intervalId != null) return
      intervalId = setInterval(refresh, 30_000)
    }
    function stop() {
      if (intervalId == null) return
      clearInterval(intervalId)
      intervalId = null
    }
    function handleVisibility() {
      if (document.hidden) {
        stop()
      } else {
        refresh()
        start()
      }
    }

    if (!document.hidden) start()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Cadena de filtros: fecha → clase → estado. Cada uno reduce el set siguiente
  // para que los conteos en los chips reflejen lo que el usuario ya filtró.
  const byDate = leads.filter((l) => withinDateRange(l.capturedAt, dateFilter, todayAR))

  const hotCount  = byDate.filter(l => l.effectiveClassification === 'hot').length
  const warmCount = byDate.filter(l => l.effectiveClassification === 'warm').length
  const coldCount = byDate.filter(l => l.effectiveClassification === 'cold').length

  const byClass  = classFilter === 'all' ? byDate : byDate.filter(l => l.effectiveClassification === classFilter)
  const filtered = filter === 'all' ? byClass : byClass.filter((l) => l.status === filter)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Mi Chatbot"
        title="Mis contactos"
        description="Personas que charlaron con tu bot y dejaron sus datos"
        icon={Users}
      />

      {leads.length === 0 ? (
        hadOnlyDq ? (
          <EmptyState
            icon={Filter}
            title="Tu bot capturó contactos, pero ninguno requiere seguimiento"
            description="Las consultas recibidas fueron de postventa, propuestas de empleo o spam, así que no aparecen acá. Si pensás que esto es un error, contactá a soporte."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="Tu bot todavía no capturó contactos"
            description="Cuando alguien charle con tu chatbot y deje sus datos, vas a verlos acá. Compartí tu sitio para que empiecen a llegar."
            cta={{ label: 'Ver mi chatbot', href: '/dashboard/chatbot' }}
          />
        )
      ) : (
        <>
          {/* Filtro por fecha (B5.5) — TZ Argentina */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DATE_LABELS) as DateRange[]).map((key) => {
              const count = key === 'all'
                ? leads.length
                : leads.filter((l) => withinDateRange(l.capturedAt, key, todayAR)).length
              if (key !== 'all' && count === 0) return null
              return (
                <button
                  key={key}
                  onClick={() => setDateFilter(key)}
                  className={`min-h-[44px] rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${dateFilter === key ? FILTER_ACCENT.all : FILTER_INACTIVE}`}
                >
                  {DATE_LABELS[key]} ({count})
                </button>
              )
            })}
          </div>

          {/* Filtro por calidad (B5.5) */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setClassFilter('all')}
              className={`min-h-[44px] rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${classFilter === 'all' ? FILTER_ACCENT.all : FILTER_INACTIVE}`}
            >
              Todos ({byDate.length})
            </button>
            {(['hot', 'warm', 'cold'] as const).map((cls) => {
              const count = cls === 'hot' ? hotCount : cls === 'warm' ? warmCount : coldCount
              if (count === 0) return null
              const cfg = CLASS_CONFIG[cls]
              const Icon = CLASS_ICONS[cls]
              return (
                <button
                  key={cls}
                  onClick={() => setClassFilter(cls)}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${classFilter === cls ? cfg.activeClass : FILTER_INACTIVE}`}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {cfg.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Filtro por estado CRM */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`min-h-[44px] rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${filter === 'all' ? FILTER_ACCENT.all : FILTER_INACTIVE}`}
            >
              Todos los estados ({byClass.length})
            </button>
            {(Object.keys(STATUS_LABELS) as ChatbotLeadStatus[]).map((key) => {
              const count = byClass.filter((l) => l.status === key).length
              if (count === 0) return null
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`min-h-[44px] rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${filter === key ? FILTER_ACCENT[key] : FILTER_INACTIVE}`}
                >
                  {STATUS_LABELS[key]} ({count})
                </button>
              )
            })}
          </div>

          {/* Lista */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="No hay contactos con esos filtros"
              description="Probá cambiar la fecha, la calidad o el estado para ver otros contactos."
              variant="subtle"
              size="sm"
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              variants={reduced ? undefined : staggerContainer}
              initial={reduced ? undefined : 'hidden'}
              animate={reduced ? undefined : 'visible'}
            >
              {filtered.map((lead) => {
                const isHotNew = lead.effectiveClassification === 'hot' && lead.status === 'NEW'
                return (
                  <motion.div key={lead.id} variants={reduced ? undefined : staggerItem}>
                    <BusinessLeadCard
                      lead={lead}
                      effectiveScore={lead.effectiveScore}
                      effectiveClassification={
                        lead.effectiveClassification === 'dq' || lead.effectiveClassification === null
                          ? null
                          : lead.effectiveClassification
                      }
                      decayTierLabel={lead.decayTierLabel}
                      highlight={isHotNew}
                      href={`/dashboard/chatbot/leads/${lead.id}`}
                    />
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
