import { subMonths, subWeeks, subYears } from 'date-fns'
import { serviceLabel } from './lead-card.helpers'
import { normalizeZone } from './lead-zone.helpers'
import { ACTIVE_PIPELINE_STATUSES, type LeadPipelineLead } from './lead-pipeline.shared'

/** Valor centinela para "todos" (sin filtrar) y "sin valor" (campo null en el lead). */
export const FILTER_ALL = 'all'
export const FILTER_NONE = 'none'

export type LeadPeriod = 'all' | '1w' | '1m' | '6m' | '1y' | 'custom'

export type LeadFilters = {
  /** serviceType, o FILTER_ALL / FILTER_NONE */
  service: string
  /** assignedToName, o FILTER_ALL / FILTER_NONE */
  setter: string
  /** zone, o FILTER_ALL / FILTER_NONE */
  zone: string
  period: LeadPeriod
  /** YYYY-MM-DD (solo period === 'custom') */
  from: string
  to: string
}

export const EMPTY_LEAD_FILTERS: LeadFilters = {
  service: FILTER_ALL,
  setter: FILTER_ALL,
  zone: FILTER_ALL,
  period: 'all',
  from: '',
  to: '',
}

export type FilterOption = { value: string; label: string }

export type LeadFilterOptions = {
  service: FilterOption[]
  setter: FilterOption[]
  zone: FilterOption[]
}

/** Opciones derivadas EN RUNTIME de los leads presentes (distintas + "sin valor"). */
export function deriveFilterOptions(leads: LeadPipelineLead[]): LeadFilterOptions {
  const services = new Set<string>()
  const setters = new Set<string>()
  // Zonas agrupadas por clave normalizada para dedup insensible a mayús/tildes.
  // value = clave normalizada; label = variante canónica (más frecuente, desempate: más tildes).
  const zoneGroups = new Map<string, { label: string; count: number }[]>()
  let hasNullService = false
  let hasNullSetter = false
  let hasNullZone = false

  for (const lead of leads) {
    if (lead.serviceType) {
      services.add(lead.serviceType)
    } else {
      hasNullService = true
    }
    if (lead.assignedToName) {
      setters.add(lead.assignedToName)
    } else {
      hasNullSetter = true
    }
    if (lead.zone) {
      const key = normalizeZone(lead.zone)
      const group = zoneGroups.get(key) ?? []
      const existing = group.find((v) => v.label === lead.zone)
      if (existing) {
        existing.count++
      } else {
        group.push({ label: lead.zone, count: 1 })
      }
      zoneGroups.set(key, group)
    } else {
      hasNullZone = true
    }
  }

  const withAllAndNone = (
    values: string[],
    hasNull: boolean,
    noneLabel: string,
    toLabel: (value: string) => string,
  ): FilterOption[] => {
    const options: FilterOption[] = [{ value: FILTER_ALL, label: 'Todos' }]
    values
      .sort((a, b) => a.localeCompare(b, 'es'))
      .forEach((value) => options.push({ value, label: toLabel(value) }))
    if (hasNull) {
      options.push({ value: FILTER_NONE, label: noneLabel })
    }
    return options
  }

  // Zona: value = clave normalizada, label = variante más frecuente del grupo.
  // Desempate: mayor longitud NFD (= más diacríticos, variante más completa).
  const zoneOptions: FilterOption[] = [{ value: FILTER_ALL, label: 'Todos' }]
  ;[...zoneGroups.entries()]
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB, 'es'))
    .forEach(([key, variants]) => {
      const canonical = [...variants].sort((a, b) =>
        b.count !== a.count
          ? b.count - a.count
          : b.label.normalize('NFD').length - a.label.normalize('NFD').length,
      )[0].label
      zoneOptions.push({ value: key, label: canonical })
    })
  if (hasNullZone) {
    zoneOptions.push({ value: FILTER_NONE, label: 'Sin ubicacion' })
  }

  return {
    service: withAllAndNone(
      [...services],
      hasNullService,
      'Sin servicio',
      (value) => serviceLabel(value as LeadPipelineLead['serviceType']),
    ),
    setter: withAllAndNone([...setters], hasNullSetter, 'Sin asignar', (value) => value),
    zone: zoneOptions,
  }
}

/** gte (y lte opcional) del período relativo/custom, o null si no se filtra por fecha. */
function periodBounds(filters: LeadFilters): { gte: Date; lte?: Date } | null {
  const now = new Date()
  switch (filters.period) {
    case '1w':
      return { gte: subWeeks(now, 1) }
    case '1m':
      return { gte: subMonths(now, 1) }
    case '6m':
      return { gte: subMonths(now, 6) }
    case '1y':
      return { gte: subYears(now, 1) }
    case 'custom': {
      if (!filters.from || !filters.to) {
        return null
      }
      const gte = new Date(`${filters.from}T00:00:00.000`)
      const lte = new Date(`${filters.to}T23:59:59.999`)
      if (Number.isNaN(gte.getTime()) || Number.isNaN(lte.getTime())) {
        return null
      }
      return { gte, lte }
    }
    case 'all':
    default:
      return null
  }
}

/** Aplica todos los filtros en AND. Filtros en FILTER_ALL / period 'all' no acotan. */
export function applyLeadFilters(
  leads: LeadPipelineLead[],
  filters: LeadFilters,
): LeadPipelineLead[] {
  const bounds = periodBounds(filters)

  return leads.filter((lead) => {
    if (filters.service !== FILTER_ALL) {
      if (filters.service === FILTER_NONE ? lead.serviceType !== null : lead.serviceType !== filters.service) {
        return false
      }
    }
    if (filters.setter !== FILTER_ALL) {
      if (filters.setter === FILTER_NONE ? lead.assignedToName !== null : lead.assignedToName !== filters.setter) {
        return false
      }
    }
    if (filters.zone !== FILTER_ALL) {
      if (filters.zone === FILTER_NONE) {
        if (lead.zone !== null) return false
      } else if (!lead.zone || normalizeZone(lead.zone) !== filters.zone) {
        // filters.zone es una clave normalizada; compara contra la zona del lead normalizada.
        return false
      }
    }
    if (bounds) {
      const created = new Date(lead.createdAt).getTime()
      if (created < bounds.gte.getTime()) {
        return false
      }
      if (bounds.lte && created > bounds.lte.getTime()) {
        return false
      }
    }
    return true
  })
}

/** Cantidad de leads (ya filtrados) en estados ACTIVOS — refleja "Leads activos". */
export function countActiveLeads(leads: LeadPipelineLead[]): number {
  const active = new Set<string>(ACTIVE_PIPELINE_STATUSES)
  return leads.reduce((count, lead) => (active.has(lead.status) ? count + 1 : count), 0)
}
