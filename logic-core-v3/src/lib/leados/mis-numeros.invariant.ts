/**
 * Chequeo de invariante de "Mis números" del setter — corre sin DB.
 *
 *   npm run check:invariant:mis-numeros
 *
 * Verifica, de forma ejecutable (no "es obvio"), la garantía central que el
 * sprint promete y que la consigna pide constatar: el setter ve SOLO SUS
 * números, jamás los de otro. La aislación tiene dos candados, y se chequean los
 * dos:
 *
 *   1. ENTRADA AISLADA (nivel query) — los leads que alimentan los números vienen
 *      de `listOwnedLeads`, filtrados por `ownedListWhere(userId)` =
 *      `{ assignedToId: userId }`. La cartera de A nunca alcanza la de B.
 *   2. ATRIBUCIÓN PROPIA (nivel cálculo) — `filasCriterioPropio` etiqueta CADA
 *      fila del ratio con el `userId` de la sesión, nunca con un id leído del
 *      lead. Así el cálculo compartido (`calcularRatioSetters`) solo puede
 *      bucketear bajo el setter propio: el resultado tiene a lo sumo UN setter, y
 *      es él. Aunque entrara una fila ajena, no hay camino para verla.
 *
 * Y la correctitud del reuso: activos = no terminales; el ratio total/30d sale
 * idéntico al de `calcularRatioSetters` (misma fuente que el admin).
 *
 * Importa solo módulos puros (mis-numeros, revision, isolation) — cero Neon y
 * cero `@/` en el grafo de runtime (mismo criterio liviano que los otros checks).
 */
import assert from 'node:assert/strict'
import {
  calcularMisNumeros,
  filasCriterioPropio,
  type LeadParaNumeros,
} from './mis-numeros.ts'
import { calcularRatioSetters } from './revision.ts'
import { ownedListWhere } from './isolation.ts'

const SETTER_A = 'setter-a'
const SETTER_B = 'setter-b'
const AHORA = new Date('2026-06-20T12:00:00.000Z')
const RECIENTE = '2026-06-19T12:00:00.000Z' // dentro de los 30 días
const VIEJO = '2026-04-01T12:00:00.000Z' // > 30 días atrás

type Veredicto = 'DESCARTAR' | 'AVANZAR' | 'CALIENTE'

/** Evaluación válida para `EvaluacionSchema` (score, veredicto, razonamiento). */
function ev(veredicto: Veredicto, fecha?: string): Record<string, unknown> {
  return {
    score: veredicto === 'DESCARTAR' ? 2 : 4,
    veredicto,
    razonamiento: 'fixture',
    ...(fecha ? { fecha } : {}),
  }
}

// Cartera de A: 3 activos + 2 terminales; 4 evaluaciones (2 descartes / 2 avances),
// 3 de ellas dentro de los 30 días.
const CARTERA_A: LeadParaNumeros[] = [
  { status: 'PROSPECTO', dossier: { evaluacionJson: ev('DESCARTAR', RECIENTE) } },
  { status: 'RESPONDIO', dossier: { evaluacionJson: ev('AVANZAR', RECIENTE) } },
  { status: 'CALL_AGENDADA', dossier: { evaluacionJson: ev('CALIENTE', RECIENTE) } },
  { status: 'CERRADO', dossier: { evaluacionJson: ev('DESCARTAR', VIEJO) } }, // terminal
  { status: 'PERDIDO', dossier: null }, // terminal, sin evaluar
]

// ── 1. Entrada aislada (nivel query): la cartera de A nunca alcanza la de B ──
assert.deepEqual(ownedListWhere(SETTER_A), { assignedToId: SETTER_A })
assert.notEqual(
  ownedListWhere(SETTER_A).assignedToId,
  ownedListWhere(SETTER_B).assignedToId,
  'los números de un setter se alimentan SOLO de su cartera (assignedToId propio)',
)

// ── 2. Atribución propia (nivel cálculo): cada fila lleva el id de la sesión ──
const filasA = filasCriterioPropio(CARTERA_A, SETTER_A)
assert.ok(
  filasA.every((fila) => fila.setterId === SETTER_A),
  'toda fila del ratio se atribuye al userId de la sesión, nunca a un id del lead',
)
assert.ok(
  !filasA.some((fila) => fila.setterId === SETTER_B),
  'ninguna fila puede caer bajo otro setter',
)

// 2b. La MISMA cartera, leída como B, atribuye TODO a B — la atribución sigue a
//     la sesión, no al dato. No hay forma de que A y B vean el mismo bucket.
const filasComoB = filasCriterioPropio(CARTERA_A, SETTER_B)
assert.ok(
  filasComoB.every((fila) => fila.setterId === SETTER_B),
  'cambiar de sesión cambia el dueño de las filas — el dato no arrastra setter',
)

// 2c. El cálculo compartido produce a lo sumo UN setter, y es el propio: no hay
//     camino para que los números de otro aparezcan.
const buckets = calcularRatioSetters(filasA, AHORA)
assert.ok(buckets.length <= 1, 'los números propios nunca producen más de un setter')
assert.equal(buckets[0]?.setterId, SETTER_A, 'el único bucket posible es el propio')

// ── 3. Correctitud del reuso (activos + ratio idéntico al de calcularRatioSetters) ──
const numeros = calcularMisNumeros(CARTERA_A, SETTER_A, AHORA)
assert.equal(numeros.activos, 3, 'activos = leads no terminales (CERRADO/PERDIDO fuera)')
assert.equal(numeros.enCartera, 5)
assert.ok(numeros.criterio !== null)
assert.deepEqual(numeros.criterio.total, { evaluadas: 4, descartadas: 2, avanzadas: 2 })
assert.equal(numeros.criterio.pctTotal, 50)
assert.deepEqual(numeros.criterio.ultimos30d, { evaluadas: 3, descartadas: 1, avanzadas: 2 })
assert.equal(numeros.criterio.pct30d, 33)
assert.equal(numeros.criterio.sinFecha, 0)

// 3b. El criterio sale IDÉNTICO a calcular el ratio directo (mismo cálculo puro,
//     no una copia): el setter y el admin cuentan igual.
const [ratioDirecto] = calcularRatioSetters(filasA, AHORA)
assert.deepEqual(numeros.criterio.total, ratioDirecto.total)
assert.deepEqual(numeros.criterio.ultimos30d, ratioDirecto.ultimos30d)

// ── 4. Evaluación sin fecha (pre-B5): cuenta en el total, no en los 30 días ──
const conSinFecha: LeadParaNumeros[] = [
  { status: 'PROSPECTO', dossier: { evaluacionJson: ev('DESCARTAR') } }, // sin fecha
]
const numerosSinFecha = calcularMisNumeros(conSinFecha, SETTER_A, AHORA)
assert.equal(numerosSinFecha.criterio?.sinFecha, 1)
assert.equal(numerosSinFecha.criterio?.total.evaluadas, 1)
assert.equal(numerosSinFecha.criterio?.ultimos30d.evaluadas, 0)

// ── 5. Setter nuevo (cartera vacía): sin números, sin criterio (no rompe) ──
const vacios = calcularMisNumeros([], SETTER_A, AHORA)
assert.equal(vacios.activos, 0)
assert.equal(vacios.enCartera, 0)
assert.equal(vacios.criterio, null)

console.log(
  '✓ invariante OK: "Mis números" aislados — entrada por cartera propia ' +
    '(assignedToId) y atribución por la sesión (jamás un id del lead). El setter ' +
    'solo ve SUS activos y SU ratio; el cálculo reusa calcularRatioSetters tal cual.',
)
