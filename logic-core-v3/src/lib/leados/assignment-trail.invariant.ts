/**
 * Chequeo de invariante (cruza ownership) — corre sin DB.
 *
 *   npm run check:invariant
 *
 * Verifica, de forma ejecutable (no "es obvio"), que MOSTRAR el rastro de
 * reasignación NO cambia quién ve qué:
 *   - el filtro de ownership del setter es idéntico (sigue viendo solo lo suyo);
 *   - el evento interno (SISTEMA) queda EXCLUIDO de toda lectura comercial,
 *     así que no infla `contactos` ni reordena la cartera de nadie.
 *
 * Importa solo el módulo puro `isolation.ts` (tipos/enum de Prisma) — cero
 * acceso a Neon, cero efectos.
 */
import assert from 'node:assert/strict'
import { ActivityChannel } from '@prisma/client'
import {
  esContactoComercial,
  ownedLeadWhere,
  ownedListWhere,
  SOLO_CONTACTOS_COMERCIALES,
} from './isolation.ts'

const SETTER_A = 'setter-a'
const SETTER_B = 'setter-b'
const LEAD = 'lead-1'

// 1. Ownership de un lead: id + dueño. Un lead se alcanza SOLO bajo el id de
//    su dueño actual — reasignar A→B saca el lead del alcance de A.
const whereA = ownedLeadWhere(LEAD, SETTER_A)
assert.deepEqual(whereA, { id: LEAD, assignedToId: SETTER_A })
const whereB = ownedLeadWhere(LEAD, SETTER_B)
assert.notEqual(
  whereA.assignedToId,
  whereB.assignedToId,
  'el filtro de un setter nunca debe alcanzar al lead de otro',
)

// 2. La LISTA del setter está dura-filtrada por dueño (sin fugas cruzadas).
assert.deepEqual(ownedListWhere(SETTER_A), { assignedToId: SETTER_A })
assert.notEqual(
  ownedListWhere(SETTER_A).assignedToId,
  ownedListWhere(SETTER_B).assignedToId,
)

// 3. El rastro de reasignación (SISTEMA) NO es contacto comercial: queda fuera
//    de los conteos/últimos-contactos que ordenan la cartera.
assert.equal(esContactoComercial(ActivityChannel.SISTEMA), false)

// 4. ...y NO se excluye nada de más: todo canal que no sea SISTEMA sigue
//    contando como contacto comercial.
const comerciales = Object.values(ActivityChannel).filter(
  (channel) => channel !== ActivityChannel.SISTEMA,
)
assert.ok(comerciales.length >= 1, 'debe haber al menos un canal comercial')
for (const channel of comerciales) {
  assert.equal(
    esContactoComercial(channel),
    true,
    `${channel} debe contar como contacto comercial`,
  )
}

// 5. El filtro Prisma reutilizable excluye EXACTAMENTE el evento interno.
assert.deepEqual(SOLO_CONTACTOS_COMERCIALES, {
  channel: { not: ActivityChannel.SISTEMA },
})

console.log(
  '✓ invariante OK: mostrar el rastro de reasignación no cambia quién ve qué ' +
    '(ownership intacto, evento interno excluido de lo comercial).',
)
