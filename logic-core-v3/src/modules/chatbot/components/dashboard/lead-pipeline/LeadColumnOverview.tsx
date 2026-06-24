'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Inbox, X } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useIsClient } from '@/lib/use-is-client'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { CLASS_META, type LeadClass } from './classes'
import type { LeadWithScore } from '../ClientLeadsTable'

// === TUNABLES ===
const OVERVIEW_DURATION = 0.24 // s — apertura/cierre (<300ms)
const OVERVIEW_SCALE_FROM = 0.96
const OVERVIEW_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

type LeadColumnOverviewProps = {
  /** Clase de la columna abierta, o null si el overlay está cerrado. */
  leadClass: LeadClass | null
  leads: LeadWithScore[]
  /** Render de cada card (compartido con las columnas). */
  renderCard: (lead: LeadWithScore) => ReactNode
  onClose: () => void
}

/**
 * Overlay fullscreen con TODOS los contactos de una columna, scrolleable.
 * Portalizado a `document.body` (createPortal + gate useIsClient) para escapar el
 * containing block del `<main>` del dashboard (el backdrop-filter del layout
 * atrapa cualquier position:fixed descendiente). Cierra con X, click en el
 * backdrop y Esc; foco inicial + trap + restore. Porta `ColumnOverview` del admin
 * sin el drag-and-drop.
 */
export function LeadColumnOverview({ leadClass, leads, renderCard, onClose }: LeadColumnOverviewProps) {
  const isClient = useIsClient()
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const open = leadClass !== null

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
      {leadClass !== null ? (
        <motion.div
          key="lead-column-overview"
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
            aria-label={`Todos los contactos ${CLASS_META[leadClass].label}`}
            onClick={(event) => event.stopPropagation()}
            initial={reduced ? false : { opacity: 0, scale: OVERVIEW_SCALE_FROM }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: OVERVIEW_SCALE_FROM }}
            transition={reduced ? { duration: 0 } : { duration: OVERVIEW_DURATION, ease: OVERVIEW_EASE }}
            className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0c1016]/95 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            <div
              className={cn(
                'flex items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-br px-6 py-5',
                CLASS_META[leadClass].tone,
              )}
            >
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Contactos</p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {CLASS_META[leadClass].label}
                  <span className="ml-2 text-sm font-normal text-white/60">({leads.length})</span>
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
              {leads.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {leads.map((lead) => renderCard(lead))}
                </div>
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="Sin contactos en esta columna"
                  description="Cuando lleguen contactos de este nivel van a aparecer acá."
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
