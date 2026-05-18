'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Select } from '@/components/ui'

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

const EVENT_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'chat', label: 'Chat' },
  { value: 'lead', label: 'Lead' },
  { value: 'error', label: 'Errores' },
  { value: 'quota', label: 'Quota' },
  { value: 'config', label: 'Config' },
]

const SEVERITY_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'debug', label: 'Debug' },
]

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
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents)
  const [paused, setPaused] = useState(false)
  const [levelFilter, setLevelFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const lastFetchRef = useRef<string>(new Date().toISOString())

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
            return [...newOnes.reverse(), ...prev].slice(0, 200)
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

  const visibleEvents = events.filter((e) => {
    if (levelFilter && e.level !== levelFilter) return false
    if (typeFilter && !e.type.toLowerCase().includes(typeFilter)) return false
    if (fromDate && new Date(e.createdAt) < new Date(fromDate)) return false
    if (toDate && new Date(e.createdAt) > new Date(`${toDate}T23:59:59`)) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-3">Filtros</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={EVENT_TYPES}
          />
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            options={SEVERITY_OPTIONS}
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 focus:border-cyan-400/30 focus:outline-none [color-scheme:dark]"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 focus:border-cyan-400/30 focus:outline-none [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPaused(!paused)}
          className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition-colors ${
            paused
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {paused ? '▶ Reanudar' : '⏸ Pausar'}
        </button>

        <div className="ml-auto text-xs text-zinc-600 font-mono">
          {visibleEvents.length} eventos{paused ? ' (pausado)' : ''}
        </div>
      </div>

      {/* Event stream */}
      <div className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {visibleEvents.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.02] py-16 text-center text-sm text-zinc-600">
              Sin eventos para los filtros seleccionados
            </div>
          ) : (
            visibleEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={`flex items-start gap-3 rounded-2xl border px-3 py-2.5 ${
                  LEVEL_STYLES[event.level] ?? LEVEL_STYLES.info
                }`}
              >
                <span className="text-xs mt-0.5 shrink-0 opacity-70">
                  {LEVEL_ICONS[event.level]}
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
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <details className="mt-1">
                      <summary className="text-[10px] opacity-40 cursor-pointer select-none">
                        metadata
                      </summary>
                      <pre className="text-[10px] mt-1 opacity-60 overflow-x-auto">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
