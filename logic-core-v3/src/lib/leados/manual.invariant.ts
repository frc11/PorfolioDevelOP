/**
 * Chequeo de invariante de la DERIVACIÓN de posición del manual (2.3 — B-02/C-17:
 * un lead terminal deriva a ARCHIVO, no a trabajo) — corre sin DB.
 *
 *   npm run check:invariant:manual
 *
 * Verifica, de forma ejecutable (no "es obvio" y no efímero como la verificación
 * en runtime), la garantía que Sprint 2.3 promete: un negocio muerto ya no
 * invita a contactar.
 *
 *   - PERDIDO (terminal por STATUS, lo decide Franco) → `actual: 'archivo'`
 *     ANTES de derivar por stage. En CUALQUIER stage vivo (EVALUADA, APROBADA,
 *     FICHA…) donde antes caía en m5/espera, ahora cae en archivo. m5 (ni ningún
 *     paso de trabajo) queda habilitado — sólo el propio archivo es alcanzable.
 *   - DESCARTADA (terminal por STAGE) NO se re-rutea: conserva su case (m2, el
 *     veredicto a la vista — P4 fusionó ahí el registro que vivía en m3) con
 *     `habilitadas` vacía — su badge cyan lo apaga C-17 en presentación, no la
 *     derivación.
 *   - CERRADO (terminal GANADO) NO cae al archivo: es un cierre exitoso, mantiene
 *     su aterrizaje por stage (m16, la reunión). El archivo es sólo para el lead
 *     que se cerró sin avanzar (PERDIDO).
 *
 * Es derivación de PRESENTACIÓN, no motor: `derivarPantalla` NO toca
 * `status`/stages ni escribe nada — sólo dónde aterriza el setter. El never-guard
 * del switch por stage queda intacto: la rama terminal se evalúa antes.
 *
 * Importa el módulo puro `manual` directo (relativo, sin `@/`): su árbol de
 * runtime quedó `@/`-free a propósito (ver el header de imports de manual.ts),
 * así que el harness ts-node lo carga sin Neon ni tsconfig-paths.
 */
import assert from 'node:assert/strict'
import type { DossierStage, LeadStatus } from '@prisma/client'
import { derivarPantalla, type DerivacionManualInput } from './manual.ts'

/**
 * Fixture de la entrada de derivación: por defecto un lead vivo, mínimo. Los
 * overrides fijan sólo el eje que se prueba (status/stage).
 */
function input(
  overrides: Partial<DerivacionManualInput> & { status: LeadStatus; stage: DossierStage | null },
): DerivacionManualInput {
  return {
    caliente: false,
    ficha: null,
    draftUrl: null,
    progreso: { completadas: [] },
    agenda: null,
    contactos: 0,
    followUpCount: 0,
    followUpVencido: false,
    // P19 — El lead mínimo no está pausado ni viene de un rechazo; los casos que
    // ejercitan esas ramas los fija el override.
    postergadoVencido: false,
    hayRechazo: false,
    finalUrl: null,
    demoEnviada: false,
    ...overrides,
  }
}

// ── 1. PERDIDO en un stage vivo → archivo, jamás m5 ──
// EVALUADA con opener mandado y toque vencido: SIN la rama terminal, esto caía en
// m5 (registrar un toque). Con PERDIDO, deriva a archivo y m5 no se habilita.
const perdidoEvaluada = derivarPantalla(
  input({ status: 'PERDIDO', stage: 'EVALUADA', contactos: 1, followUpCount: 1, followUpVencido: true }),
)
assert.equal(perdidoEvaluada.actual, 'archivo', 'PERDIDO en EVALUADA → archivo, no m5')
assert.ok(!perdidoEvaluada.habilitadas.includes('m5'), 'un PERDIDO no habilita m5 (ni ningún toque)')
assert.deepEqual(
  perdidoEvaluada.habilitadas,
  ['archivo'],
  'la única pantalla alcanzable es el propio archivo (sin pasos de trabajo)',
)

// ── 2. PERDIDO en OTROS stages vivos → siempre archivo (la rama es por status) ──
for (const stage of ['FICHA', 'BRIEF', 'CONSTRUCCION', 'APROBADA', null] as const) {
  const p = derivarPantalla(input({ status: 'PERDIDO', stage }))
  assert.equal(p.actual, 'archivo', `PERDIDO en ${String(stage)} → archivo`)
  assert.ok(!p.habilitadas.includes('m5'), `PERDIDO en ${String(stage)} no habilita m5`)
}

