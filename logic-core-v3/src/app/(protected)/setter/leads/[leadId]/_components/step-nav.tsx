'use client'

import { ArrowUp } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StepLinkProps = {
  /** `data-step` del destino, dentro del mismo wizard (ver `StepAnchor`). */
  to: string
  children: ReactNode
  className?: string
}

/**
 * Lleva al setter a otra sección del wizard de un click — la "salida" concreta de
 * los gates que se resuelven mirando otro paso (en vez de describirla en prosa).
 *
 * - Reusa el aterrizaje por scroll del `StepAnchor` (mismo `scrollIntoView`), NO
 *   `router.push`: los pasos viven todos en la misma página, no son rutas.
 * - Resuelve el destino DENTRO de la copia visible del wizard (`closest`
 *   `[data-lead-wizard]`), así la duplicación responsive del shell no ambigua el
 *   destino; `offsetParent === null` además salta la copia bajo `display:none`.
 * - Solo presentación: no toca gates ni estado.
 */
export function StepLink({ to, children, className }: StepLinkProps) {
  const irAlPaso = (event: MouseEvent<HTMLButtonElement>) => {
    const raiz = event.currentTarget.closest('[data-lead-wizard]') ?? document
    const destinos = raiz.querySelectorAll<HTMLElement>(`[data-step="${to}"]`)
    for (const destino of destinos) {
      // offsetParent null = la copia bajo `display:none`; scrollearla no haría nada.
      if (destino.offsetParent !== null) {
        destino.scrollIntoView({ block: 'start', behavior: 'smooth' })
        return
      }
    }
  }

  return (
    <button
      type="button"
      onClick={irAlPaso}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40',
        className,
      )}
    >
      <ArrowUp size={12} strokeWidth={1.5} aria-hidden />
      {children}
    </button>
  )
}
