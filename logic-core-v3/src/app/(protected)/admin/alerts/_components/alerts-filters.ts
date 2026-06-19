import { subMonths, subWeeks, subYears } from 'date-fns'

// Lógica pura del filtro de fecha de /admin/alerts (client-side, sobre las
// alertas ya cargadas). Separada de la UI igual que lead-filters.ts ↔
// lead-filters-bar.tsx. Patrón de presets replicado de Proyectos/Leads.

export type AlertPeriod = 'all' | '1w' | '1m' | '6m' | '1y' | 'custom'

export interface DateFilterState {
  period: AlertPeriod
  /** 'YYYY-MM-DD' (valor de <input type="date">), solo para period === 'custom'. */
  from: string
  to: string
}

export const ALERT_PERIOD_OPTIONS: ReadonlyArray<{ value: AlertPeriod; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: '1w', label: 'Última semana' },
  { value: '1m', label: '1 mes' },
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 año' },
  { value: 'custom', label: 'Personalizado' },
]

// Default: última semana, para no mostrar todas las alertas de una.
export const DEFAULT_DATE_FILTER: DateFilterState = { period: '1w', from: '', to: '' }

function windowStart(period: AlertPeriod, now: Date): Date | null {
  switch (period) {
    case '1w':
      return subWeeks(now, 1)
    case '1m':
      return subMonths(now, 1)
    case '6m':
      return subMonths(now, 6)
    case '1y':
      return subYears(now, 1)
    default:
      return null
  }
}

/**
 * ¿La alerta (por su createdAt) cae dentro del filtro de fecha?
 * - 'all' → siempre true.
 * - preset → createdAt >= inicio de la ventana hacia atrás.
 * - 'custom' → entre from (00:00) y to (23:59); si el rango está incompleto,
 *   no filtra (true) para no vaciar la vista mientras el usuario tipea.
 */
export function matchesDateFilter(
  createdAt: Date | string,
  filter: DateFilterState,
  now: Date,
): boolean {
  if (filter.period === 'all') return true

  const time = new Date(createdAt).getTime()
  if (!Number.isFinite(time)) return false

  if (filter.period === 'custom') {
    if (!filter.from || !filter.to) return true
    const gte = new Date(`${filter.from}T00:00:00.000`).getTime()
    const lte = new Date(`${filter.to}T23:59:59.999`).getTime()
    if (!Number.isFinite(gte) || !Number.isFinite(lte)) return true
    return time >= gte && time <= lte
  }

  const start = windowStart(filter.period, now)
  return start ? time >= start.getTime() : true
}
