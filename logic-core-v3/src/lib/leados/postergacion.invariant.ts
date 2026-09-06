/**
 * Invariante ejecutable de la fecha de POSTERGACIÓN — corre sin DB.
 *
 *   npm run check:invariant:postergacion
 *
 * Qué protege (F1). El setter elige un día en el date-picker y ese día tiene que
 * ser, a la vez, el que se GUARDA, el que se MUESTRA y el que REACTIVA el lead.
 * Antes no lo era: `z.coerce.date()` leía el `YYYY-MM-DD` como medianoche UTC
 * —que en AR (UTC-3) es el día anterior a las 21:00— así que elegir el 25
 * mostraba «24» y el panel devolvía el lead la noche del 24.
 *
 * Es un bug que se rompe en SILENCIO: nadie mira una fecha hasta que la usa para
 * decidir. Y es de una familia con trampa: el arreglo ingenuo (sumar horas)
 * corre el día en la dirección contraria, o anda con una fecha y falla en el
 * último día del mes. Por eso acá se ejerce el camino REAL (el schema que usa la
 * pantalla) contra fechas que cruzan fin de mes, fin de año y bisiesto.
 *
 * Las dos mitades del criterio se afirman por separado:
 *   (A) lo elegido es lo guardado y lo mostrado — `formatFechaCorta`, el mismo
 *       formateador de la pantalla;
 *   (B) lo elegido gobierna CUÁNDO vuelve — la comparación `reactivateAt <= ahora`
 *       de `buildHomeLeads` (home.ts, `postergadoVencido`) y del cron os-follow-up.
 */
import assert from 'node:assert/strict'
import { ResultadoInputSchema } from '../../app/(protected)/setter/_actions/outreach.schemas.ts'
import { parseCalendarDayAR, TZ_AR } from '../dates-ar.ts'
import { formatFechaCorta } from './flow.ts'

const DAY_MS = 86_400_000

/** El día AR de pared de un instante, `YYYY-MM-DD` (para afirmar sin ambigüedad). */
const diaAR = (d: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_AR,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)

// ── 1. LA REGRESIÓN EXACTA: date-only ≠ instante ─────────────────────────────
{
  // Lo que hacía `z.coerce.date()` y sigue haciendo `new Date` con un date-only:
  // medianoche UTC, que en AR es el día ANTERIOR a las 21:00.
  assert.equal(
    diaAR(new Date('2026-08-25')),
    '2026-08-24',
    'premisa del bug: new Date(date-only) cae el día anterior en AR',
  )
  // El helper ancla el día al calendario AR: 00:00 AR ≡ 03:00 UTC del MISMO día.
  const anclado = parseCalendarDayAR('2026-08-25')!
  assert.equal(anclado.toISOString(), '2026-08-25T03:00:00.000Z', 'ancla a 03:00Z')
  assert.equal(diaAR(anclado), '2026-08-25', 'el día AR es el elegido')
}

// ── 2. FECHAS QUE CRUZAN BORDES (la falla típica de esta familia) ────────────
{
  const casos = [
    '2026-08-25', // día común
    '2026-08-31', // último día del mes
    '2026-09-01', // primero del mes siguiente
    '2026-12-31', // último día del AÑO
    '2027-01-01', // primero del año siguiente
    '2028-02-29', // bisiesto real
  ]
  for (const elegido of casos) {
    const instante = parseCalendarDayAR(elegido)
    assert.ok(instante, `${elegido} es un día válido`)
    assert.equal(diaAR(instante), elegido, `${elegido}: el día AR guardado es el elegido`)
    // Y el día ANTERIOR no queda pisado: 23:59:59.999 AR del día previo sigue siendo previo.
    const unMsAntes = new Date(instante.getTime() - 1)
    assert.notEqual(diaAR(unMsAntes), elegido, `${elegido}: un ms antes ya es el día previo`)
  }
}

// ── 3. DÍAS QUE NO EXISTEN — `Date.UTC` los normaliza en silencio ────────────
{
  // 2026 no es bisiesto: el 29 de febrero no existe y NO debe convertirse en 1-mar.
  assert.equal(parseCalendarDayAR('2026-02-29'), null, '29-feb de un año no bisiesto')
  assert.equal(parseCalendarDayAR('2026-02-31'), null, '31-feb (Date.UTC daría 3-mar)')
  assert.equal(parseCalendarDayAR('2026-13-01'), null, 'mes 13 (Date.UTC daría enero-2027)')
  assert.equal(parseCalendarDayAR('2026-04-31'), null, '31 de un mes de 30 días')
  assert.equal(parseCalendarDayAR('no-es-fecha'), null, 'texto suelto')
  assert.equal(parseCalendarDayAR(''), null, 'vacío')
  // Un instante ISO completo NO es un día de calendario: se deja pasar tal cual
  // (el llamador conserva el valor original) — de eso vive la idempotencia.
  assert.equal(parseCalendarDayAR('2026-08-25T03:00:00.000Z'), null, 'ISO completo no matchea')
}

