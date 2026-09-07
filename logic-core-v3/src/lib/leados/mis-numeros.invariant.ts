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
import { cuerpoDeFuncion } from '../invariant-call-site.ts'

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

// ── 6. P27 — LA PÁGINA REAL ENGANCHA LOS DOS CANDADOS ───────────────────────
// La aserción 1 mira `ownedListWhere` en aislado y la 2 mira `filasCriterioPropio`
// con un `userId` que este archivo elige. El censo de P26 nombró las dos mitades
// del hueco: «el candado de query se afirma sobre el helper en aislado y NADA ATA
// LA PÁGINA A ÉL». Los números son un derivado puro: su aislamiento no vive acá,
// vive en QUÉ leads recibe y con QUÉ id se los atribuye. Eso pasa en la página.
const paginaSetter = cuerpoDeFuncion(
  ['src', 'app', '(protected)', 'setter', 'page.tsx'],
  'SetterHomePage',
)

// 6a. Candado de query: los leads salen de la ÚNICA puerta aislada, no de una
//     consulta propia de la página.
assert.match(
  paginaSetter,
  /const leads = await listOwnedLeads\(userId\)/,
  'la home del setter dejó de alimentar sus números con `listOwnedLeads(userId)`.\n' +
    '  Ese es el candado de query entero: `listOwnedLeads` es la única lectura de listas que\n' +
    '  filtra por `ownedListWhere`. Si la página arma su propia consulta —o recibe los leads\n' +
    '  de otra fuente— «Mis números» pasa a contar leads que no son del setter, y la\n' +
    '  aserción 1 de arriba sigue verde: prueba que el helper devuelve `{ assignedToId }`,\n' +
    '  no que estos números vengan de él.',
)

// 6b. Candado de cálculo: la atribución sale del `userId` DE LA SESIÓN.
assert.match(
  paginaSetter,
  /const userId = await requireSetter\(\)/,
  '`SetterHomePage` dejó de derivar `userId` de `requireSetter()`. Ése es el origen de los ' +
    'dos candados a la vez: el mismo id filtra la query y atribuye las filas del ratio. Un ' +
    'id que venga de otro lado (un search param, un prop) los abre los dos de una vez.',
)
assert.match(
  paginaSetter,
  /derivarMisNumeros\(leads, userId\)/,
  'la home dejó de atribuir los números al `userId` de la sesión.\n' +
    '  Las aserciones 2-2c prueban que `filasCriterioPropio` etiqueta cada fila con el id que\n' +
    '  se le pasa, y que por eso el resultado tiene a lo sumo UN setter. Cuál id se le pasa\n' +
    '  lo decide ESTA línea: con un id leído del lead (`leads[0].assignedToId`) el cálculo\n' +
    '  seguiría produciendo un solo bucket —verde en 2c— pero el bucket sería el de OTRO.',
)

console.log(
  '✓ invariante OK: "Mis números" aislados — entrada por cartera propia ' +
    '(assignedToId) y atribución por la sesión (jamás un id del lead). El setter ' +
    'solo ve SUS activos y SU ratio; el cálculo reusa calcularRatioSetters tal cual.',
)
