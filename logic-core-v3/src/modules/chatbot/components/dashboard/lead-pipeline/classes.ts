import { Flame, TrendingUp, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { LeadWithScore } from '../ClientLeadsTable'

export type LeadClass = 'hot' | 'warm' | 'cold'

/** Orden de las columnas, de mayor a menor prioridad comercial. */
export const CLASS_ORDER: readonly LeadClass[] = ['hot', 'warm', 'cold']

/**
 * Label + gradiente del header de cada columna. Espeja el `statusTone` del
 * pipeline admin (`admin/leads/_components/lead-pipeline.shared.ts`) pero por
 * CLASIFICACIÓN en vez de estado de embudo. Los colores (rose/amber/sky) son los
 * mismos que ya usan los chips de calidad y el badge XL de BusinessLeadCard, para
 * que la columna y la card hablen el mismo idioma cromático.
 */
export const CLASS_META: Record<LeadClass, { label: string; icon: LucideIcon; tone: string }> = {
  hot: { label: 'Calientes', icon: Flame, tone: 'from-rose-400/20 to-rose-400/5 text-rose-100' },
  warm: { label: 'Tibios', icon: TrendingUp, tone: 'from-amber-400/20 to-amber-400/5 text-amber-100' },
  cold: { label: 'Fríos', icon: Minus, tone: 'from-sky-400/20 to-sky-400/5 text-sky-100' },
}

export type GroupedByClass = Record<LeadClass, LeadWithScore[]>

/**
 * Agrupa por clasificación efectiva preservando el orden de entrada (la lista ya
 * viene ordenada por score efectivo desc desde el server). null o 'dq' caen en
 * Fríos (menor prioridad); en la vista comercial los 'dq' ya vienen excluidos
 * server-side, así que en la práctica sólo cae acá algún lead sin score aún.
 */
export function groupByClassification(leads: LeadWithScore[]): GroupedByClass {
  const groups: GroupedByClass = { hot: [], warm: [], cold: [] }
  for (const lead of leads) {
    const c = lead.effectiveClassification
    if (c === 'hot' || c === 'warm' || c === 'cold') groups[c].push(lead)
    else groups.cold.push(lead)
  }
  return groups
}
