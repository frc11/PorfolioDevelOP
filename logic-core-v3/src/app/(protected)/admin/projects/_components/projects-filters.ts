import type { ServiceType } from '@prisma/client'
import type { ProjectCardData } from './project-card'

// Vocabulario canónico de filtros del lane + helpers puros de filtrado en
// memoria. Dos filtros de fecha: INICIO (ventana hacia atrás sobre el startDate
// derivado) y ENTREGA (ventana hacia adelante sobre estimatedEndDate, columna
// real). Todo client-side: el board mantiene el estado y filtra acá.

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

// Unión compartida por los dos filtros de fecha. Las option-lists de abajo
// limitan qué valores ofrece cada uno; las funciones de match interpretan el
// período según el filtro (inicio hacia atrás, entrega hacia adelante).
export type PeriodValue = 'all' | '1w' | '1m' | '3m' | '6m' | '1y' | 'custom'

export const START_PERIOD_OPTIONS: ReadonlyArray<{ value: PeriodValue; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: '1w', label: 'Última semana' },
  { value: '1m', label: 'Último mes' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último año' },
  { value: 'custom', label: 'Personalizado' },
]

export const DELIVERY_PERIOD_OPTIONS: ReadonlyArray<{ value: PeriodValue; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: '1w', label: 'Próxima semana' },
  { value: '1m', label: 'Próximo mes' },
  { value: '3m', label: 'Próximos 3 meses' },
  { value: 'custom', label: 'Personalizado' },
]

export type DateFilter = {
  period: PeriodValue
  from: string
  to: string
}

export type ProjectFilters = {
  service: ServiceFilter
  visibility: VisibilityFilter
  start: DateFilter
  delivery: DateFilter
}

export const DEFAULT_FILTERS: ProjectFilters = {
  service: 'ALL',
  visibility: 'ALL',
  start: { period: '6m', from: '', to: '' },
  delivery: { period: 'all', from: '', to: '' },
}

export function isServiceFilter(value: string): value is ServiceFilter {
  return SERVICE_OPTIONS.some((option) => option.value === value)
}

export function isVisibilityFilter(value: string): value is VisibilityFilter {
  return VISIBILITY_OPTIONS.some((option) => option.value === value)
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

function withinCustomRange(time: number, from: string, to: string): boolean {
  if (from) {
    const fromMs = localDayBoundary(from, 'start')
    if (fromMs !== null && time < fromMs) {
      return false
    }
  }
  if (to) {
    const toMs = localDayBoundary(to, 'end')
    if (toMs !== null && time > toMs) {
      return false
    }
  }
  return true
}

function startOfToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

// Inicio del rango hacia ATRÁS desde hoy (filtro de inicio).
function backwardWindowStart(period: PeriodValue): Date | null {
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
    default:
      return null
  }
}

// Fin del rango hacia ADELANTE desde hoy (filtro de entrega).
function forwardWindowEnd(period: PeriodValue): Date | null {
  const end = startOfToday()

  switch (period) {
    case '1w':
      end.setDate(end.getDate() + 7)
      break
    case '1m':
      end.setMonth(end.getMonth() + 1)
      break
    case '3m':
      end.setMonth(end.getMonth() + 3)
      break
    default:
      return null
  }

  end.setHours(23, 59, 59, 999)
  return end
}

// INICIO: ventana hacia atrás sobre el startDate (derivado). 'all' → no filtra;
// inicio nulo queda EXCLUIDO de los rangos (visible sólo en 'all').
export function matchesStart(startDate: string | null, filter: DateFilter): boolean {
  if (filter.period === 'all') {
    return true
  }
  if (!startDate) {
    return false
  }

  const time = new Date(startDate).getTime()
  if (!Number.isFinite(time)) {
    return false
  }

  if (filter.period === 'custom') {
    return withinCustomRange(time, filter.from, filter.to)
  }

  const windowStart = backwardWindowStart(filter.period)
  return windowStart ? time >= windowStart.getTime() : true
}

// ENTREGA: ventana hacia adelante [hoy, hoy+ventana] sobre estimatedEndDate
// (columna real). 'all' → no filtra; entrega nula EXCLUIDA de los rangos.
export function matchesDelivery(estimatedEndDate: string | null, filter: DateFilter): boolean {
  if (filter.period === 'all') {
    return true
  }
  if (!estimatedEndDate) {
    return false
  }

  const time = new Date(estimatedEndDate).getTime()
  if (!Number.isFinite(time)) {
    return false
  }

  if (filter.period === 'custom') {
    return withinCustomRange(time, filter.from, filter.to)
  }

  const windowEnd = forwardWindowEnd(filter.period)
  return time >= startOfToday().getTime() && (windowEnd ? time <= windowEnd.getTime() : true)
}

type FilterableProject = Pick<
  ProjectCardData,
  'serviceType' | 'isInternal' | 'startDate' | 'estimatedEndDate'
>

// Combina servicio AND visibilidad AND inicio AND entrega sobre la lista completa.
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
          ? !project.isInternal
          : project.isInternal === true

    return (
      matchesService &&
      matchesVisibility &&
      matchesStart(project.startDate, filters.start) &&
      matchesDelivery(project.estimatedEndDate, filters.delivery)
    )
  })
}
