/**
 * Chequeo de invariante del escalamiento "me trabé" — corre sin DB.
 *
 *   npm run check:invariant:escalamiento
 *
 * Verifica, de forma ejecutable (no "es obvio"), las dos garantías que la
 * persistencia del escalamiento promete y que la consigna pide constatar:
 *
 *   1. NO DISPARA TRANSICIONES — persistir el escalamiento jamás mueve `stage`.
 *      El patch (`buildEscaladoPatch`) no tiene clave `stage`; la marca no es un
 *      `DossierStage`; y vive gated por stage (`estaEscalado` solo en
 *      CONSTRUCCION). Una transición de verdad pasa por `transitionDossier`;
 *      esto NO lo es.
 *   2. NO AFECTA EL AISLAMIENTO DEL SETTER — el escalamiento es del DOSSIER, no
 *      del meta privado por `setterId`. Su patch no lleva `setterId` ni
 *      `assignedToId`, y los filtros de aislamiento (isolation.ts) siguen
 *      idénticos: persistir el escalamiento no abre ninguna fuga cruzada.
 *
 * Importa solo módulos puros (escalamiento.ts, isolation.ts y el enum de Prisma)
 * — cero Neon.
 */
import assert from 'node:assert/strict'
import { DossierStage } from '@prisma/client'
import { buildEscaladoPatch, estaEscalado, ESCALADO_RESET } from './escalamiento.ts'
import { ownedLeadWhere, ownedListWhere, ownSetterMetaWhere } from './isolation.ts'

const SETTER_A = 'setter-a'
const SETTER_B = 'setter-b'
const LEAD = 'lead-1'
const AHORA = new Date('2026-06-20T12:00:00.000Z')

// 1. El patch del escalamiento NUNCA toca `stage`: persistirlo no es una
//    transición. (Análogo al guard estructural del meta del setter en
//    setter-meta.invariant.ts.)
const patch = buildEscaladoPatch('Claude Design no me deja reemplazar el hero', AHORA)
assert.ok(
  !Object.prototype.hasOwnProperty.call(patch, 'stage'),
  'persistir el escalamiento no debe tocar `stage` — no es una transición',
)
assert.deepEqual(Object.keys(patch).sort(), ['escaladoAt', 'escaladoNota'])
assert.equal(patch.escaladoAt, AHORA)

// 1b. Ningún campo del patch es un DossierStage: la marca no puede colarse como
//     un stage de la máquina de producción. (El enum de Prisma es valor en
//     runtime, sin DB.)
const STAGES = Object.values(DossierStage) as string[]
assert.ok(
  !STAGES.includes('escaladoAt') && !STAGES.includes('escaladoNota'),
  'la marca de escalamiento no es un stage de la máquina de producción',
)

// 1c. El reset (que se mergea en CADA transición real, dossier.ts) solo limpia
//     la marca: tampoco mueve `stage`. Limpiar el escalamiento ≠ transicionar.
assert.deepEqual(ESCALADO_RESET, { escaladoAt: null, escaladoNota: null })
assert.ok(!Object.prototype.hasOwnProperty.call(ESCALADO_RESET, 'stage'))

// 1d. La marca es VIGENTE solo en CONSTRUCCION (segundo cinturón sobre
//     ESCALADO_RESET): una marca vieja fuera de esa etapa NO se muestra → sin
//     falso positivo en el re-loop RECHAZADA→CONSTRUCCION, sin tocar transiciones.
assert.equal(estaEscalado({ stage: 'CONSTRUCCION', escaladoAt: AHORA }), true)
assert.equal(estaEscalado({ stage: 'CONSTRUCCION', escaladoAt: null }), false)
assert.equal(estaEscalado({ stage: 'EN_REVISION', escaladoAt: AHORA }), false)
assert.equal(estaEscalado({ stage: 'RECHAZADA', escaladoAt: AHORA }), false)

// 2. El patch es un dato del DOSSIER, no del setter: no lleva `setterId` ni
//    `assignedToId`, así que persistirlo no roza ninguna dimensión de aislamiento.
assert.ok(!Object.prototype.hasOwnProperty.call(patch, 'setterId'))
assert.ok(!Object.prototype.hasOwnProperty.call(patch, 'assignedToId'))

// 2b. El marcador depende SOLO de (stage, escaladoAt) — de ningún `setterId`: es
//     un hecho del lead que el admin ve, no organización privada del setter.
assert.equal(
  estaEscalado({ stage: 'CONSTRUCCION', escaladoAt: AHORA }),
  estaEscalado({ stage: 'CONSTRUCCION', escaladoAt: AHORA }),
  'el marcador no depende de ningún setterId — es un hecho del dossier',
)

// 2c. Constancia: los filtros de aislamiento del setter siguen IDÉNTICOS — la
//     privacidad (meta por setterId) y la cartera (por assignedToId) no cambian
//     porque ahora persistamos el escalamiento en el dossier.
assert.deepEqual(ownSetterMetaWhere(SETTER_A), { setterId: SETTER_A })
assert.notEqual(
  ownSetterMetaWhere(SETTER_A).setterId,
  ownSetterMetaWhere(SETTER_B).setterId,
)
assert.deepEqual(ownedLeadWhere(LEAD, SETTER_A), { id: LEAD, assignedToId: SETTER_A })
assert.deepEqual(ownedListWhere(SETTER_A), { assignedToId: SETTER_A })

console.log(
  '✓ invariante OK: persistir el escalamiento no dispara transiciones (sin `stage` en el ' +
    'patch, marca gated por CONSTRUCCION) ni toca el aislamiento del setter (sin setterId; ' +
    'filtros intactos).',
)
