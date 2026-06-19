import { subMonths, subWeeks, subYears } from 'date-fns'

// Vocabulario + helper puro del filtro de fecha del audit-log. Un solo período
// hacia ATRÁS sobre createdAt (equivalente al filtro "inicio" de proyectos).
// Client-safe: sin 'use server', sin Prisma. El resultado { fromDate, toDate }
// se pasa tal cual a listAuditLog (que ya acota createdAt por gte/lte).

export type AuditPeriod = 'all' | '1w' | '1m' | '3m' | '6m' | '1y' | 'custom'

export const AUDIT_PERIOD_OPTIONS: ReadonlyArray<{ value: AuditPeriod; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: '1w', label: 'Última semana' },
  { value: '1m', label: 'Último mes' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último año' },
  { value: 'custom', label: 'Personalizado' },
]

/** Período/rango custom → bordes { fromDate, toDate } sobre createdAt, o {} si no se filtra. */
export function periodToRange(
  period: AuditPeriod,
  from: string,
  to: string,
): { fromDate?: Date; toDate?: Date } {
  const now = new Date()
  switch (period) {
    case '1w':
      return { fromDate: subWeeks(now, 1) }
    case '1m':
      return { fromDate: subMonths(now, 1) }
    case '3m':
      return { fromDate: subMonths(now, 3) }
    case '6m':
      return { fromDate: subMonths(now, 6) }
    case '1y':
      return { fromDate: subYears(now, 1) }
    case 'custom': {
      if (!from || !to) {
        return {}
      }
      // 'YYYY-MM-DD' interpretado como día local (mismo criterio que lead/projects filters).
      const fromDate = new Date(`${from}T00:00:00.000`)
      const toDate = new Date(`${to}T23:59:59.999`)
      if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
        return {}
      }
      return { fromDate, toDate }
    }
    case 'all':
    default:
      return {}
  }
}
