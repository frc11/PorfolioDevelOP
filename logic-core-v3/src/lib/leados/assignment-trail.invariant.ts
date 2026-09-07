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
import { cuerpoDeFuncion } from '../invariant-call-site.ts'

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

// ── 6. P27 — EL RASTRO SE ESCRIBE COMO SISTEMA, Y LO COMERCIAL LO EXCLUYE ────
// Las aserciones 1-5 son sobre helpers en aislado. El censo de P26 nombró el
// hueco exacto: «nada ata el evento del rastro al canal SISTEMA: registrarlo con
// otro canal infla los contactos y las cinco aserciones siguen verdes». Las dos
// promesas del encabezado tienen dos call-sites, y se leen los dos.

// 6a. LA ESCRITURA del rastro es SISTEMA. Si se registrara con un canal
//     comercial, `esContactoComercial` lo dejaría pasar —correctamente, no es
//     su culpa— y una reasignación contaría como un contacto que nadie hizo.
const registrarReasignacion = cuerpoDeFuncion(
  ['src', 'lib', 'leados', 'assignment-trail.ts'],
  'registrarReasignacion',
)
assert.match(
  registrarReasignacion,
  /channel:\s*ActivityChannel\.SISTEMA/,
  'el rastro de reasignación dejó de escribirse con `channel: ActivityChannel.SISTEMA`.\n' +
    '  Ese canal es LO ÚNICO que lo mantiene fuera de las lecturas comerciales: con cualquier\n' +
    '  otro, `SOLO_CONTACTOS_COMERCIALES` lo deja entrar y una reasignación (que hace el\n' +
    '  ADMIN) pasa a contar como contacto del setter — infla `contactos`, mueve el «último\n' +
    '  contacto» y reordena la cartera sin que nadie haya hablado con nadie. Las aserciones\n' +
    '  3-5 de arriba siguen verdes: prueban que SISTEMA se excluye, no que el rastro sea SISTEMA.',
)
assert.match(
  registrarReasignacion,
  /result:\s*null/,
  'el rastro de reasignación dejó de escribirse con `result: null`: un `SIN_RESPUESTA` lo ' +
    'haría contar como DM mandado en el contador de la capa de seguridad de canal ' +
    '(`SOLO_MENSAJES_ENVIADOS`), que es el otro eje que este evento no debe tocar.',
)

// 6b. LA LECTURA comercial excluye el evento interno EN LA CONSULTA. Es la
//     contracara: de nada sirve escribir SISTEMA si el conteo dejó de filtrarlo.
const listOwnedLeads = cuerpoDeFuncion(['src', 'lib', 'leados', 'ownership.ts'], 'listOwnedLeads')
assert.match(
  listOwnedLeads,
  /_count:\s*\{\s*select:\s*\{\s*activities:\s*\{\s*where:\s*SOLO_CONTACTOS_COMERCIALES\s*\}\s*\}\s*\}/,
  'el `_count` de la cartera dejó de filtrar por `SOLO_CONTACTOS_COMERCIALES`.\n' +
    '  Es el conteo que agrupa el home del setter: sin el filtro, la reasignación (SISTEMA)\n' +
    '  cuenta como contacto y un lead recién reasignado salta de grupo sin que su nuevo dueño\n' +
    '  lo haya trabajado — el bug que el rastro de 0.5.3 estuvo a punto de introducir.',
)
assert.match(
  listOwnedLeads,
  /where:\s*ownedListWhere\(/,
  'la lista del setter dejó de armarse con `ownedListWhere`: la aserción 2 pasa a hablar de ' +
    'un helper que la consulta ya no llama.',
)

const getOwnedLead = cuerpoDeFuncion(['src', 'lib', 'leados', 'ownership.ts'], 'getOwnedLead')
assert.match(
  getOwnedLead,
  /where:\s*ownedLeadWhere\(leadId, userId\)/,
  'la puerta de un lead individual (`getOwnedLead`) dejó de armarse con `ownedLeadWhere`. Es ' +
    'el anti-IDOR del que cuelgan TODAS las actions del setter: la aserción 1 prueba que el ' +
    'helper compone (id + dueño), ésta prueba que la consulta lo use.',
)

console.log(
  '✓ invariante OK: mostrar el rastro de reasignación no cambia quién ve qué ' +
    '(ownership intacto, evento interno excluido de lo comercial) — y las consultas REALES ' +
    'lo sostienen: el rastro se escribe como SISTEMA/result null, el `_count` de la cartera ' +
    'filtra por SOLO_CONTACTOS_COMERCIALES y las dos puertas usan sus helpers de ownership.',
)
