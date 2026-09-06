// Helper único de fechas/períodos en hora Argentina. Compartido client+server.
//
// Por qué existe: el negocio razona en `America/Argentina/Buenos_Aires`, pero los
// datos se guardan en UTC. Ya hubo 2 bugs de TZ en el proyecto (ver `tz-ar.ts`).
// Esta pieza centraliza el cálculo de límites de día/semana/mes EN HORA AR,
// devueltos como instantes UTC listos para queries Prisma con `gte`/`lt`, más el
// período anterior equivalente para comparativas ("vs mes pasado") y formateo
// legible en español rioplatense.
//
// Reusa la primitiva canónica `startOfTodayInAR` de `tz-ar.ts` — NO duplica la
// constante de TZ ni la lógica de "qué día calendario AR es este instante".
//
// Modelo: AR = UTC-3 fijo, sin horario de verano (DST). Por eso una hora de
// pared AR (Y-M-D h:m) equivale exactamente al instante UTC (Y-M-D, h+3). Toda
// la aritmética acá se apoya en ese offset fijo y en `Intl` nativo (sin libs
// nuevas: `date-fns` está instalado pero no `date-fns-tz`, y para esto Intl
// alcanza y evita una dependencia más).

import { TZ_AR, startOfTodayInAR } from './tz-ar'

export { TZ_AR }

/** Período base para rangos y comparativas. */
export type Period = 'day' | 'week' | 'month'

/**
 * Rango UTC semiabierto `[start, end)`: usar `start` con `gte` y `end` con `lt`
 * en Prisma. `end` es exclusivo (inicio del período siguiente), nunca el último
 * milisegundo — así se evita el clásico off-by-one de `lte 23:59:59.999`.
 */
export interface UTCRange {
  /** Inclusivo. Instante UTC de las 00:00 AR del primer día del período. */
  start: Date
  /** Exclusivo. Instante UTC de las 00:00 AR del primer día del período siguiente. */
  end: Date
}

const DAY_MS = 86_400_000

// ── Primitivas internas ──────────────────────────────────────────────────────

/**
 * Componentes de la fecha de pared AR de un instante: año, mes (1-12) y día.
 * `en-CA` da formato `YYYY-MM-DD`, fácil de partir y sin ambigüedad de locale.
 */
function arDateParts(now: Date): { year: number; month: number; day: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_AR,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(now)
  const get = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((p) => p.type === type)!.value)
  return { year: get('year'), month: get('month'), day: get('day') }
}

// ── Límites de día ────────────────────────────────────────────────────────────

/**
 * Instante UTC de las 00:00 AR del día calendario AR que contiene `now`.
 * Alias semántico de `startOfTodayInAR` (la primitiva canónica de `tz-ar.ts`).
 */
export function startOfDayAR(now: Date = new Date()): Date {
  return startOfTodayInAR(now)
}

/** Instante UTC de las 00:00 AR del día AR SIGUIENTE (tope exclusivo del día). */
export function endOfDayAR(now: Date = new Date()): Date {
  return new Date(startOfDayAR(now).getTime() + DAY_MS)
}

/** Rango `[00:00 AR de hoy, 00:00 AR de mañana)` del día AR de `now`. */
export function dayRangeAR(now: Date = new Date()): UTCRange {
  const start = startOfDayAR(now)
  return { start, end: new Date(start.getTime() + DAY_MS) }
}

// ── Día de calendario elegido por una persona → instante ─────────────────────

