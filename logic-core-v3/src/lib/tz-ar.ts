// Helpers de zona horaria Argentina. Compartidos client+server.
//
// El proyecto opera en TZ AR (sin DST). Hardcodeamos la TZ porque hay 2 bugs de
// TZ previos en el proyecto por usar `new Date()` sin offset explícito. Si en
// algún momento querés multi-tenant con TZ por org, ese cambio se hace acá.
//
// Regla: 00:00 AR ≡ 03:00 UTC del mismo día calendario AR (porque AR = UTC-3 fijo).

export const TZ_AR = 'America/Argentina/Buenos_Aires'

export type DateRange = 'all' | 'today' | '7d' | '30d'

/**
 * Devuelve un Date apuntando al instante UTC equivalente a 00:00 AR del día
 * calendario actual en AR. Útil para filtros "Hoy" o "últimos N días" que
 * deben respetar el día AR aunque el server corra en otra TZ.
 */
export function startOfTodayInAR(now: Date = new Date()): Date {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_AR,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(now)
  const y = parts.find((p) => p.type === 'year')!.value
  const m = parts.find((p) => p.type === 'month')!.value
  const d = parts.find((p) => p.type === 'day')!.value
  return new Date(`${y}-${m}-${d}T03:00:00.000Z`)
}

/**
 * Inicio del rango (Date UTC) que el filtro abarca. Para `all` devuelve null
 * (sin límite inferior). El cap superior es siempre `now`.
 */
export function startOfDateRange(range: DateRange, now: Date = new Date()): Date | null {
  if (range === 'all') return null
  const today = startOfTodayInAR(now).getTime()
  const day = 86_400_000
  if (range === 'today') return new Date(today)
  if (range === '7d') return new Date(today - 6 * day)
  if (range === '30d') return new Date(today - 29 * day)
  return null
}

/**
 * Chequea si `capturedAt` cae dentro del rango pedido. Inclusivo en el inicio
 * (>= 00:00 AR del primer día), sin tope superior explícito.
 */
export function withinDateRange(
  capturedAt: Date | string,
  range: DateRange,
  now: Date = new Date(),
): boolean {
  if (range === 'all') return true
  const start = startOfDateRange(range, now)
  if (!start) return true
  return new Date(capturedAt).getTime() >= start.getTime()
}

/**
 * Devuelve el `periodKey` ISO 8601 de la semana actual en TZ-AR, formato
 * `YYYY-Www` (ej. `2026-W21`). Semana ISO empieza lunes; el año puede no
 * coincidir con el año calendario en los bordes de diciembre/enero (eso es
 * intencional, así lo dicta la norma).
 *
 * Lo usamos como clave única semanal por organización para snapshots del brief.
 */
export function getISOWeekKeyAR(now: Date = new Date()): string {
  // Tomamos la fecha calendario AR (medianoche AR convertida a UTC) y trabajamos
  // sobre esa fecha como si fuese UTC — todas las operaciones aritméticas
  // posteriores son date-only, así que la TZ ya no importa.
  const arDay = startOfTodayInAR(now)

  // ISO: el día de la semana es 1 (Lun) ... 7 (Dom).
  const isoDow = arDay.getUTCDay() === 0 ? 7 : arDay.getUTCDay()

  // Movemos al jueves de la misma semana ISO — ese es el "ancla" que define el
  // año ISO de la semana.
  const thursday = new Date(arDay)
  thursday.setUTCDate(arDay.getUTCDate() + (4 - isoDow))

  const isoYear = thursday.getUTCFullYear()

  // Jueves de la semana 1 del año ISO = el jueves de la semana que contiene el
  // 4 de enero (definición ISO 8601).
  const jan4 = new Date(Date.UTC(isoYear, 0, 4))
  const jan4Dow = jan4.getUTCDay() === 0 ? 7 : jan4.getUTCDay()
  const week1Thursday = new Date(jan4)
  week1Thursday.setUTCDate(jan4.getUTCDate() + (4 - jan4Dow))

  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weekNumber =
    Math.round((thursday.getTime() - week1Thursday.getTime()) / msPerWeek) + 1

  return `${isoYear}-W${String(weekNumber).padStart(2, '0')}`
}
