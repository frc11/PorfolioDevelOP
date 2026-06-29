import type { ReactNode } from 'react'
import { adminHoverCls } from '@/lib/hover'
import { cn } from '@/lib/utils'

/**
 * Wrapper de hover del admin para Resultados. El hover (scale + ring + glow +
 * motion-reduce) vive AFUERA: el hijo conserva su borde/bg/padding. Patrón canon
 * para envolver primitivas que no se tocan (StatCard) o cards hand-rolled.
 *
 * El `className` DEBE incluir el mismo `rounded-*` que el hijo para que el ring y
 * la sombra del hover coincidan con el radio de la card. Para cards con chart de
 * recharts usar `chartCardHoverCls` (variante sin scale) en su lugar — el
 * transform:scale desincroniza el tooltip del cursor.
 */
export function HoverCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('grid', adminHoverCls, className)}>{children}</div>
}
