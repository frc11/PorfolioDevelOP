import type { ServiceType } from '@prisma/client'
import type { ProjectCardData } from './project-card'

// Vocabulario canónico de filtros del lane (servicio / visibilidad / período) +
// helpers puros de filtrado en memoria. Todo client-side: la página ya no navega
// por searchParams; el board mantiene el estado en useState y filtra acá.

export type ServiceFilter = 'ALL' | ServiceType

export const SERVICE_OPTIONS: ReadonlyArray<{ value: ServiceFilter; label: string }> = [
  { value: 'ALL', label: 'Todos los servicios' },
  { value: 'WEB_DEV', label: 'Web' },
  { value: 'AI', label: 'AI' },
  { value: 'AUTOMATION', label: 'Automation' },
  { value: 'SOFTWARE', label: 'Software' },
]

export type VisibilityFilter = 'ALL' | 'CLIENT' | 'INTERNAL'

export const VISIBILITY_OPTIONS: ReadonlyArray<{ value: VisibilityFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'CLIENT', label: 'Con cliente' },
  { value: 'INTERNAL', label: 'Internos' },
]

export type PeriodFilter = '1w' | '1m' | '6m' | '1y' | 'custom'

export const PERIOD_OPTIONS: ReadonlyArray<{ value: PeriodFilter; label: string }> = [
  { value: '1w', label: 'Última semana' },
  { value: '1m', label: 'Último mes' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último año' },
  { value: 'custom', label: 'Personalizado' },
]

export const DEFAULT_PERIOD: PeriodFilter = '6m'

export type ProjectFilters = {
  service: ServiceFilter
  visibility: VisibilityFilter
  period: PeriodFilter
  from: string
  to: string
}

export const DEFAULT_FILTERS: ProjectFilters = {
  service: 'ALL',
  visibility: 'ALL',
  period: DEFAULT_PERIOD,
  from: '',
  to: '',
}

export function isServiceFilter(value: string): value is ServiceFilter {
  return SERVICE_OPTIONS.some((option) => option.value === value)
}

export function isVisibilityFilter(value: string): value is VisibilityFilter {
  return VISIBILITY_OPTIONS.some((option) => option.value === value)
}

export function isPeriodFilter(value: string): value is PeriodFilter {
  return PERIOD_OPTIONS.some((option) => option.value === value)
}

export function periodStart(period: PeriodFilter): Date | null {
  const start = new Date()

  switch (period) {
    case '1w':
      start.setDate(start.getDate() - 7)
      return start
    case '1m':
      start.setMonth(start.getMonth() - 1)
      return start
    case '6m':
      start.setMonth(start.getMonth() - 6)
      return start
    case '1y':
      start.setFullYear(start.getFullYear() - 1)
      return start
    case 'custom':
      return null
  }
}

// 'YYYY-MM-DD' → borde de día LOCAL (start o end) en ms. Mismo criterio para
// `from`/`to`, así no se mezclan UTC y local en la comparación del rango.
function localDayBoundary(value: string, edge: 'start' | 'end'): number | null {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return null
  }

  return edge === 'start'
    ? new Date(year, month - 1, day, 0, 0, 0, 0).getTime()
    : new Date(year, month - 1, day, 23, 59, 59, 999).getTime()
}

// Filtra por la FECHA DE INICIO del proyecto. Inicio dentro de [desde, hasta]
// inclusive entra; el resto no. Inicio nulo queda EXCLUIDO de los filtros de
// fecha (hasta que exista la columna real + backfill).
export function matchesPeriod(
  startDate: string | null,
  period: PeriodFilter,
  from: string,
  to: string
): boolean {
  if (!startDate) {
    return false
  }

  const start = new Date(startDate).getTime()
  if (!Number.isFinite(start)) {
    return false
  }

  if (period === 'custom') {
    if (from) {
      const fromMs = localDayBoundary(from, 'start')
      if (fromMs !== null && start < fromMs) {
        return false
      }
    }
    if (to) {
      const toMs = localDayBoundary(to, 'end')
      if (toMs !== null && start > toMs) {
        return false
      }
    }
    return true
  }

  const windowStart = periodStart(period)
  return windowStart ? start >= windowStart.getTime() : true
}

type FilterableProject = Pick<ProjectCardData, 'serviceType' | 'organizationId' | 'startDate'>

// Combina servicio AND visibilidad AND período sobre la lista completa.
export function filterProjects<T extends FilterableProject>(
  projects: T[],
  filters: ProjectFilters
): T[] {
  return projects.filter((project) => {
    const matchesService =
      filters.service === 'ALL' ? true : project.serviceType === filters.service

    const matchesVisibility =
      filters.visibility === 'ALL'
        ? true
        : filters.visibility === 'CLIENT'
          ? project.organizationId !== null
          : project.organizationId === null

    return (
      matchesService &&
      matchesVisibility &&
      matchesPeriod(project.startDate, filters.period, filters.from, filters.to)
    )
  })
}
