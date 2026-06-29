import { Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ResultEmptyState } from '../_shared/ResultEmptyState'

/**
 * P0.2 — Empty state honesto por sección: cuenta el potencial de la sección sin
 * inventar datos ni dejar el hueco crudo. Reconciliado al empty canon del admin
 * (punteado + muted) vía `ResultEmptyState` (D1): mismo lenguaje que el resto de
 * los empties de Resultados. Server-safe (sin motion).
 */
export function CalibratingBlock({
  icon = Sparkles,
  title,
  description,
}: {
  icon?: LucideIcon
  title: string
  description: string
}) {
  return <ResultEmptyState icon={icon} title={title} description={description} />
}
