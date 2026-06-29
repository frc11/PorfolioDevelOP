'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Inbox, X } from 'lucide-react'
import { EmptyStateMuted } from '@/components/ui/EmptyStateMuted'
import { useIsClient } from '@/lib/use-is-client'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import type { AlertRow } from './alert-types'

// === TUNABLES ===
const OVERVIEW_DURATION = 0.24 // s — apertura/cierre (<300ms)
const OVERVIEW_SCALE_FROM = 0.96
const OVERVIEW_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

interface AlertColumnOverviewProps {
  /** Etiqueta de la columna abierta, o null si está cerrado. */
  title: string | null
  alerts: AlertRow[]
  /** Render de cada card (el mismo que usa la columna). Provisto por el padre. */
  renderCard: (alert: AlertRow) => ReactNode
  onClose: () => void
}

/**
 * Overlay fullscreen con TODAS las alertas (filtradas) de una columna, scrolleable.
 * Portalizado a document.body (createPortal + gate useIsClient) para escapar el
 * containing block del <main> admin. Cierra con X, click en backdrop y Esc; foco
 * inicial + trap + restore. Patrón replicado de leads/column-overview.tsx.
 */
export function AlertColumnOverview({ title, alerts, renderCard, onClose }: AlertColumnOverviewProps) {
  const isClient = useIsClient()
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const open = title !== null

  useEffect(() => {
    if (!open) {
      return
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus()

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (!focusables || focusables.length === 0) {
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!isClient) {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {title !== null ? (
        <motion.div
          key="alert-column-overview"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md sm:p-6"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? { duration: 0 } : { duration: OVERVIEW_DURATION, ease: OVERVIEW_EASE }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Todas las alertas en ${title}`}
            onClick={(event) => event.stopPropagation()}
            initial={reduced ? false : { opacity: 0, scale: OVERVIEW_SCALE_FROM }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: OVERVIEW_SCALE_FROM }}
            transition={reduced ? { duration: 0 } : { duration: OVERVIEW_DURATION, ease: OVERVIEW_EASE }}
            className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0c1016]/95 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.02] px-6 py-5">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Alertas</p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {title}
                  <span className="ml-2 text-sm font-normal text-white/60">({alerts.length})</span>
                </h2>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar vista de columna"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-300 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {alerts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {alerts.map((alert) => renderCard(alert))}
                </div>
              ) : (
                <EmptyStateMuted
                  icon={Inbox}
                  title="Sin alertas en esta columna"
                  description="No hay alertas que coincidan con los filtros actuales."
                  className="py-10"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
