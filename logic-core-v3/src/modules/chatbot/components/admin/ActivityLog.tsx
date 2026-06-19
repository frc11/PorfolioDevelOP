'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Select } from '@/components/ui'
import { ActivityDateFilter } from './activity/ActivityDateFilter'
import {
  ACTIVITY_LEVEL_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  DEFAULT_ACTIVITY_FILTERS,
  filterActivityEvents,
  isDefaultActivityFilters,
  type ActivityFilters,
} from './activity/activityFilters'

interface ActivityEvent {
  id: string
  type: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  createdAt: string
  conversationSession: string | null
  conversationPath: string | null
  metadata: Record<string, unknown> | null
}

interface ActivityLogProps {
  initialEvents: ActivityEvent[]
  slug: string
}

const LEVEL_STYLES: Record<string, string> = {
  info: 'border-white/5 bg-white/[0.02] text-zinc-200',
  warn: 'border-amber-500/20 bg-amber-500/[0.04] text-amber-200',
  error: 'border-red-500/20 bg-red-500/[0.04] text-red-200',
  debug: 'border-white/[0.03] bg-white/[0.01] text-zinc-500',
}

const LEVEL_ICONS: Record<string, string> = {
  info: '●',
  warn: '▲',
  error: '✕',
  debug: '○',
}

function formatTime(timestamp: string | Date): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  const isYesterday = (() => {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    return (
      date.getDate() === y.getDate() &&
      date.getMonth() === y.getMonth() &&
      date.getFullYear() === y.getFullYear()
    )
  })()
  const time = date.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  if (isSameDay) return `Hoy, ${time}`
  if (isYesterday) return `Ayer, ${time}`
  return `${date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}, ${time}`
}