/**
 * Un día de calendario elegido a mano (`YYYY-MM-DD`, lo que emite un
 * `<input type="date">`) → el instante UTC de las 00:00 AR de ESE día.
 *
 * Por qué existe: `new Date('2026-08-25')` —y `z.coerce.date()`, que lo usa por
 * dentro— interpreta el date-only como medianoche **UTC**, que en AR (UTC-3)
 * todavía es el 24 a las 21:00. Formatear ese instante en AR muestra el día
 * anterior, y cualquier comparación `<= ahora` se dispara la noche previa. La
 * raíz no es el formateo: es tratar un día de calendario como si fuera un
 * instante. Un día solo se vuelve instante cuando se lo ancla a una zona, y acá
 * la zona es AR.
 *
 * El arreglo NO desplaza horas sobre un `Date` ya mal parseado (eso corre el día
 * en la dirección contraria y se rompe distinto según la fecha): construye el
 * instante desde los componentes del calendario, con la misma regla que
 * `startOfMonthAR` — 00:00 AR ≡ 03:00 UTC del MISMO día calendario.
 *
 * Es idempotente por diseño: aplicarlo a un valor que ya es instante no lo mueve
 * (no matchea el patrón date-only y devuelve `null`, así el llamador conserva el
 * valor original). Eso importa porque el mismo payload se valida dos veces:
 * en el cliente y de nuevo en el server.
 *
 * Devuelve `null` si el texto no es un día de calendario REAL — incluido el caso
 * traicionero `2026-02-31`, que `Date.UTC` normalizaría en silencio al 3 de marzo.
 */
export function parseCalendarDayAR(isoDate: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  const instant = new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0))

  // Round-trip contra los componentes pedidos: `Date.UTC` NORMALIZA los desbordes
  // (31 de febrero → 3 de marzo, mes 13 → enero del año siguiente) en vez de
  // fallar. A las 03:00Z el día calendario UTC coincide con el AR, así que
  // comparar en UTC es comparar el día AR.
  if (
    instant.getUTCFullYear() !== year ||
    instant.getUTCMonth() !== month - 1 ||
    instant.getUTCDate() !== day
  ) {
    return null
  }

  return instant
}

// ── Límites de semana (ISO: arranca lunes) ────────────────────────────────────

/**
 * Instante UTC de las 00:00 AR del LUNES de la semana AR que contiene `now`.
 * Semana ISO 8601: lunes (1) … domingo (7).
 *
 * Trabajamos sobre el ancla de 03:00Z del día AR: en ese instante el día
 * calendario UTC coincide con el día calendario AR, así que `getUTCDay()` da el
 * día de la semana AR correcto, y restar días en milisegundos es seguro (offset
 * fijo, sin DST → cada ancla queda a 03:00Z de su fecha).
 */
export function startOfWeekAR(now: Date = new Date()): Date {
  const start = startOfDayAR(now)
  const dow = start.getUTCDay() // 0=Dom … 6=Sáb
  const isoDow = dow === 0 ? 7 : dow // 1=Lun … 7=Dom
  return new Date(start.getTime() - (isoDow - 1) * DAY_MS)
}

/** Instante UTC de las 00:00 AR del lunes SIGUIENTE (tope exclusivo de la semana). */
export function endOfWeekAR(now: Date = new Date()): Date {
  return new Date(startOfWeekAR(now).getTime() + 7 * DAY_MS)
}

/** Rango `[lunes 00:00 AR, lunes siguiente 00:00 AR)` de la semana AR de `now`. */
export function weekRangeAR(now: Date = new Date()): UTCRange {
  const start = startOfWeekAR(now)
  return { start, end: new Date(start.getTime() + 7 * DAY_MS) }
}

// ── Límites de mes ────────────────────────────────────────────────────────────

/** Instante UTC de las 00:00 AR del día 1 del mes AR que contiene `now`. */
export function startOfMonthAR(now: Date = new Date()): Date {
  const { year, month } = arDateParts(now)
  // 00:00 AR del día 1 ≡ 03:00 UTC del mismo día calendario (AR = UTC-3 fijo).
  return new Date(Date.UTC(year, month - 1, 1, 3, 0, 0, 0))
}

/**
 * Instante UTC de las 00:00 AR del día 1 del mes SIGUIENTE (tope exclusivo).
 * `Date.UTC` normaliza el rollover de diciembre → enero del año siguiente.
 */
export function endOfMonthAR(now: Date = new Date()): Date {
  const { year, month } = arDateParts(now)
  return new Date(Date.UTC(year, month, 1, 3, 0, 0, 0))
}

