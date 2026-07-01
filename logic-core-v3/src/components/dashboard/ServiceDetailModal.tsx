'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Lock, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useIsClient } from '@/lib/use-is-client'
import { useReducedMotion } from '@/lib/use-reduced-motion'

// === TUNABLES === (apertura/cierre <300ms, ease de la ola)
const MODAL_DURATION = 0.24
const MODAL_SCALE_FROM = 0.96
const MODAL_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export interface ServiceDetailModalProps {
  open: boolean
  onClose: () => void
  /** Nombre del módulo premium. */
  name: string
  /** Descripción general (longDescription real o preset de fallback). */
  longDescription: string
  /** Ícono ya resuelto por la card (evita duplicar el ICON_MAP). */
  icon: LucideIcon
  /** Accent del módulo (mismo color que la card). */
  accentColor: string
  /** Precio mensual en USD. */
  priceMonthlyUsd: number
  /** Etiqueta de tier ya resuelta (eyebrow del header). */
  tierLabel: string
  /** Si el módulo aún no está a la venta → footer "Próximamente" en vez de precio. */
  isComingSoon: boolean
  /** Si la org ya tiene el módulo → no mostrar precio (paridad con la card owned:
   *  no se ofrece contratar lo que ya es suyo). */
  isOwned?: boolean
}

/**
 * Modal de detalle de un módulo premium — SOLO presentacional.
 *
 * Portalizado a `document.body` (createPortal + gate `useIsClient`) para escapar el
 * containing block del `<main>` del dashboard: su `backdrop-filter` atrapa cualquier
 * `position:fixed` descendiente y el overlay no llegaría a cubrir el viewport. Mismo
 * patrón que `LeadColumnOverview` (lead-pipeline). Cierra con X, click en el backdrop
 * y Esc; foco inicial + trap + restore; `aria-modal` + `role="dialog"`.
 *
 * No importa Prisma ni server actions ni el contrato de upsell: la card resuelve los
 * datos y se los pasa ya listos.
 */
export function ServiceDetailModal({
  open,
  onClose,
  name,
  longDescription,
  icon: Icon,
  accentColor,
  priceMonthlyUsd,
  tierLabel,
  isComingSoon,
  isOwned = false,
}: ServiceDetailModalProps) {
  const isClient = useIsClient()
  const reduced = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

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
      {open ? (
        <motion.div
          key="service-detail-modal"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#05070a]/80 p-4 backdrop-blur-md sm:p-6"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? { duration: 0 } : { duration: MODAL_DURATION, ease: MODAL_EASE }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle del módulo ${name}`}
            onClick={(event) => event.stopPropagation()}
            initial={reduced ? false : { opacity: 0, scale: MODAL_SCALE_FROM }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: MODAL_SCALE_FROM }}
            transition={reduced ? { duration: 0 } : { duration: MODAL_DURATION, ease: MODAL_EASE }}
            className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#0c1016]/95 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          >
            {/* Glow accent estático (mismo lenguaje que la card). */}
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-[60px]"
              style={{ background: accentColor }}
            />

            {/* Header: icon-chip + tier + nombre + badge / cerrar */}
            <div className="relative z-10 flex items-start justify-between gap-4 border-b border-white/10 p-6">
              <div className="flex min-w-0 items-start gap-3.5">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: `${accentColor}1A`,
                    border: `1px solid ${accentColor}33`,
                    boxShadow: `0 0 16px ${accentColor}26`,
                    color: accentColor,
                  }}
                >
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    {tierLabel}
                  </p>
                  <h2 className="mt-0.5 text-lg font-semibold leading-snug text-white">{name}</h2>
                  <span
                    className={[
                      'mt-2 inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]',
                      isComingSoon
                        ? 'border-amber-400/20 bg-amber-500/10 text-amber-200'
                        : 'border-white/10 bg-white/5 text-zinc-300',
                    ].join(' ')}
                  >
                    {isComingSoon ? null : <Lock size={9} />}
                    {isComingSoon ? 'Próximamente Q3 2026' : 'Premium'}
                  </span>
                </div>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar detalle del módulo"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-300 transition-colors hover:text-white"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Cuerpo: descripción general */}
            <div className="relative z-10 flex-1 overflow-y-auto p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Descripción general
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{longDescription}</p>
            </div>

            {/* Footer: precio (o nota de "próximamente") */}
            <div className="relative z-10 border-t border-white/10 p-6">
              {isComingSoon ? (
                <p className="text-xs font-medium leading-6 text-amber-200/90">
                  Estamos preparando este módulo para el catálogo comercial. Te avisamos apenas esté
                  disponible para contratar.
                </p>
              ) : isOwned ? (
                <p className="text-xs font-medium leading-6 text-emerald-200/90">
                  Ya lo tenés activo en tu cuenta.
                </p>
              ) : (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-600">
                    Desde
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-none tabular-nums text-white">
                    ${priceMonthlyUsd}{' '}
                    <span className="text-xs font-medium text-zinc-500">USD/mes</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
