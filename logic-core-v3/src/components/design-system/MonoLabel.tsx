import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { accentBgClass, type ServiceAccent } from './accent'

interface MonoLabelProps {
  children: ReactNode
  /** Acento del tick. Sin acento no se pinta ningún tick. */
  accent?: ServiceAccent
  /** Cuadrado de 6px antes del texto. Decorativo. */
  tick?: boolean
  className?: string
}

/**
 * Etiqueta chica mono, en línea: CASO REAL, DEMO CONCEPTUAL, timelines.
 *
 * A diferencia de `Eyebrow` —que es el kicker de una sección— esta va pegada a
 * un contenido puntual y puede llevar un tick de color como única aparición del
 * acento en la vista.
 */
export function MonoLabel({ children, accent, tick = false, className }: MonoLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-ds-eyebrow uppercase text-ds-fg-muted',
        className,
      )}
    >
      {tick && accent ? (
        <span aria-hidden="true" className={cn('size-[6px] shrink-0', accentBgClass[accent])} />
      ) : null}
      {children}
    </span>
  )
}
