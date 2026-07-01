/**
 * Chequeo de invariante de ALTA PROPIA del setter (Sprint A.1) — corre sin DB.
 *
 *   npm run check:invariant:alta-propia
 *
 * Verifica, de forma ejecutable (no "es obvio"), el invariante #1 (aislamiento) en
 * la ESCRITURA: cuando el setter carga su propio prospecto, el dueño se DERIVA de
 * la sesión — jamás de un campo del cliente (anti-IDOR de escritura). Y entra
 * FRÍO: el setter no marca caliente (eso es de Franco al asignar).
 *
 * Importa solo el módulo puro `isolation.ts` — cero acceso a Neon, cero efectos.
 */
import assert from 'node:assert/strict'
import {
  FUENTE_SETTER,
  ownedLeadCreateData,
  ownedLeadWhere,
  ownedListWhere,
} from './isolation.ts'

const SETTER_A = 'setter-a'
const SETTER_B = 'setter-b'

// 1. El dueño se DERIVA de la sesión: un alta limpia queda asignada al setter.
const limpio = ownedLeadCreateData({ businessName: 'Café Tostado' }, SETTER_A)
assert.equal(
  limpio.assignedToId,
  SETTER_A,
  'el lead nuevo se asigna al setter de la sesión',
)

// 2. ANTI-IDOR DE ESCRITURA — el corazón del sprint: aunque el input INTENTE
//    inyectar otro `assignedToId` (y un `caliente: true`), el builder no lo lee —
//    arma el registro campo por campo y fuerza la sesión. El setter NO puede crear
//    un lead asignado a otro. Cast vía `unknown` para simular el payload hostil
//    que el tipo normalmente prohíbe.
const inyectado = ownedLeadCreateData(
  {
    businessName: 'Phishing SRL',
    assignedToId: SETTER_B,
    caliente: true,
  } as unknown as Parameters<typeof ownedLeadCreateData>[0],
  SETTER_A,
)
assert.equal(
  inyectado.assignedToId,
  SETTER_A,
  'un assignedToId del cliente NUNCA debe ganarle a la sesión (anti-IDOR de escritura)',
)
assert.notEqual(
  inyectado.assignedToId,
  SETTER_B,
  'el lead jamás queda en la cartera de otro setter (sin fuga de escritura)',
)

// 3. Entra FRÍO: el setter no marca caliente — ni siquiera inyectándolo.
assert.equal(limpio.caliente, false, 'el lead auto-cargado entra frío')
assert.equal(
  inyectado.caliente,
  false,
  'inyectar caliente=true no crea un lead caliente: lo marca Franco al asignar, no el setter',
)

// 4. La frontera de ESCRITURA es la MISMA que la de LECTURA: el lead recién creado
//    cae EXACTO bajo el filtro de la cartera del propio setter, y NUNCA bajo el de
//    otro — `assignedToId === sesión` en ambos lados (alta y lista).
assert.equal(limpio.assignedToId, ownedListWhere(SETTER_A).assignedToId)
assert.notEqual(limpio.assignedToId, ownedListWhere(SETTER_B).assignedToId)
assert.equal(
  ownedLeadWhere('cualquier-id', SETTER_A).assignedToId,
  limpio.assignedToId,
  'el dueño del alta y el del filtro anti-IDOR de lectura son el mismo (la sesión)',
)

// 5. Queda marcada la SEGUNDA fuente (auto-cargado), sin tocar el modelo de dos
//    fuentes — el origen anotado, como 'Chatbot' / 'Inbound'.
assert.equal(limpio.source, FUENTE_SETTER)

// 6. El alta NO inventa un estado avanzado: el status inicial sale de los defaults
//    de Prisma (PROSPECTO), no se setea acá. Un lead así entra a la cola `trabajar`.
assert.equal(
  limpio.status,
  undefined,
  'el alta no fuerza status — el default PROSPECTO de Prisma lo deja en FICHA/foco',
)

console.log(
  '✓ invariante OK: el alta propia del setter deriva el dueño de la sesión ' +
    '(anti-IDOR de escritura), entra fría, y queda aislada en su cartera.',
)