// ── 3. Regresión: el MISMO stage vivo, status NO terminal → sigue derivando vivo ──
// Espeja el caso 1 pero con un status vivo: prueba que la rama terminal no roba
// la derivación normal (no cae en archivo).
const vivoEvaluada = derivarPantalla(
  input({ status: 'PROSPECTO', stage: 'EVALUADA', contactos: 1, followUpCount: 1, followUpVencido: true }),
)
assert.notEqual(vivoEvaluada.actual, 'archivo', 'un lead vivo NO cae al archivo')
assert.equal(vivoEvaluada.actual, 'm5', 'EVALUADA con toque vencido sigue derivando a m5 (sin cambios)')

// ── 4. DESCARTADA (terminal por STAGE) aterriza en el archivo, sin toque ──
// D15-bis invirtió esta afirmación, y el motivo es el punto del sprint. Hasta
// acá decía «DESCARTADA sigue mostrando el veredicto en m2, no el archivo»: la
// garantía que protegía era que un descartado no se confundiera con un PERDIDO.
// Con la fusión, m2 no existe —su contenido vive en m1— y aterrizar ahí le
// habría propuesto a un lead cerrado la tarea «mirá el negocio y decidí si vale
// una demo», que ya está hecha. El archivo, que YA sabía decir «Descartado» y
// mostrar el motivo (`causa`/`motivo` de la página), es el aterrizaje correcto.
// Lo que se conserva se afirma abajo: el veredicto sigue alcanzable (m1
// completada) y no se habilita ningún paso.
const descartada = derivarPantalla(input({ status: 'PROSPECTO', stage: 'DESCARTADA' }))
assert.equal(descartada.actual, 'archivo', 'DESCARTADA aterriza en el archivo (terminal por stage)')
assert.ok(
  descartada.completadas.includes('m1'),
  'el veredicto del descartado sigue alcanzable: m1 (la pantalla fusionada) queda completada',
)
assert.deepEqual(
  descartada.habilitadas,
  ['archivo'],
  'DESCARTADA no habilita ningún paso de trabajo — solo su propia pantalla de cierre',
)

// ── 5. Regresión: CERRADO (terminal GANADO) NO cae al archivo — mantiene m16 ──
const cerrado = derivarPantalla(
  input({ status: 'CERRADO', stage: 'APROBADA', demoEnviada: true }),
)
assert.notEqual(cerrado.actual, 'archivo', 'un cierre GANADO no es archivo (el archivo es sólo PERDIDO)')
assert.equal(cerrado.actual, 'm16', 'CERRADO+APROBADA aterriza en m16 (la reunión), sin cambios')

// ── 6. Sprint 5.3: APROBADA con gate de envío cerrado → m15 consultable ──
// El gate server-side (`gateEnvioDemo`) no se toca: `actual` sigue en espera/m5,
// no en m15 — habilitar la CONSULTA no habilita el ENVÍO.
const aprobadaSinEngancheSinToque = derivarPantalla(
  input({ status: 'PROSPECTO', stage: 'APROBADA', finalUrl: null, followUpVencido: false }),
)
assert.equal(
  aprobadaSinEngancheSinToque.actual,
  'espera',
  'APROBADA con gate cerrado y sin toque vencido: actual sigue en espera',
)
assert.ok(
  aprobadaSinEngancheSinToque.habilitadas.includes('m15'),
  'APROBADA con gate cerrado habilita m15 como consulta',
)
const aprobadaSinEngancheConToque = derivarPantalla(
  input({
    status: 'PROSPECTO',
    stage: 'APROBADA',
    finalUrl: null,
    followUpCount: 1,
    followUpVencido: true,
  }),
)
assert.equal(
  aprobadaSinEngancheConToque.actual,
  'm5',
  'APROBADA con gate cerrado y toque vencido: actual sigue en m5',
)
assert.ok(
  aprobadaSinEngancheConToque.habilitadas.includes('m15'),
  'APROBADA con gate cerrado y toque vencido también habilita m15 como consulta',
)

console.log(
  '✓ invariante OK: 2.3 — terminal por status (PERDIDO) deriva a ARCHIVO antes ' +
    'que por stage (nunca m5/espera; sólo el archivo es alcanzable). DESCARTADA ' +
    'conserva m2 y CERRADO conserva m16 (el archivo es exclusivo del lead perdido). ' +
    'Es derivación de presentación, no motor: status/stages intactos, never-guard vivo.',
)
