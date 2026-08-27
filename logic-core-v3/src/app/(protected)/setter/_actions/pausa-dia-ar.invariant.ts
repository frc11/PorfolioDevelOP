/**
 * Invariante ejecutable del BORDE DEL DÍA de la pausa personal — corre sin DB y
 * CON EL HUSO DEL PROCESO FORZADO.
 *
 *   npm run check:invariant:pausa-dia
 *   (el script lo corre con `cross-env TZ=UTC`, y eso es parte del invariante)
 *
 * ── Qué protege (P8, caso 3) ────────────────────────────────────────────────
 * `pausarLead` calculaba el fin de la pausa con `new Date(\`${dia}T23:59:59\`)`.
 * Un date-time SIN designador de zona se parsea en la hora LOCAL DEL PROCESO. En
 * la máquina de Franco (AR, UTC-3) eso da lo correcto; en el servidor (UTC)
 * guarda TRES HORAS ANTES. Es un bug que no se ve en desarrollo —ahí los dos
 * husos coinciden— y que recién aparece al desplegar. Y ya no es cosmético: el
 * filtro «Pausados por vos» de la cartera se decide con este campo.
 *
 * ── Por qué el huso forzado ES el invariante ────────────────────────────────
 * Correr esto en la máquina de Franco no prueba nada: el código viejo y el nuevo
 * dan el MISMO instante ahí. La única corrida que los distingue es una con el
 * huso del proceso puesto en otra cosa. Por eso el script trae `TZ=UTC` adelante.
 *
 * Y por eso el bloque 0 existe: `TZ` NO siempre se respeta. Medido en Windows
 * (Node 24): `TZ=UTC` toma efecto, pero `TZ=Asia/Tokyo`, `TZ=Europe/Madrid` y
 * `TZ=America/Los_Angeles` caen de vuelta al huso del sistema EN SILENCIO. Un
 * invariante que asumiera que el huso está forzado pasaría en verde sin haber
 * ejercido nada. El bloque 0 lo exige de forma empírica: si el cálculo ingenuo
 * coincide con el anclado, es que el proceso está en AR y esta corrida no prueba
 * nada — se cae en vez de mentir.
 */
import assert from 'node:assert/strict'
import { finDePausaAR, SnoozeSchema } from './cartera.schemas.ts'
import { TZ_AR } from '@/lib/dates-ar'

/** El día AR de pared de un instante, `YYYY-MM-DD` (mismo helper que postergacion). */
const diaAR = (d: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_AR,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)

/** La hora AR de pared, `HH:MM:SS`. */
const horaAR = (d: Date): string =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ_AR,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d)

/** Lo que hacía `pausarLead`: date-time sin zona → hora local del proceso. */
const bordeIngenuo = (dia: string): Date => new Date(`${dia}T23:59:59`)

const HUSO_DEL_PROCESO = Intl.DateTimeFormat().resolvedOptions().timeZone

// ── 0. LA PREMISA: el huso del proceso NO es el argentino ────────────────────
// Sin esto el invariante es decoración: en AR las dos fórmulas coinciden y pasa
// en verde sobre el bug que existe para atrapar.
{
  const dia = '2026-08-28'
  assert.notEqual(
    bordeIngenuo(dia).getTime(),
    finDePausaAR(dia)!.getTime(),
    `esta corrida NO está probando nada: el huso del proceso es ${HUSO_DEL_PROCESO} y ahí el\n` +
      '  cálculo ingenuo (hora local) coincide con el anclado a AR. El invariante necesita\n' +
      '  correr con el huso forzado a otro — el script lo hace con `cross-env TZ=UTC`.\n' +
      '  Si alguien le sacó el `TZ` al script, o lo cambió por un huso que este sistema\n' +
      '  ignora en silencio (medido en Windows: Asia/Tokyo, Europe/Madrid y\n' +
      '  America/Los_Angeles caen de vuelta al huso del sistema), reponelo: no borres esto.',
  )
  // Y la dirección del desvío, para que el mensaje de arriba no sea abstracto:
  // con el proceso en UTC el cálculo viejo guardaba TRES HORAS antes.
  assert.equal(
    finDePausaAR(dia)!.getTime() - bordeIngenuo(dia).getTime(),
    3 * 3_600_000,
    'con el proceso en UTC el borde viejo caía exactamente 3 h antes del borde AR',
  )
}