/** Rango `[día 1 00:00 AR, día 1 del mes siguiente 00:00 AR)` del mes AR de `now`. */
export function monthRangeAR(now: Date = new Date()): UTCRange {
  return { start: startOfMonthAR(now), end: endOfMonthAR(now) }
}

// ── Período actual / período anterior equivalente ─────────────────────────────

/** Rango del período actual (día/semana/mes AR) que contiene `now`. */
export function rangeForPeriod(period: Period, now: Date = new Date()): UTCRange {
  if (period === 'day') return dayRangeAR(now)
  if (period === 'week') return weekRangeAR(now)
  return monthRangeAR(now)
}

/**
 * Rango del período anterior EQUIVALENTE — el período completo inmediatamente
 * previo, para comparativas "vs ayer / vs semana pasada / vs mes pasado".
 *
 * - day  → día AR anterior.
 * - week → semana AR anterior (lunes a lunes).
 * - month → mes calendario AR anterior (respeta meses de 28-31 días; el cálculo
 *   se hace sobre el día 1, nunca arrastrando "hoy 31" a un mes sin día 31).
 */
export function previousRangeForPeriod(period: Period, now: Date = new Date()): UTCRange {
  if (period === 'day') {
    const current = dayRangeAR(now)
    return { start: new Date(current.start.getTime() - DAY_MS), end: current.start }
  }
  if (period === 'week') {
    const current = weekRangeAR(now)
    return { start: new Date(current.start.getTime() - 7 * DAY_MS), end: current.start }
  }
  // month: anclamos en el día 1 del mes actual AR y retrocedemos un mes con
  // Date.UTC (normaliza enero → diciembre del año anterior).
  const { year, month } = arDateParts(now)
  const start = new Date(Date.UTC(year, month - 2, 1, 3, 0, 0, 0))
  const end = new Date(Date.UTC(year, month - 1, 1, 3, 0, 0, 0))
  return { start, end }
}

// ── Formateo legible (es-AR, rioplatense) ─────────────────────────────────────

/** "11 de junio" (sin año si es del año en curso; con año si no). */
export function formatDateAR(date: Date, now: Date = new Date()): string {
  const sameYear = arDateParts(date).year === arDateParts(now).year
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ_AR,
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date)
}

/** Hora de pared AR en formato 24h, p.ej. "18:30". */
export function formatTimeAR(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: TZ_AR,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/** "11 de junio, 18:30" — fecha + hora AR. */
export function formatDateTimeAR(date: Date, now: Date = new Date()): string {
  return `${formatDateAR(date, now)}, ${formatTimeAR(date)}`
}

/**
 * Formato relativo rioplatense:
 *   - < 1 min               → "recién"
 *   - < 1 h                 → "hace N minutos"
 *   - mismo día AR          → "hace N horas"
 *   - día AR anterior       → "ayer 18:30"
 *   - más viejo (mismo año) → "11 de junio"
 *   - más viejo (otro año)  → "11 de junio de 2025"
 *
 * Las fechas futuras (relojes desfasados, datos a futuro) caen a "recién" para
 * no mostrar "hace -3 minutos".
 */
export function formatRelativeAR(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime()

  if (diffMs < 60_000) return 'recién'

  if (diffMs < 3_600_000) {
    const mins = Math.floor(diffMs / 60_000)
    return `hace ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`
  }

  // Diferencia en días calendario AR (no en bloques de 24 h): el salto a "ayer"
  // ocurre al cruzar la medianoche AR, no a las 24 h exactas.
  const dayDiff = Math.round(
    (startOfDayAR(now).getTime() - startOfDayAR(date).getTime()) / DAY_MS,
  )

  if (dayDiff <= 0) {
    const hrs = Math.floor(diffMs / 3_600_000)
    return `hace ${hrs} ${hrs === 1 ? 'hora' : 'horas'}`
  }

  if (dayDiff === 1) return `ayer ${formatTimeAR(date)}`

  return formatDateAR(date, now)
}
