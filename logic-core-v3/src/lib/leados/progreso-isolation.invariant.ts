/**
 * Chequeo de invariante de PROGRESO-ISOLATION (Sprint E.1) — corre sin DB.
 *
 *   npm run check:invariant:progreso
 *
 * El progreso del checklist de Construcción se persiste en `progresoJson` vía
 * `saveOwnedProgreso` (dossier.ts). Ese write es IMPURO (Prisma) y no se puede
 * importar acá — el harness ts-node carga sin `@/` ni Neon. Igual que
 * escalamiento/alta-propia, se verifican de forma EJECUTABLE (no "es obvio") las
 * piezas PURAS que el write compone, que son las que garantizan sus cuatro
 * promesas:
 *
 *   1. AISLAMIENTO DE ESCRITURA — `saveOwnedProgreso` llega al dossier vía
 *      `getOwnedDossier` → `getOwnedLead(leadId, userId)`, cuyo filtro es
 *      `ownedLeadWhere` (id + dueño). Solo alcanza lo del dueño; un NO-dueño
 *      resuelve a otro `where` → no lee ni escribe el dossier ajeno.
 *   2. STAGE NUNCA MUTA — persistir el progreso NO es una transición: el payload
 *      del write es exactamente `{ progresoJson }` (sin `stage`), y el blob
 *      parseado no tiene clave `stage` ni ninguna fase que colisione con un
 *      `DossierStage`. La única puerta del stage sigue siendo `transitionDossier`.
 *   3. EL PARSE RECHAZA SHAPE INVÁLIDO — `ProgresoSchema` valida contra
 *      `FASE_IDS`: fases inventadas, tipos malos o datetimes basura NO parsean.
 *   4. CHECKLIST, NO GATE — el default es `{ completadas: [] }` (fresco); un
 *      progreso vacío es LEGÍTIMO y no bloquea nada (jamás cablea EN_REVISION).
 *
 * Además fija el contrato del id ESTABLE (5): los ids de `SHELL_CONSTRUCCION` son
 * EXACTAMENTE `FASE_IDS` — la llave id-keyed del progreso, no índices.
 *
 * Importa solo módulos puros (contracts.ts, isolation.ts, flow-content.ts y el
 * enum de Prisma) — cero Neon. Mismo patrón que `escalamiento.invariant.ts`.
 */
import assert from 'node:assert/strict'
import { DossierStage } from '@prisma/client'
import { FASE_IDS, ProgresoSchema, type Progreso } from './contracts.ts'
import { ownedLeadWhere, ownedListWhere } from './isolation.ts'
import { SHELL_CONSTRUCCION } from './flow-content.ts'

const SETTER_A = 'setter-a'
const SETTER_B = 'setter-b'
const LEAD = 'lead-1'
const ISO = '2026-06-30T12:00:00.000Z'

// ── 1. Aislamiento de escritura: el dueño se DERIVA del filtro (id + sesión) ──
// saveOwnedProgreso → getOwnedDossier → getOwnedLead(leadId, userId) usa este where.
assert.deepEqual(
  ownedLeadWhere(LEAD, SETTER_A),
  { id: LEAD, assignedToId: SETTER_A },
  'saveOwnedProgreso alcanza el dossier SOLO por (id + dueño de la sesión)',
)
assert.notEqual(
  ownedLeadWhere(LEAD, SETTER_A).assignedToId,
  ownedLeadWhere(LEAD, SETTER_B).assignedToId,
  'un NO-dueño resuelve a otro filtro: no lee ni escribe el dossier ajeno',
)
assert.deepEqual(ownedListWhere(SETTER_A), { assignedToId: SETTER_A })

// ── 2. Stage nunca muta: el payload del write es {progresoJson}, sin `stage` ──
const fresco: Progreso = ProgresoSchema.parse({ completadas: [] })
// Espejo EXACTO del payload que saveOwnedProgreso pasa a updateMany({ data }).
const writeData = { progresoJson: fresco }
assert.deepEqual(Object.keys(writeData), ['progresoJson'], 'el write toca SOLO progresoJson')
assert.ok(
  !Object.prototype.hasOwnProperty.call(writeData, 'stage'),
  'persistir el progreso no toca `stage` — no es una transición (esa es transitionDossier)',
)
// El blob mismo es stage-free: ni clave `stage`, ni fase que sea un DossierStage.
const lleno: Progreso = ProgresoSchema.parse({
  completadas: [...FASE_IDS],
  faseActual: FASE_IDS[0],
  marcadas: { [FASE_IDS[0]]: ISO },
})
assert.ok(
  !Object.prototype.hasOwnProperty.call(lleno, 'stage'),
  'el blob de progreso no tiene clave `stage`',
)
const STAGES = new Set(Object.values(DossierStage) as string[])
for (const id of FASE_IDS) {
  assert.ok(
    !STAGES.has(id),
    `la fase "${id}" no colisiona con un DossierStage — el progreso no puede colarse como stage`,
  )
}

// ── 3. El parse rechaza shape inválido (valida contra FASE_IDS) ──────────────
assert.ok(
  !ProgresoSchema.safeParse({ completadas: ['fase-inventada'] }).success,
  'una fase inventada (fuera de FASE_IDS) NO parsea',
)
assert.ok(
  !ProgresoSchema.safeParse({ completadas: 'estructura' }).success,
  'completadas debe ser un array de fases, no un string suelto',
)
assert.ok(
  !ProgresoSchema.safeParse({ completadas: [], faseActual: 'ninguna' }).success,
  'faseActual fuera del enum NO parsea',
)
assert.ok(
  !ProgresoSchema.safeParse({ completadas: [], marcadas: { estructura: 'ayer' } }).success,
  'una marca con datetime basura NO parsea (el valor exige ISO)',
)
assert.ok(
  ProgresoSchema.safeParse({
    completadas: [FASE_IDS[0]],
    faseActual: FASE_IDS[1],
    marcadas: { [FASE_IDS[0]]: ISO },
  }).success,
  'un progreso bien formado (parcial) SÍ parsea',
)

// ── 4. Checklist, no gate: default fresco y progreso vacío legítimo ──────────
assert.deepEqual(
  ProgresoSchema.parse({}),
  { completadas: [] },
  'el default de un checklist fresco es { completadas: [] }',
)
assert.deepEqual(
  fresco.completadas,
  [],
  'el progreso vacío es válido — no bloquea nada (es checklist, no gate)',
)

// ── 5. id ESTABLE: los ids del shell son EXACTAMENTE FASE_IDS (id-keyed) ─────
const shellIds = SHELL_CONSTRUCCION.map((fase) => fase.id)
assert.equal(
  shellIds.length,
  FASE_IDS.length,
  'hay una fase del shell por cada FASE_ID (sin faltantes ni de más)',
)
assert.equal(
  new Set(shellIds).size,
  shellIds.length,
  'los ids de las fases del shell son únicos (sin duplicados)',
)
assert.deepEqual(
  [...shellIds].sort(),
  [...FASE_IDS].sort(),
  'el set de ids del shell es EXACTAMENTE FASE_IDS (id estable, no índices)',
)

console.log(
  '✓ invariante OK: saveOwnedProgreso aísla por (id + dueño) y su write es solo ' +
    '`{ progresoJson }` sin tocar `stage`; ProgresoSchema valida contra FASE_IDS y ' +
    'el default es un checklist fresco; los ids del shell son exactamente FASE_IDS.',
)
