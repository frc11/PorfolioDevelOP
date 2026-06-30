/**
 * Invariante ejecutable del helper de fechas AR — corre sin DB.
 *
 *   npm run check:invariant:dates-ar
 *
 * Verifica, de forma ejecutable (no "es obvio"), las garantías que la pieza
 * promete y que el sprint pide constatar:
 *
 *   1. BORDE DE MES (31 → 1) — el rango del mes y el del mes anterior se anclan
 *      siempre en el día 1, nunca arrastran "hoy 31" a un mes sin día 31.
 *   2. SALTO DE DÍA UTC vs AR — un lead capturado a las 22:30 AR (que en UTC ya
 *      es el día siguiente) cae en el día AR correcto, no en el de UTC.
 *   3. PERÍODO ANTERIOR EQUIVALENTE — el rango previo es contiguo y de largo
 *      correcto para día/semana/mes (incl. rollover enero → diciembre).
 *
 * Importa solo el módulo puro `dates-ar` (que a su vez reusa `tz-ar`): cero Neon,
 * cero `@/` en el grafo de runtime (mismo criterio liviano que los otros checks).
 */
import assert from 'node:assert/strict'
import {
  startOfDayAR,
  endOfDayAR,
  dayRangeAR,
  startOfWeekAR,
  endOfWeekAR,
  weekRangeAR,
  startOfMonthAR,
  endOfMonthAR,
  monthRangeAR,
  rangeForPeriod,
  previousRangeForPeriod,
  formatDateAR,
  formatTimeAR,
  formatDateTimeAR,
  formatRelativeAR,
} from './dates-ar.ts'

const DAY_MS = 86_400_000
const iso = (d: Date): string => d.toISOString()

// ── 1. Coherencia con la regla "00:00 AR ≡ 03:00 UTC del mismo día" ───────────
{
  const now = new Date('2026-06-15T12:00:00.000Z') // 09:00 AR del 15-jun
  assert.equal(iso(startOfDayAR(now)), '2026-06-15T03:00:00.000Z', 'startOfDayAR 03:00Z')
  assert.equal(iso(endOfDayAR(now)), '2026-06-16T03:00:00.000Z', 'endOfDayAR día siguiente 03:00Z')

  const r = dayRangeAR(now)
  assert.equal(r.end.getTime() - r.start.getTime(), DAY_MS, 'dayRange dura exactamente 1 día')
  // rangeForPeriod('day') === dayRangeAR
  assert.deepEqual(rangeForPeriod('day', now), r, "rangeForPeriod('day') == dayRangeAR")
}

// ── 2. SALTO DE DÍA UTC vs AR (caso central del sprint) ───────────────────────
{
  // Lead capturado 22:30 AR del 10-jun → en UTC es 01:30Z del 11-jun.
  const lead2230AR = new Date('2026-06-11T01:30:00.000Z')

  // Mirando el día AR del 10-jun (12:00 AR), el lead DEBE caer dentro.
  const day10 = dayRangeAR(new Date('2026-06-10T15:00:00.000Z'))
  assert.ok(
    lead2230AR >= day10.start && lead2230AR < day10.end,
    'lead 22:30 AR del 10 cae en el día AR del 10 (aunque en UTC sea el 11)',
  )

  // Y NO debe caer en el día AR del 11-jun.
  const day11 = dayRangeAR(new Date('2026-06-11T15:00:00.000Z'))
  assert.ok(
    !(lead2230AR >= day11.start && lead2230AR < day11.end),
    'el mismo lead NO cae en el día AR del 11',
  )

  // Variante de mes: lead 21:00 AR del 31-may = 00:00Z del 1-jun → es MAYO en AR.
  const leadFinMes = new Date('2026-06-01T00:00:00.000Z')
  const mayo = monthRangeAR(new Date('2026-05-15T12:00:00.000Z'))
  const junio = monthRangeAR(new Date('2026-06-15T12:00:00.000Z'))
  assert.ok(leadFinMes >= mayo.start && leadFinMes < mayo.end, 'lead 21:00 AR del 31-may pertenece a MAYO')
  assert.ok(!(leadFinMes >= junio.start && leadFinMes < junio.end), 'ese lead NO pertenece a junio')
}

// ── 3. BORDE DE MES (31 → 1) ──────────────────────────────────────────────────
{
  // Parados un 31 de mayo, el mes es [1-may, 1-jun) y el previo [1-abr, 1-may).
  const finDeMayo = new Date('2026-05-31T20:00:00.000Z') // 17:00 AR del 31-may
  assert.equal(iso(startOfMonthAR(finDeMayo)), '2026-05-01T03:00:00.000Z', 'inicio de mayo')
  assert.equal(iso(endOfMonthAR(finDeMayo)), '2026-06-01T03:00:00.000Z', 'fin de mayo = inicio de junio')

  const prevMayo = previousRangeForPeriod('month', finDeMayo)
  assert.equal(iso(prevMayo.start), '2026-04-01T03:00:00.000Z', 'mes previo a mayo arranca el 1-abr')
  assert.equal(iso(prevMayo.end), '2026-05-01T03:00:00.000Z', 'mes previo a mayo termina al inicio de mayo')

  // El día 31 NO se arrastra: febrero (28 días) se calcula sobre el día 1.
  const enMarzo31 = new Date('2026-03-31T15:00:00.000Z')
  const prevMarzo = previousRangeForPeriod('month', enMarzo31)
  assert.equal(iso(prevMarzo.start), '2026-02-01T03:00:00.000Z', 'mes previo a marzo = febrero, día 1')
  assert.equal(iso(prevMarzo.end), '2026-03-01T03:00:00.000Z', 'febrero termina al inicio de marzo (no "31 de feb")')
}

