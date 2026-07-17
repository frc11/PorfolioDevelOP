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
 *   - DESCARTADA (terminal por STAGE) NO se re-rutea: conserva su case (m3, el
 *     veredicto a la vista) con `habilitadas` vacía — su badge cyan lo apaga C-17
 *     en presentación, no la derivación.
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

// ── 4. Regresión: DESCARTADA (terminal por STAGE) conserva su case (m3, sin toque) ──
const descartada = derivarPantalla(input({ status: 'PROSPECTO', stage: 'DESCARTADA' }))
assert.equal(descartada.actual, 'm3', 'DESCARTADA sigue mostrando el veredicto en m3, no el archivo')
assert.deepEqual(descartada.habilitadas, [], 'DESCARTADA no habilita ningún paso (C-17 apaga el cyan en presentación)')

// ── 5. Regresión: CERRADO (terminal GANADO) NO cae al archivo — mantiene m16 ──
const cerrado = derivarPantalla(
  input({ status: 'CERRADO', stage: 'APROBADA', demoEnviada: true }),
)
assert.notEqual(cerrado.actual, 'archivo', 'un cierre GANADO no es archivo (el archivo es sólo PERDIDO)')
assert.equal(cerrado.actual, 'm16', 'CERRADO+APROBADA aterriza en m16 (la reunión), sin cambios')

console.log(
  '✓ invariante OK: 2.3 — terminal por status (PERDIDO) deriva a ARCHIVO antes ' +
    'que por stage (nunca m5/espera; sólo el archivo es alcanzable). DESCARTADA ' +
    'conserva m3 y CERRADO conserva m16 (el archivo es exclusivo del lead perdido). ' +
    'Es derivación de presentación, no motor: status/stages intactos, never-guard vivo.',
)
