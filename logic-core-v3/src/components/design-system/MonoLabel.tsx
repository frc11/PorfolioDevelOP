import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { accentBgClass, accentTextClass, type ServiceAccent } from './accent'

interface MonoLabelProps {
  children: ReactNode
  /**
   * Acento de servicio. Pinta el TEXTO de la etiqueta, que es donde el acento
   * tiene área suficiente para identificar algo.
   *
   * Solo sobre tema oscuro: tres de los cuatro acentos no llegan a 3:1 sobre el
   * lienzo crema (cian 2.10, verde 2.19, ámbar 1.86). Ver la Regla del Acento
   * sobre Oscuro en DESIGN.md.
   */
  accent?: ServiceAccent
  /** Cuadrado de 6px antes del texto. Decorativo, y solo con `accent`. */
  tick?: boolean
  className?: string
}

/**
 * Etiqueta chica mono, en línea: CASO REAL, DEMO CONCEPTUAL, timelines.
 *
 * A diferencia de `Eyebrow` —que es el kicker de una sección— esta va pegada a
 * un contenido puntual, y es donde el acento de servicio se materializa.
 *
 * **La dosis mínima es de color, no de área.** El acento vivía en un único tick
 * de 6×6 px: 36 px² por fila, tan poco que sacarle el color a las cuatro filas
 * de servicios casi no perdía información — o sea que no identificaba nada.
 * Ahora se pinta el texto, que es superficie sólida y plana: más área, misma
 * disciplina. Sigue sin haber glow, gradiente ni borde lateral de acento — esas
 * anti-referencias son de forma, no de tamaño.
 */
export function MonoLabel({ children, accent, tick = false, className }: MonoLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-ds-mono text-ds-eyebrow uppercase',
        accent ? accentTextClass[accent] : 'text-ds-fg-muted',
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
