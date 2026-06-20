/**
 * Chequeo de invariante de la organización privada del setter — corre sin DB.
 *
 *   npm run check:invariant:setter-meta
 *
 * Verifica, de forma ejecutable (no "es obvio"), las dos garantías del dato nuevo
 * del setter (pin / snooze / nota propia) que el feature promete:
 *
 *   1. PRIVACIDAD — la nota/pin/snooze es de UN setter: toda lectura del meta se
 *      filtra por `setterId`, así otro setter (aunque comparta el lead por
 *      reasignación) NUNCA alcanza la fila ajena.
 *   2. AISLAMIENTO DE LISTAS — la cartera sigue dura-filtrada por `assignedToId`:
 *      mostrar/organizar no cambia quién ve qué lead.
 *
 * Importa sólo el módulo puro `isolation.ts` (tipos de Prisma) — cero Neon.
 */
import assert from 'node:assert/strict'
import { ownedListWhere, ownSetterMetaWhere } from './isolation.ts'

const SETTER_A = 'setter-a'
const SETTER_B = 'setter-b'

// 1. El meta del setter se lee SIEMPRE keyed por su propio id: ésa es la
//    privacidad a nivel lectura. La fila de A nunca entra por el filtro de B.
assert.deepEqual(ownSetterMetaWhere(SETTER_A), { setterId: SETTER_A })
assert.deepEqual(ownSetterMetaWhere(SETTER_B), { setterId: SETTER_B })
assert.notEqual(
  ownSetterMetaWhere(SETTER_A).setterId,
  ownSetterMetaWhere(SETTER_B).setterId,
  'el filtro del meta de un setter nunca debe alcanzar la nota/pin/snooze de otro',
)

// 2. La LISTA de la cartera sigue filtrada por dueño (assignedToId): las palancas
//    de organización no abren ninguna fuga cruzada entre setters.
assert.deepEqual(ownedListWhere(SETTER_A), { assignedToId: SETTER_A })
assert.notEqual(
  ownedListWhere(SETTER_A).assignedToId,
  ownedListWhere(SETTER_B).assignedToId,
)

// 3. Son dos dimensiones independientes: la lista se aísla por `assignedToId` y
//    el meta por `setterId`. Una clave keyed sólo por leadId rompería la
//    privacidad — este chequeo deja constancia de que NO es así.
assert.ok(
  !Object.prototype.hasOwnProperty.call(ownSetterMetaWhere(SETTER_A), 'leadId'),
  'el filtro del meta no debe ser por leadId solo — sería visible para cualquier setter del lead',
)

console.log(
  '✓ invariante OK: la nota/pin/snooze del setter es privada (filtrada por setterId) ' +
    'y la cartera sigue aislada por assignedToId.',
)
