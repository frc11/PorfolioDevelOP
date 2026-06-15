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

export const DEFAULT_PERIOD: PeriodFilter = '1m'

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

export function matchesPeriod(
  lastActivityAt: string | null,
  period: PeriodFilter,
  from: string,
  to: string
): boolean {
  // Sin señal de actividad → no se filtra por período (no se oculta el proyecto).
  if (!lastActivityAt) {
    return true
  }

  const activity = new Date(lastActivityAt).getTime()

  if (period === 'custom') {
    if (from) {
      const fromTime = new Date(from).getTime()
      if (Number.isFinite(fromTime) && activity < fromTime) {
        return false
      }
    }
    if (to) {
      const toTime = new Date(`${to}T23:59:59.999`).getTime()
      if (Number.isFinite(toTime) && activity > toTime) {
        return false
      }
    }
    return true
  }

  const start = periodStart(period)
  return start ? activity >= start.getTime() : true
}

type FilterableProject = Pick<ProjectCardData, 'serviceType' | 'organizationId' | 'lastActivityAt'>

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
      matchesPeriod(project.lastActivityAt, filters.period, filters.from, filters.to)
    )
  })
}