// ── 1. EL ANCLAJE: el borde es 23:59:59 en hora ARGENTINA, no la del proceso ─
// Los esperados están escritos A MANO como instantes UTC: 23:59:59 AR ≡ 02:59:59Z
// del día siguiente (AR = UTC-3 fijo, sin horario de verano).
{
  const casos: { elegido: string; instante: string }[] = [
    { elegido: '2026-08-28', instante: '2026-08-29T02:59:59.000Z' }, // día común
    { elegido: '2026-08-31', instante: '2026-09-01T02:59:59.000Z' }, // fin de mes
    { elegido: '2026-12-31', instante: '2027-01-01T02:59:59.000Z' }, // fin de AÑO
    { elegido: '2028-02-29', instante: '2028-03-01T02:59:59.000Z' }, // bisiesto real
  ]

  for (const { elegido, instante } of casos) {
    const until = finDePausaAR(elegido)
    assert.ok(until, `${elegido}: es un día válido`)
    assert.equal(
      until.toISOString(),
      instante,
      `${elegido}: el fin de la pausa dejó de ser 23:59:59 en hora argentina.\n` +
        `  Si este valor se movió con el huso del proceso (${HUSO_DEL_PROCESO}), volvió el bug:\n` +
        '  el borde tiene que salir de `parseCalendarDayAR`, no de `new Date(dia + "T23:59:59")`.',
    )
    // Y dicho en hora de pared, que es como lo piensa el negocio:
    assert.equal(diaAR(until), elegido, `${elegido}: el día AR del borde es el elegido`)
    assert.equal(horaAR(until), '23:59:59', `${elegido}: el borde es el último segundo del día AR`)
  }
}

// ── 2. NO SE CORRE UN DÍA: ni el anterior ni el siguiente quedan pisados ─────
{
  for (const elegido of ['2026-08-28', '2026-08-31', '2026-12-31']) {
    const until = finDePausaAR(elegido)!
    // Un segundo después ya es el día siguiente en AR.
    assert.notEqual(
      diaAR(new Date(until.getTime() + 1_000)),
      elegido,
      `${elegido}: un segundo después del borde ya es el día siguiente`,
    )
    // Y todo el día elegido queda del lado de adentro (el mediodía AR incluido).
    const mediodiaAR = new Date(until.getTime() - 12 * 3_600_000)
    assert.equal(diaAR(mediodiaAR), elegido, `${elegido}: el mediodía sigue dentro del día elegido`)
    assert.ok(mediodiaAR.getTime() < until.getTime(), `${elegido}: el mediodía es anterior al borde`)
  }
}

// ── 3. LA VISTA DE PAUSADOS SIGUE CONTENIENDO LO MISMO ───────────────────────
// `buildHomeLeads` (home.ts) deriva `snoozed = snoozedUntil > ahora`, y de ahí
// sale el filtro «Pausados por vos» (`vistaDeLead`). Acá se afirma que el
// interruptor da vuelta en el borde del día ARGENTINO — que es justamente lo que
// el huso del servidor corría tres horas.
{
  const elegido = '2026-08-28'
  const until = finDePausaAR(elegido)!
  const sigueePausado = (snoozedUntil: Date, ahora: Date): boolean =>
    snoozedUntil.getTime() > ahora.getTime()

  // A lo largo del día elegido, en AR, el lead SIGUE pausado.
  const mediodiaAR = new Date(until.getTime() - 12 * 3_600_000)
  assert.equal(sigueePausado(until, mediodiaAR), true, 'al mediodía AR del día elegido sigue pausado')

  // Las 21:00 AR del día elegido ≡ 00:00Z del siguiente: es EXACTAMENTE el punto
  // donde el borde viejo (calculado en un proceso UTC) ya lo había despausado.
  const bordeViejoEnServidor = bordeIngenuo(elegido)
  assert.equal(
    sigueePausado(until, bordeViejoEnServidor),
    true,
    'a las 20:59:59 AR el lead TODAVÍA está pausado — el borde viejo en un servidor UTC ya ' +
      'lo había soltado, y el filtro «Pausados por vos» lo perdía tres horas antes',
  )

  // Y un segundo después del borde AR, ya no.
  assert.equal(
    sigueePausado(until, new Date(until.getTime() + 1_000)),
    false,
    'pasado el borde AR el lead vuelve a la cola',
  )
}

// ── 4. DÍAS IMPOSIBLES: el regex los deja pasar, el ancla no ─────────────────
// `SnoozeSchema` valida la FORMA (`\d{4}-\d{2}-\d{2}`), no que el día exista.
// El código viejo los tomaba como `Invalid Date`; el nuevo devuelve `null`, y
// `pausarLead` los rechaza por la MISMA rama de siempre.
{
  for (const imposible of ['2026-02-31', '2026-13-01', '2026-04-31', '2027-02-29']) {
    assert.equal(
      SnoozeSchema.safeParse(imposible).success,
      true,
      `${imposible}: el regex del schema lo deja pasar (por eso hace falta el ancla)`,
    )
    assert.equal(finDePausaAR(imposible), null, `${imposible}: no es un día real → null`)
  }
  // Y un día bisiesto REAL sí pasa (no se rechaza de más).
  assert.ok(finDePausaAR('2028-02-29'), '2028 es bisiesto: el 29 de febrero existe')
}

console.log(
  `✓ invariante OK (huso del proceso: ${HUSO_DEL_PROCESO}): el fin de la pausa personal es ` +
    'las 23:59:59 en hora ARGENTINA del día elegido, salga de donde salga el reloj del ' +
    'proceso — mismo instante que producía el código viejo corriendo en AR, y tres horas ' +
    'más tarde que el que producía en un servidor UTC. El filtro «Pausados por vos» ' +
    'conserva el lead durante todo el día elegido.',
)
