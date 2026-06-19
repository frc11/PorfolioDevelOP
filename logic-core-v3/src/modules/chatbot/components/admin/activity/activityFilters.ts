import { subMonths, subWeeks, subYears } from 'date-fns'

/**
 * Lógica + constantes de los filtros del activity-log. Componente propio del módulo
 * chatbot/admin: replica el patrón de presets de Leads (lead-filters.ts `periodBounds`),
 * NO importa de leads/_components ni de alerts/_components.
 */

export type ActivityDatePreset = 'all' | '1w' | '1m' | '6m' | '1y' | 'custom'

export interface ActivityFilters {
  type: string
  level: string
  period: ActivityDatePreset
  from: string
  to: string
}

export const DEFAULT_ACTIVITY_FILTERS: ActivityFilters = {
  type: '',
  level: '',
  period: '1w',
  from: '',
  to: '',
}

export const ACTIVITY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los tipos' },
  { value: 'chat', label: 'Chat' },
  { value: 'lead', label: 'Lead' },
  { value: 'error', label: 'Errores' },
  { value: 'quota', label: 'Quota' },
  { value: 'config', label: 'Config' },
]

export const ACTIVITY_LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'debug', label: 'Debug' },
]

export const ACTIVITY_PERIOD_OPTIONS: { value: ActivityDatePreset; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: '1w', label: 'Última semana' },
  { value: '1m', label: 'Último mes' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último año' },
  { value: 'custom', label: 'Personalizado' },
]

/** Réplica del patrón de Leads (lead-filters.ts), con date-fns. `null` = sin filtro de fecha. */
export function activityPeriodBounds(filters: ActivityFilters): { gte: Date; lte?: Date } | null {
  const now = new Date()
  switch (filters.period) {
    case 'all':
      return null // sin filtro de fecha — muestra todo
    case '1w':
      return { gte: subWeeks(now, 1) }
    case '1m':
      return { gte: subMonths(now, 1) }
    case '6m':
      return { gte: subMonths(now, 6) }
    case '1y':
      return { gte: subYears(now, 1) }
    case 'custom': {
      if (!filters.from || !filters.to) return null
      const gte = new Date(`${filters.from}T00:00:00.000`)
      const lte = new Date(`${filters.to}T23:59:59.999`)
      if (Number.isNaN(gte.getTime()) || Number.isNaN(lte.getTime())) return null
      return { gte, lte }
    }
    default:
      return null
  }
}

export interface ActivityFilterableEvent {
  type: string
  level: string
  createdAt: string
}

/**
 * Filtra client-side por tipo (substring), nivel (igualdad case-insensitive) y fecha.
 * El nivel se normaliza a minúscula acá para ser robusto a cualquier consumidor del
 * componente compartido: la página de activity lo manda en minúscula, pero la tab por-bot
 * de /admin/chatbots/[botId] (vía un loader vetado) lo manda en MAYÚSCULA del enum.
 */
export function filterActivityEvents<T extends ActivityFilterableEvent>(
  events: T[],
  filters: ActivityFilters,
): T[] {
  const bounds = activityPeriodBounds(filters)
  return events.filter((e) => {
    if (filters.level && e.level.toLowerCase() !== filters.level) return false
    if (filters.type && !e.type.toLowerCase().includes(filters.type)) return false
    if (bounds) {
      const ts = new Date(e.createdAt).getTime()
      if (ts < bounds.gte.getTime()) return false
      if (bounds.lte && ts > bounds.lte.getTime()) return false
    }
    return true
  })
}

export function isDefaultActivityFilters(filters: ActivityFilters): boolean {
  return (
    filters.type === DEFAULT_ACTIVITY_FILTERS.type &&
    filters.level === DEFAULT_ACTIVITY_FILTERS.level &&
    filters.period === DEFAULT_ACTIVITY_FILTERS.period &&
    filters.from === DEFAULT_ACTIVITY_FILTERS.from &&
    filters.to === DEFAULT_ACTIVITY_FILTERS.to
  )
}