export function ActivityLog({ initialEvents, slug }: ActivityLogProps) {
  const reduce = Boolean(useReducedMotion())
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents)
  const [paused, setPaused] = useState(false)
  const [filters, setFilters] = useState<ActivityFilters>(DEFAULT_ACTIVITY_FILTERS)
  const [visibleCount, setVisibleCount] = useState(50)
  const lastFetchRef = useRef<string>(new Date().toISOString())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  function patchFilters(patch: Partial<ActivityFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }))
    setVisibleCount(50)
  }

  function resetFilters() {
    setFilters(DEFAULT_ACTIVITY_FILTERS)
    setVisibleCount(50)
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    if (paused) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/admin/chatbot/events?slug=${slug}&since=${encodeURIComponent(lastFetchRef.current)}`,
        )
        const data = (await res.json()) as { events?: ActivityEvent[]; serverTime?: string }
        if (data.events && data.events.length > 0) {
          setEvents((prev) => {
            const seen = new Set(prev.map((e) => e.id))
            const newOnes = data.events!.filter((e) => !seen.has(e.id))
            // 300 > el take de 250 de activity/page.tsx → el polling no recorta el pool de "Cargar más".
            return [...newOnes.reverse(), ...prev].slice(0, 300)
          })
          lastFetchRef.current = data.serverTime ?? new Date().toISOString()
        } else {
          lastFetchRef.current = data.serverTime ?? new Date().toISOString()
        }
      } catch {
        // polling failures during navigation are expected
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [paused, slug])

  const filtered = filterActivityEvents(events, filters)
  const shown = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Filtros</p>
          {!isDefaultActivityFilters(filters) && (
            <button
              onClick={resetFilters}
              className="rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        {/* Barra inline: 3 selects angostos + espacio libre; al elegir "Personalizado"
            los inputs desde/hasta aparecen inline a la derecha y llenan la barra. */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-44 sm:flex-none">
            <Select
              aria-label="Filtrar por tipo"
              value={filters.type}
              onChange={(e) => patchFilters({ type: e.target.value })}
              options={ACTIVITY_TYPE_OPTIONS}
            />
          </div>
          <div className="w-full sm:w-44 sm:flex-none">
            <Select
              aria-label="Filtrar por nivel"
              value={filters.level}
              onChange={(e) => patchFilters({ level: e.target.value })}
              options={ACTIVITY_LEVEL_OPTIONS}
            />
          </div>
          <ActivityDateFilter
            preset={filters.period}
            from={filters.from}
            to={filters.to}
            onPresetChange={(period) => patchFilters({ period })}
            onFromChange={(from) => patchFilters({ from })}
            onToChange={(to) => patchFilters({ to })}
          />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPaused(!paused)}
          title="Pausa la actualización automática del stream de eventos en vivo. El polling se detiene hasta que reanudes."
          aria-label={
            paused
              ? 'Reanudar la actualización automática del stream de eventos en vivo'
              : 'Pausar la actualización automática del stream de eventos en vivo'
          }
          className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors ${
            paused
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {paused ? '▶ Reanudar' : '⏸ Pausar'}
        </button>
        <span className="hidden text-[11px] text-zinc-600 sm:inline">
          {paused
            ? 'Stream pausado — no entran eventos nuevos'
            : 'Pausa la actualización automática del stream en vivo'}
        </span>

        <div className="ml-auto text-xs text-zinc-600 font-mono">
          {shown.length} de {filtered.length} eventos{paused ? ' (pausado)' : ''}
        </div>
      </div>

      {/* Event stream */}
      <div className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {shown.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] py-16 text-center text-sm text-zinc-600">
              Sin eventos para los filtros seleccionados
            </div>
          ) : (
            shown.map((event) => {
              const hasMeta = !!event.metadata && Object.keys(event.metadata).length > 0
              const isOpen = expandedIds.has(event.id)
              return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                whileHover={reduce ? undefined : { scale: 1.015, transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] } }}
                role={hasMeta ? 'button' : undefined}
                tabIndex={hasMeta ? 0 : undefined}
                aria-expanded={hasMeta ? isOpen : undefined}
                aria-label={
                  hasMeta
                    ? `Evento ${event.type}: ${isOpen ? 'ocultar' : 'mostrar'} metadata`
                    : undefined
                }
                onClick={hasMeta ? () => toggleExpanded(event.id) : undefined}
                onKeyDown={
                  hasMeta
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggleExpanded(event.id)
                        }
                      }
                    : undefined
                }
                className={`flex items-start gap-3 rounded-2xl border px-3 py-2.5 hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:hover:shadow-none ${
                  LEVEL_STYLES[event.level.toLowerCase()] ?? LEVEL_STYLES.info
                } ${
                  hasMeta
                    ? 'cursor-pointer select-none transition-colors hover:brightness-110 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/40'
                    : ''
                }`}
              >
                <span className="text-xs mt-0.5 shrink-0 opacity-70">
                  {LEVEL_ICONS[event.level.toLowerCase()]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider opacity-50">
                    <span className="font-mono">{event.type}</span>
                    <span className="ml-auto font-mono shrink-0">{formatTime(event.createdAt)}</span>
                  </div>
                  <div className="text-sm mt-0.5">{event.message}</div>
                  {event.conversationPath && (
                    <div className="text-[10px] opacity-40 mt-1 font-mono">
                      {event.conversationPath} · session:{' '}
                      {event.conversationSession?.slice(0, 12)}…
                    </div>
                  )}
                  {/* Toggle por banner completo. Cualquier control interactivo que
                      se agregue dentro del banner DEBE llamar e.stopPropagation()
                      en onClick (y onKeyDown Enter/Espacio) para no disparar el
                      toggle de metadata. Hoy no hay controles interactivos acá. */}
                  {hasMeta && (
                    <>
                      <div className="text-[10px] opacity-40 mt-1 select-none">
                        {isOpen ? '▾ metadata' : '▸ metadata'}
                      </div>
                      {isOpen && (
                        // select-text: el banner usa select-none para el toggle;
                        // el JSON debe seguir siendo seleccionable/copiable.
                        <pre
                          className="text-[10px] mt-1 opacity-60 overflow-x-auto select-text"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {JSON.stringify(event.metadata, null, 2)}
                        </pre>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {hasMore && (
        <button
          onClick={() => setVisibleCount((c) => c + 50)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
        >
          Cargar más ({filtered.length - shown.length} restantes)
        </button>
      )}
    </div>
  )
}
