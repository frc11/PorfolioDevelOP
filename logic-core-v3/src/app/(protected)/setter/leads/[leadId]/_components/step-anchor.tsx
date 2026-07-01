'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StepAnchorProps = {
  /** true si esta sección es el paso activo del lead — la única que se enfoca. */
  active: boolean
  /**
   * Id del lead. Cambia al recorrer la cola (prev/next) → re-dispara el enfoque
   * sobre el lead nuevo. NO cambia en un `router.refresh()` → no re-scrollea en
   * cada autosave; sí cuando el lead avanza de stage (vía `active`).
   */
  leadId: string
  /**
   * Tono del marco cuando esta sección es la activa. `foco` (default) = cyan, hay
   * trabajo AHORA; `neutral` = activa pero sin acción del setter (en revisión) o
   * terminal (descartado) — sin cyan, por la disciplina B9. `none` = sin marco.
   * Solo presentación: deriva del mismo `stage` que el cartel de dirección, así el
   * marco y el cartel comparten color. NO toca el scroll ni el gateo del step.
   */
  frameTone?: 'foco' | 'neutral' | 'none'
  /**
   * Marca esta sección como destino de un `StepLink` (`data-step`). Solo
   * presentación: no toca el scroll-on-mount (eso lo decide `active`) ni el gateo.
   */
  anchorId?: string
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
 * - `scroll-mt` da aire arriba de la cabecera al aterrizar en el paso activo.
 */
export function StepAnchor({ active, leadId, frameTone = 'foco', anchorId, children }: StepAnchorProps) {
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

  // El paso activo se ELEVA sobre los demás (que ya se auto-atenúan cuando están
  // bloqueados/hechos): acento al borde + sombra. La barra va sobre el `<Card>` del
  // step (rounded-2xl, igual radio) sin tocar su markup. `aria-current="step"` para
  // que un lector de pantalla anuncie cuál es el paso activo.
  const enmarcado = active && frameTone !== 'none'

  return (
    <div
      ref={ref}
      data-step={anchorId}
      className="scroll-mt-24"
      aria-current={active ? 'step' : undefined}
    >
      {enmarcado ? (
        <div
          className={cn(
            // overflow-hidden recorta la barra al radio del Card (mismo patrón que el
            // cartel) — sin él, el borde recto de la barra asoma en las esquinas.
            'relative overflow-hidden rounded-2xl',
            frameTone === 'foco' && 'shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-0 left-0 z-10 w-1 rounded-l-2xl',
              frameTone === 'foco' ? 'bg-cyan-400/80' : 'bg-zinc-500/60',
            )}
          />
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}
