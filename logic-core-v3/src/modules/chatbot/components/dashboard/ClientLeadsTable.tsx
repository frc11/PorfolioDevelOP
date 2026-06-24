'use client'

import { useState, useEffect, useMemo, useCallback, useRef, useTransition, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { Users, Filter, Ban } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { BusinessLeadCard } from './BusinessLeadCard'
import { LeadPipeline } from './lead-pipeline/LeadPipeline'
import { ExportLeadsButton } from './ExportLeadsButton'
import { LeadScoringTeaser } from './LeadScoringTeaser'
import { withinDateRange, type DateRange } from '@/lib/tz-ar'
import type { ChatbotLead, ChatbotLeadStatus } from '@prisma/client'

type LeadClassification = 'hot' | 'warm' | 'cold' | 'dq'
type ScoreKind = 'positive' | 'combo' | 'penalty' | 'dq'
type ExplanationLine = { key: string; label: string; points: number; kind: ScoreKind }

export type LeadWithScore = ChatbotLead & {
  effectiveScore: number | null
  effectiveClassification: LeadClassification | null
  decayTierLabel: string | null
  scoreExplanation: ExplanationLine[]
}

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

const DATE_LABELS: Record<DateRange, string> = {
  all: 'Cualquier fecha',
  today: 'Hoy',
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
}

// Estilo base de las chips de filtro (fecha/estado), re-skinneadas dentro del
// contenedor glass del pipeline admin. `active` aplica el acento; inactivo, sobrio.
const CHIP_BASE = 'min-h-[44px] rounded-xl border px-3 py-1 text-xs font-medium transition-colors'
function chipClass(active: boolean, accent: string = FILTER_ACCENT.all): string {
  return `${CHIP_BASE} ${active ? accent : FILTER_INACTIVE}`
}

// Campo etiquetado de la barra de filtros: caption uppercase (estilo admin) + fila
// de chips que envuelve.
function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

interface ClientLeadsTableProps {
  leads: LeadWithScore[]
  /** El tenant capturó leads pero TODOS eran DQ — empty state distinto. */
  hadOnlyDq?: boolean
  /** Total de DQ en la org (independiente del filtro actual). */
  dqCount: number
  /** True si la vista activa muestra SOLO descartados. */
  showingDq: boolean
  /** P0.3 — El plan incluye la priorización caliente/tibio/frío. Si false,
   *  se ocultan chips/score/filtro-de-calidad y va un teaser en su lugar. */
  showScoring: boolean
  /** Filtros server-side ya aplicados, para sincronizar la UI. */
  initialStatus: ChatbotLeadStatus | 'all'
  initialRange: DateRange
}

export function ClientLeadsTable({
  leads,
  hadOnlyDq = false,
  dqCount,
  showingDq,
  showScoring,
  initialStatus,
  initialRange,
}: ClientLeadsTableProps) {
  const reduced = useReducedMotion()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  // B5.7 v2 — Detección de leads nuevos llegados durante el polling. El primer
  // render establece baseline (no marca nada como nuevo). En refresh siguientes,
  // los IDs que NO estaban antes se marcan como "freshIds" durante 6s para que
  // el dueño los note sin tener que comparar a mano. La fuente es la lista
  // server-rendered: `router.refresh()` muta `leads` y este effect detecta el delta.
  const seenIdsRef = useRef<Set<string> | null>(null)
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(leads.map((l) => l.id))
      return
    }
    const seen = seenIdsRef.current
    const justAdded = leads.map((l) => l.id).filter((id) => !seen.has(id))
    if (justAdded.length === 0) return
    justAdded.forEach((id) => seen.add(id))
    setFreshIds((prev) => {
      const next = new Set(prev)
      justAdded.forEach((id) => next.add(id))
      return next
    })
    const timer = setTimeout(() => {
      setFreshIds((prev) => {
        const next = new Set(prev)
        justAdded.forEach((id) => next.delete(id))
        return next
      })
    }, 6000)
    return () => clearTimeout(timer)
  }, [leads])

  // B5.5 — refresh cada 30s del Server Component (re-corre query con filtros
  // activos). Pausado en tab oculta. Más limpio que un endpoint paralelo:
  // una sola query es la verdad y respeta filtros sin duplicar lógica.
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null

    function refresh() {
      startTransition(() => router.refresh())
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
      if (document.hidden) stop()
      else { refresh(); start() }
    }

    if (!document.hidden) start()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [router])

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams()
      const merged: Record<string, string | undefined> = {
        status: initialStatus === 'all' ? undefined : initialStatus,
        range: initialRange === 'all' ? undefined : initialRange,
        view: showingDq ? 'dq' : undefined,
        ...patch,
      }
      for (const [k, v] of Object.entries(merged)) {
        if (v) params.set(k, v)
      }
      const qs = params.toString()
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
    },
    [pathname, router, initialStatus, initialRange, showingDq],
  )

  // Set filtrado por fecha (TZ AR) sobre el ya filtrado server-side. `now` ancla
  // el extremo del rango.
  const now = useMemo(() => new Date(), [leads])
  const byDate = useMemo(
    () => leads.filter((l) => withinDateRange(l.capturedAt, initialRange, now)),
    [leads, initialRange, now],
  )
  const filtered = byDate

  // Distinguí "bandeja vacía" de "filtro sin resultados". `leads` ya viene
  // filtrado server-side por status/range/view → length 0 CON filtros activos =
  // un filtro vació la vista, no que el tenant no tenga contactos. En ese caso
  // hay que mantener la barra de filtros montada (si no, desaparecen las chips y
  // el usuario queda atrapado sin forma de limpiar el filtro) y mostrar el empty
  // "sin resultados con estos filtros". Cubre fecha Y estado (ambos server-side).
  const hasActiveFilters = initialStatus !== 'all' || initialRange !== 'all'
  const isTrulyEmpty = leads.length === 0 && !hasActiveFilters
  // Modo comercial + plan con scoring → pipeline por clasificación. Los descartados
  // y el plan sin scoring siguen en grilla plana (no hay clasificación que columnizar).
  const usePipeline = !showingDq && showScoring
  const headerTitle = showingDq ? 'Contactos descartados' : 'Mis contactos'
  const headerDescription = showingDq
    ? 'Consultas que el bot identificó como no comerciales (postventa, empleo, spam o proveedores).'
    : 'Personas que charlaron con tu bot y dejaron sus datos'

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mi Chatbot"
        title={headerTitle}
        description={headerDescription}
        icon={showingDq ? Ban : Users}
      />

      {/* Toggle entre vista comercial y descartados. Siempre visible si hay DQ
          en la org, para que el dueño sepa que existen y pueda revisarlos. */}
      {(dqCount > 0 || showingDq) && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParams({ view: undefined })}
            className={`min-h-[44px] rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${!showingDq ? FILTER_ACCENT.all : FILTER_INACTIVE}`}
          >
            Contactos a seguir
          </button>
          <button
            onClick={() => updateParams({ view: 'dq', status: undefined })}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-medium transition-colors ${showingDq ? 'border-zinc-500/40 bg-zinc-600/15 text-zinc-300' : FILTER_INACTIVE}`}
          >
            <Ban className="h-3.5 w-3.5" strokeWidth={1.5} />
            Descartados ({dqCount})
          </button>
        </div>
      )}

      {isTrulyEmpty ? (
        showingDq ? (
          <EmptyState
            icon={Ban}
            title="Todavía no hay contactos descartados"
            description="Cuando el bot marque una consulta como no comercial (postventa, empleo, spam o proveedores), vas a verla acá."
          />
        ) : hadOnlyDq ? (
          <EmptyState
            icon={Filter}
            title="Tu bot capturó contactos, pero ninguno requiere seguimiento"
            description="Las consultas recibidas fueron de postventa, propuestas de empleo o spam. Tocá 'Descartados' arriba si querés verlas."
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
          {/* Barra de filtros — re-skin dentro del contenedor glass del pipeline
              admin. Chips (no Select: decisión de producto). Fecha siempre; estado
              sólo en modo comercial (los descartados no tienen estado CRM). La
              clasificación ya no es un chip: la expresan las columnas del pipeline. */}
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <FilterField label="Fecha">
                {(Object.keys(DATE_LABELS) as DateRange[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => updateParams({ range: key === 'all' ? undefined : key })}
                    className={chipClass(initialRange === key)}
                  >
                    {DATE_LABELS[key]}
                  </button>
                ))}
              </FilterField>

              {!showingDq && (
                <FilterField label="Estado">
                  <button
                    onClick={() => updateParams({ status: undefined })}
                    className={chipClass(initialStatus === 'all')}
                  >
                    Todos
                  </button>
                  {(Object.keys(STATUS_LABELS) as ChatbotLeadStatus[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => updateParams({ status: key })}
                      className={chipClass(initialStatus === key, FILTER_ACCENT[key])}
                    >
                      {STATUS_LABELS[key]}
                    </button>
                  ))}
                </FilterField>
              )}
            </div>
          </div>

          {/* P0.3 — Plan sin priorización: teaser donde iría la priorización. Solo
              en modo comercial (los descartados no son la feature vendida). */}
          {!showingDq && !showScoring && <LeadScoringTeaser />}

          {/* B5.9 — Exportar lo que está filtrado en pantalla (status, range, view=dq).
              Sin filtro por clase: el pipeline muestra todas las clases a la vez. */}
          <div className="flex justify-end">
            <ExportLeadsButton
              status={initialStatus}
              range={initialRange}
              showingDq={showingDq}
              classFilter="all"
              hasLeads={filtered.length > 0}
            />
          </div>

          {/* Lista — pipeline por clasificación (plan con scoring, modo comercial)
              o grilla plana (descartados / plan sin scoring). */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={Filter}
              title="No hay contactos con esos filtros"
              description={
                showingDq
                  ? "Probá cambiar la fecha o volver a 'Contactos a seguir' para ver los activos."
                  : 'Probá cambiar la fecha o el estado para ver otros contactos.'
              }
              variant="subtle"
              size="sm"
            />
          ) : usePipeline ? (
            <LeadPipeline leads={filtered} freshIds={freshIds} />
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              variants={reduced ? undefined : staggerContainer}
              initial={reduced ? undefined : 'hidden'}
              animate={reduced ? undefined : 'visible'}
            >
              {filtered.map((lead) => {
                const isHotNew = lead.effectiveClassification === 'hot' && lead.status === 'NEW'
                // P0.3 — sin plan de priorización: la card no recibe clase/score
                // ni decay ni highlight (el badge XL y el anillo rose son la
                // feature gateada). El resto del lead se ve completo igual.
                const classForCard =
                  !showScoring ||
                  lead.effectiveClassification === 'dq' ||
                  lead.effectiveClassification === null
                    ? null
                    : lead.effectiveClassification
                return (
                  <motion.div key={lead.id} variants={reduced ? undefined : staggerItem}>
                    <BusinessLeadCard
                      lead={lead}
                      effectiveScore={showScoring ? lead.effectiveScore : null}
                      effectiveClassification={classForCard}
                      decayTierLabel={showScoring ? lead.decayTierLabel : null}
                      highlight={isHotNew && !showingDq && showScoring}
                      isFresh={freshIds.has(lead.id)}
                      isDq={showingDq}
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