// ── 4. ROLLOVER DE AÑO (enero → diciembre) ────────────────────────────────────
{
  const enEnero = new Date('2026-01-10T12:00:00.000Z')
  const prev = previousRangeForPeriod('month', enEnero)
  assert.equal(iso(prev.start), '2025-12-01T03:00:00.000Z', 'mes previo a enero-2026 = diciembre-2025')
  assert.equal(iso(prev.end), '2026-01-01T03:00:00.000Z', 'diciembre-2025 termina al inicio de enero-2026')

  // Diciembre: el "mes siguiente" rueda a enero del año siguiente.
  const enDic = new Date('2026-12-20T12:00:00.000Z')
  assert.equal(iso(endOfMonthAR(enDic)), '2027-01-01T03:00:00.000Z', 'fin de diciembre-2026 = inicio enero-2027')
}

// ── 5. SEMANA ISO (arranca lunes) ─────────────────────────────────────────────
{
  // 2026-06-30 es martes. La semana ISO arranca el lunes 29-jun.
  const martes = new Date('2026-06-30T12:00:00.000Z') // 09:00 AR
  const start = startOfWeekAR(martes)
  assert.equal(start.getUTCDay(), 1, 'startOfWeekAR cae en lunes (getUTCDay===1)')
  assert.equal(iso(start), '2026-06-29T03:00:00.000Z', 'lunes 29-jun 00:00 AR')
  assert.equal(iso(endOfWeekAR(martes)), '2026-07-06T03:00:00.000Z', 'fin de semana = lunes siguiente')

  const wr = weekRangeAR(martes)
  assert.equal(wr.end.getTime() - wr.start.getTime(), 7 * DAY_MS, 'la semana dura 7 días')
  assert.ok(martes >= wr.start && martes < wr.end, 'el martes está dentro de su semana')

  // Domingo: sigue perteneciendo a la semana que arrancó el lunes anterior.
  const domingo = new Date('2026-07-05T20:00:00.000Z') // 17:00 AR del domingo 5-jul
  assert.equal(iso(startOfWeekAR(domingo)), '2026-06-29T03:00:00.000Z', 'domingo 5-jul pertenece a la semana del 29-jun')

  // Período anterior de semana: contiguo y de 7 días.
  const prevWeek = previousRangeForPeriod('week', martes)
  assert.equal(iso(prevWeek.end), iso(wr.start), 'semana previa termina donde arranca la actual')
  assert.equal(prevWeek.end.getTime() - prevWeek.start.getTime(), 7 * DAY_MS, 'semana previa dura 7 días')
}

// ── 6. PERÍODO ANTERIOR: contigüidad día ──────────────────────────────────────
{
  const now = new Date('2026-06-15T12:00:00.000Z')
  const cur = dayRangeAR(now)
  const prev = previousRangeForPeriod('day', now)
  assert.equal(iso(prev.end), iso(cur.start), 'día previo termina donde arranca el actual')
  assert.equal(prev.end.getTime() - prev.start.getTime(), DAY_MS, 'día previo dura 1 día')
}

// ── 7. FORMATEO es-AR ─────────────────────────────────────────────────────────
{
  const now = new Date('2026-06-15T12:00:00.000Z')
  const d = new Date('2026-06-11T21:30:00.000Z') // 18:30 AR del 11-jun
  assert.equal(formatDateAR(d, now), '11 de junio', 'formatDateAR sin año en el año en curso')
  assert.equal(formatTimeAR(d), '18:30', 'formatTimeAR hora de pared AR 24h')
  assert.equal(formatDateTimeAR(d, now), '11 de junio, 18:30', 'formatDateTimeAR')

  // Otro año → con año.
  const viejo = new Date('2025-06-11T21:30:00.000Z')
  assert.equal(formatDateAR(viejo, now), '11 de junio de 2025', 'formatDateAR con año si difiere')

  // Relativo.
  assert.equal(formatRelativeAR(new Date(now.getTime() - 30_000), now), 'recién', '< 1 min')
  assert.equal(formatRelativeAR(new Date(now.getTime() - 60_000), now), 'hace 1 minuto', 'singular minuto')
  assert.equal(formatRelativeAR(new Date(now.getTime() - 5 * 60_000), now), 'hace 5 minutos', 'plural minutos')
  assert.equal(formatRelativeAR(new Date(now.getTime() - 3 * 3_600_000), now), 'hace 3 horas', 'hace 3 horas (mismo día AR)')
  assert.equal(formatRelativeAR(new Date(now.getTime() + 5 * 60_000), now), 'recién', 'futuro cae a recién')

  // "ayer 18:30": 14-jun 18:30 AR mirado desde el 15-jun. 18:30 AR = 21:30Z.
  const ayer = new Date('2026-06-14T21:30:00.000Z')
  assert.equal(formatRelativeAR(ayer, now), 'ayer 18:30', 'ayer con hora AR')

  // Más viejo → fecha.
  assert.equal(formatRelativeAR(new Date('2026-06-01T15:00:00.000Z'), now), '1 de junio', 'viejo → fecha')
}

console.log('✓ dates-ar invariants OK')
