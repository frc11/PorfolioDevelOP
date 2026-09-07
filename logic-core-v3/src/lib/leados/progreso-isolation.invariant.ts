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
import { parseProgreso } from './flow.ts'
import { clavesDeObjeto, cuerpoDeFuncion, valorDeClave } from '../invariant-call-site.ts'

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

// ── 1b. P27 — EL WRITE REAL TIENE EL GATE ───────────────────────────────────
// La aserción 1 mira `ownedLeadWhere` en aislado: prueba que el helper devuelve
// (id + dueño), no que `saveOwnedProgreso` lo alcance. El censo de P26 lo midió:
// si el write resolviera el dossier con un `findUnique({ where: { leadId } })`
// —sin `getOwnedDossier`— la aserción 1 seguiría verde y el setter escribiría el
// progreso en el dossier de otro. Se lee la fuente del write, acotada a su función.
const saveOwnedProgreso = cuerpoDeFuncion(
  ['src', 'lib', 'leados', 'dossier.ts'],
  'saveOwnedProgreso',
)
assert.match(
  saveOwnedProgreso,
  /const dossier = await getOwnedDossier\(leadId, userId\)\s*\n\s*if \(!dossier\) return null/,
  'el write del progreso perdió el gate `getOwnedDossier(leadId, userId)`.\n' +
    '  Esa llamada es la ÚNICA que resuelve el dossier por (id + dueño) — `ownedLeadWhere` no\n' +
    '  se usa en ningún otro punto de este camino. Sin ella, el `updateMany` de abajo escribe\n' +
    '  por `leadId` pelado: un leadId ajeno (los ids viajan al cliente) y el progreso del\n' +
    '  checklist de otro setter queda pisado. La aserción 1 de arriba NO lo ve: prueba que el\n' +
    '  helper devuelve el filtro correcto, no que el write lo llame.',
)
assert.match(
  saveOwnedProgreso,
  /where:\s*\{\s*leadId:\s*dossier\.leadId,/,
  'el `updateMany` del progreso dejó de keyear por `dossier.leadId` (el del dossier YA ' +
    'verificado) y volvió al `leadId` crudo del parámetro: el gate de arriba deja de proteger ' +
    'la escritura de abajo.',
)

// ── 2. Stage nunca muta: el payload del write es {progresoJson}, sin `stage` ──
const fresco: Progreso = ProgresoSchema.parse({ completadas: [] })
// P27 — el payload YA NO es un espejo escrito acá: es el `data:` recortado de la
// fuente del write. El espejo a mano («const writeData = { progresoJson: fresco }»)
// se satisfacía a sí mismo — el censo de P26 lo listó como tal: «un guardado que
// agregue el stage pasa igual», porque el objeto que se inspeccionaba lo escribía
// este archivo. Ahora se inspecciona el que va a Prisma.
const writeData = valorDeClave(saveOwnedProgreso, 'data', 'el updateMany de saveOwnedProgreso')
assert.deepEqual(
  clavesDeObjeto(writeData),
  ['progresoJson'],
  'el write toca SOLO progresoJson.\n' +
    `  data = ${writeData}\n` +
    '  Es la MISMA exactitud que antes («las claves del payload son exactamente\n' +
    '  [progresoJson]»), ahora sobre el objeto que va a Prisma en vez de sobre un espejo\n' +
    '  escrito dentro de este archivo. Cualquier campo de más —sea `stage` o no— cambia lo\n' +
    '  que el guardado del checklist toca, y eso se decide, no se cuela.',
)
assert.ok(
  !/\bstage\s*:/.test(writeData),
  'el write del progreso agregó `stage` a su payload.\n' +
    `  data = ${writeData}\n` +
    '  Persistir el progreso NO es una transición: la única puerta del stage es\n' +
    '  `transitionDossier`, que valida contra LEGAL_TRANSITIONS. Un `stage` mergeado acá\n' +
    '  mueve el dossier saltándose el grafo — sin validar la transición, sin appendear el\n' +
    '  rechazo, sin el reset del escalamiento. Es la misma clase de bug que el patch del\n' +
    '  escalamiento tiene vigilada en su propio invariante.',
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


// ── 6. UN PROGRESO GUARDADO AYER TIENE QUE SEGUIR PARSEANDO ─────────────────
// La aserción 5 ata `SHELL_CONSTRUCCION` contra `FASE_IDS` y lo hace bien, pero
// las dos listas SE MUEVEN JUNTAS: un renombre coordinado de los ids —el refactor
// natural, y el único que compila— la deja en verde. Y lo que quedaba afuera de
// todo era el blob YA GUARDADO: `parseProgreso` (flow.ts:133) se traga cualquier
// blob que no valide y devuelve un checklist fresco. Sin throw, sin log, sin señal.
//
// C0 lo midió: con `FASE_IDS` renombrado, un setter con cinco fases tildadas se
// queda con cero. Es TODO-O-NADA — no se pierde la fase renombrada, se pierde el
// checklist entero, para todos los setters a la vez.
//
// Este blob está congelado a mano: es lo que hay guardado en `progresoJson` hoy.
// Mientras esta aserción esté verde, lo guardado sigue valiendo. Cuando se ponga en
// rojo, el renombre es real y hay que decidir qué pasa con lo ya guardado —
// migrarlo o aceptar la pérdida— en vez de decidirlo sin enterarse.
const PROGRESO_GUARDADO_AYER = {
  completadas: ['estructura', 'personalizacion', 'assets', 'cta', 'calidad'],
  faseActual: 'mobile',
}

assert.deepEqual(
  parseProgreso(PROGRESO_GUARDADO_AYER),
  PROGRESO_GUARDADO_AYER,
  'un progresoJson guardado con los ids vigentes DEJÓ DE PARSEAR: `parseProgreso` lo ' +
    'descartó y devolvió un checklist fresco. Cambió `FASE_IDS` y los tildes de todos los ' +
    'setters se pierden en silencio (todo-o-nada, no solo la fase renombrada). Si el ' +
    'cambio es a propósito, migrá los blobs guardados y actualizá este fixture en el ' +
    'mismo commit.',
)

// La contracara, para que la aserción de arriba no pueda pasar por accidente: un
// blob con un id que NO está en la lista vigente se descarta ENTERO, y así es como
// se pierde el checklist.
assert.deepEqual(
  parseProgreso({ completadas: [...PROGRESO_GUARDADO_AYER.completadas, 'fase-que-ya-no-existe'] }),
  { completadas: [] },
  'un blob con UN id fuera de FASE_IDS se descarta entero (no se filtra el id malo): eso ' +
    'es lo que vuelve todo-o-nada a la pérdida, y es la razón de la aserción de arriba.',
)
console.log(
  '✓ invariante OK: saveOwnedProgreso aísla por (id + dueño) y su write es solo ' +
    '`{ progresoJson }` sin tocar `stage`; ProgresoSchema valida contra FASE_IDS y ' +
    'el default es un checklist fresco; los ids del shell son exactamente FASE_IDS. Y un ' +
    'progresoJson guardado con los ids vigentes sigue parseando: si FASE_IDS cambia, la ' +
    'pérdida silenciosa de los tildes ya guardados se cae acá.',
)