// ── 4. (A) LO ELEGIDO ES LO GUARDADO Y LO MOSTRADO — camino real ─────────────
{
  // Fechas lejanas: el schema exige reactivación FUTURA, y el invariante no debe
  // caducar con el reloj. Se ejercen los mismos bordes del bloque 2.
  const casos: { elegido: string; muestra: string }[] = [
    { elegido: '2099-08-25', muestra: '25/8' },
    { elegido: '2099-08-31', muestra: '31/8' }, // fin de mes
    { elegido: '2099-09-01', muestra: '1/9' }, // primero del mes siguiente
    { elegido: '2099-12-31', muestra: '31/12' }, // fin de año
  ]

  for (const { elegido, muestra } of casos) {
    const parsed = ResultadoInputSchema.safeParse({
      resultado: 'POSTERGADO',
      nota: '',
      reactivateAt: elegido,
    })
    assert.ok(parsed.success, `${elegido}: el schema acepta la fecha elegida`)

    const guardado = parsed.data.reactivateAt
    assert.ok(guardado instanceof Date, `${elegido}: se guarda un Date`)

    // Lo GUARDADO es el día elegido…
    assert.equal(diaAR(guardado), elegido, `${elegido}: guardado == elegido (día AR)`)
    // …y lo MOSTRADO también (mismo formateador que la pantalla del setter).
    assert.equal(
      formatFechaCorta(guardado.toISOString()),
      muestra,
      `${elegido}: la pantalla muestra ${muestra}`,
    )
  }
}

// ── 5. (B) LO ELEGIDO GOBIERNA CUÁNDO VUELVE EL LEAD ─────────────────────────
{
  // Misma comparación que `buildHomeLeads` (home.ts): un POSTERGADO vuelve a ser
  // trabajo cuando `reactivateAt <= ahora`. Se afirma que el interruptor da vuelta
  // en el borde exacto del día elegido: ni un día antes, ni un día después.
  const postergadoVencido = (reactivateAt: Date, ahora: Date): boolean =>
    reactivateAt.getTime() <= ahora.getTime()

  for (const elegido of ['2026-08-25', '2026-09-01', '2026-12-31', '2027-01-01']) {
    const reactivateAt = parseCalendarDayAR(elegido)!

    // 23:59:59.999 AR del día ANTERIOR → todavía NO (antes volvía a las 21:00 de ese día).
    const finDelDiaPrevio = new Date(reactivateAt.getTime() - 1)
    assert.equal(
      postergadoVencido(reactivateAt, finDelDiaPrevio),
      false,
      `${elegido}: el día anterior el lead NO vuelve`,
    )

    // 00:00 AR del día elegido → sí, exactamente ahí.
    assert.equal(
      postergadoVencido(reactivateAt, reactivateAt),
      true,
      `${elegido}: vuelve al arrancar el día elegido`,
    )

    // Y a lo largo del día elegido sigue vencido (no se "pasa" al día siguiente).
    const mediodiaAR = new Date(reactivateAt.getTime() + 12 * 3_600_000)
    assert.equal(diaAR(mediodiaAR), elegido, `${elegido}: el mediodía sigue en el día elegido`)
    assert.equal(
      postergadoVencido(reactivateAt, mediodiaAR),
      true,
      `${elegido}: sigue vencido durante el día elegido`,
    )

    // El día previo COMPLETO queda del lado de "no vuelve".
    const mediodiaPrevio = new Date(reactivateAt.getTime() - DAY_MS + 12 * 3_600_000)
    assert.equal(
      postergadoVencido(reactivateAt, mediodiaPrevio),
      false,
      `${elegido}: el mediodía anterior tampoco lo trae`,
    )
  }
}

// ── 6. IDEMPOTENCIA: el mismo payload se valida DOS veces ────────────────────
{
  // El form valida y manda `parsed.data` (ya un Date); la action re-valida. Si el
  // arreglo fuese un desplazamiento de horas, la segunda pasada correría el día
  // otra vez. Acá la segunda pasada tiene que ser un no-op exacto.
  const primera = ResultadoInputSchema.safeParse({
    resultado: 'POSTERGADO',
    nota: '',
    reactivateAt: '2099-08-31',
  })
  assert.ok(primera.success)
  const unaVez = primera.data.reactivateAt!

  const segunda = ResultadoInputSchema.safeParse(primera.data)
  assert.ok(segunda.success, 're-validar el output del cliente es válido server-side')
  const dosVeces = segunda.data.reactivateAt!

  assert.equal(dosVeces.getTime(), unaVez.getTime(), 'la doble pasada NO mueve el instante')
  assert.equal(diaAR(dosVeces), '2099-08-31', 'y el día sigue siendo el elegido')
}

// ── 7. EL GATE DE "FUTURA" SIGUE EN PIE (no se aflojó nada) ──────────────────
{
  const pasada = ResultadoInputSchema.safeParse({
    resultado: 'POSTERGADO',
    nota: '',
    reactivateAt: '2020-01-15',
  })
  assert.equal(pasada.success, false, 'una fecha pasada se sigue rechazando')

  const sinFecha = ResultadoInputSchema.safeParse({ resultado: 'POSTERGADO', nota: '' })
  assert.equal(sinFecha.success, false, 'POSTERGADO sigue exigiendo fecha')

  // Y los otros resultados no piden fecha (el eje no se tocó).
  const otro = ResultadoInputSchema.safeParse({ resultado: 'RESPONDIO', nota: '' })
  assert.equal(otro.success, true, 'RESPONDIO no exige fecha')
}

console.log(
  '✓ invariante OK: la fecha de postergación es un DÍA DE CALENDARIO AR — lo que el ' +
    'setter elige es lo que se guarda, lo que la pantalla muestra y el día en que el ' +
    'panel devuelve el lead (ni antes ni después), incluidos fin de mes, fin de año y ' +
    'bisiesto; la doble validación cliente+server no corre el día.',
)
