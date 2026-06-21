'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type StepAnchorProps = {
  /** true si esta sección es el paso activo del lead — la única que se enfoca. */
  active: boolean
  /**
   * Id del lead. Cambia al recorrer la cola (prev/next) → re-dispara el enfoque
   * sobre el lead nuevo. NO cambia en un `router.refresh()` → no re-scrollea en
   * cada autosave; sí cuando el lead avanza de stage (vía `active`).
   */
  leadId: string
  children: ReactNode
}

/**
 * Envuelve una sección del wizard y, si es el paso activo, la trae al viewport
 * al abrir el lead — así el setter cae donde está el trabajo, no arriba de todo.
 *
 * - Solo presentación: NO toca gates ni stage. El "paso activo" lo decide el
 *   stepper canónico (`pasoActual`); acá solo se aterriza el foco.
 * - Robusto a la duplicación responsive del wizard (una copia vive bajo un
 *   ancestro `display:none`): esa copia tiene `offsetParent === null`, su scroll
 *   es no-op → solo se enfoca la copia visible. No depende de `id`/getElementById.
 * - `scroll-mt` deja la cabecera por debajo del recorrido sticky (modo cola) y
 *   da aire en modo isla.
 */
export function StepAnchor({ active, leadId, children }: StepAnchorProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const el = ref.current
    // offsetParent null = la copia bajo `display:none`; scrollearla no haría nada.
    // (También sería null si el wrapper o un ancestro fuera `position:fixed` — hoy
    // ninguno lo es; si eso cambiara, revisar esta guarda.)
    if (!el || el.offsetParent === null) return
    el.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [active, leadId])

  return (
    <div ref={ref} className="scroll-mt-24">
      {children}
    </div>
  )
}
