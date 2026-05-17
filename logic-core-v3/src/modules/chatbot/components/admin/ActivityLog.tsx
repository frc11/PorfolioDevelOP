'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

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

const LEVEL_STYLES = {
  info: 'border-zinc-700 bg-zinc-900/40 text-zinc-200',
  warn: 'border-amber-500/30 bg-amber-500/5 text-amber-200',
  error: 'border-red-500/30 bg-red-500/5 text-red-200',
  debug: 'border-zinc-800 bg-zinc-950/40 text-zinc-400',
}

const LEVEL_ICONS = {
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
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
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

  const dateStr = date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
  return `${dateStr}, ${time}`
}

export function ActivityLog({ initialEvents, slug }: ActivityLogProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents)
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings'>('all')
  const lastFetchRef = useRef<string>(new Date().toISOString())

  // Poll every 3s
  useEffect(() => {
    if (paused) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/admin/chatbot/events?slug=${slug}&since=${encodeURIComponent(lastFetchRef.current)}`
        )
        const data = await res.json()
        if (data.events && data.events.length > 0) {
          setEvents((prev) => {
            const seen = new Set(prev.map((e) => e.id))
            const newOnes = data.events.filter((e: ActivityEvent) => !seen.has(e.id))
            return [...newOnes.reverse(), ...prev].slice(0, 200) // Keep last 200
          })
          lastFetchRef.current = data.serverTime
        } else {
          lastFetchRef.current = data.serverTime
        }
      } catch (error) {
        // Silenced: polling failures during navigation are expected and non-critical
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [paused, slug])

  const visibleEvents = events.filter((e) => {
    if (filter === 'errors') return e.level === 'error'
    if (filter === 'warnings') return e.level === 'warn' || e.level === 'error'
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPaused(!paused)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            paused
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
          }`}
        >
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>

        <div className="flex gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          {(['all', 'warnings', 'errors'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs ${
                filter === f ? 'bg-cyan-500 text-black font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="ml-auto text-xs text-zinc-500 font-mono">
          {visibleEvents.length} events {paused && '(paused)'}
        </div>
      </div>

      {/* Event stream */}
      <div className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {visibleEvents.length === 0 ? (
            <div className="text-center py-16 text-zinc-600 text-sm">
              No hay eventos todavía. Esperando actividad del bot...
            </div>
          ) : (
            visibleEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 px-3 py-2 rounded-lg border ${
                  LEVEL_STYLES[event.level]
                }`}
              >
                <span className="text-xs mt-0.5 shrink-0">{LEVEL_ICONS[event.level]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider opacity-60">
                    <span className="font-mono">{event.type}</span>
                    <span className="ml-auto font-mono">{formatTime(event.createdAt)}</span>
                  </div>
                  <div className="text-sm mt-0.5">{event.message}</div>
                  {event.conversationPath && (
                    <div className="text-[10px] opacity-50 mt-1 font-mono">
                      {event.conversationPath} · session: {event.conversationSession?.slice(0, 12)}…
                    </div>
                  )}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <details className="mt-1">
                      <summary className="text-[10px] opacity-50 cursor-pointer">metadata</summary>
                      <pre className="text-[10px] mt-1 opacity-70 overflow-x-auto">
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
