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
 *
 * ── P27: y ADEMÁS que la consulta real los use ───────────────────────────────
 * Las aserciones 1-3 miran los helpers en aislado, y eso solo prueba que el
 * helper existe. El censo de P26 lo midió: `assert.deepEqual(ownSetterMetaWhere(A),
 * { setterId: A })` queda VERDE si la lectura del meta se escribe a mano por
 * `leadId` — con la nota de otro setter adentro. La promesa del encabezado
 * («toda lectura del meta se filtra por setterId») es sobre las LECTURAS.
 * La sección 4 ata la promesa a las lecturas: lee la fuente de la consulta,
 * acotada a su función, y exige que el filtro salga del helper.
 */
import assert from 'node:assert/strict'
import { ownedListWhere, ownSetterMetaWhere } from './isolation.ts'
import { cuerpoDeFuncion } from '../invariant-call-site.ts'

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

// ── 4. LA CONSULTA REAL USA EL FILTRO (P27) ─────────────────────────────────
// `listOwnedLeads` (ownership.ts) es LA única puerta de listas del setter, y es
// la que adjunta el meta. Se lee su cuerpo —acotado a la función, no el archivo:
// `ownership.ts` menciona los dos helpers en su encabezado, así que buscar en el
// archivo entero daría verde sobre una función vaciada.
const listOwnedLeads = cuerpoDeFuncion(['src', 'lib', 'leados', 'ownership.ts'], 'listOwnedLeads')

assert.match(
  listOwnedLeads,
  /setterMetas:\s*\{\s*where:\s*ownSetterMetaWhere\(/,
  'la lectura del meta en `listOwnedLeads` dejó de filtrar por `ownSetterMetaWhere`.\n' +
    '  Eso es la fuga que este invariante existe para impedir: sin ese `where`, el `include`\n' +
    '  trae TODAS las filas de meta del lead — la nota, el pin y el snooze de cualquier setter\n' +
    '  que lo haya tenido antes de una reasignación. Las aserciones 1-3 de arriba seguirían\n' +
    '  verdes: prueban que el helper devuelve el filtro, no que la consulta lo llame.\n' +
    '  Si cambiaste la forma de adjuntar el meta, atá el filtro nuevo acá en el mismo commit.',
)

assert.match(
  listOwnedLeads,
  /where:\s*ownedListWhere\(/,
  'la cartera de `listOwnedLeads` dejó de armarse con `ownedListWhere`.\n' +
    '  `isolation.ts` declara la regla: «Todo `where` de lectura del setter se arma con estos\n' +
    '  helpers — si un día cambia el aislamiento, cambia acá y en un solo lugar». Un filtro\n' +
    '  equivalente escrito a mano hoy es inocuo y mañana es la copia que no se enteró del\n' +
    '  cambio; y un `where` sin dueño devuelve la cartera entera del equipo.',
)

// El WRITE del meta es el espejo: la fila se direcciona por (leadId, setterId),
// nunca por leadId solo. Con la llave a medias, un setter pisaría la nota de otro.
const upsertSetterMeta = cuerpoDeFuncion(
  ['src', 'lib', 'leados', 'setter-meta.ts'],
  'upsertSetterMeta',
)
assert.match(
  upsertSetterMeta,
  /where:\s*\{\s*leadId_setterId:\s*\{\s*leadId,\s*setterId\s*\}\s*\}/,
  'el upsert del meta dejó de direccionar por la unique (leadId, setterId).\n' +
    '  Keyear solo por `leadId` haría que dos setters compartan la MISMA fila: el pin, el\n' +
    '  snooze y la nota privada de uno se pisan con los del otro. Es la aserción 3 (que el\n' +
    '  filtro no sea por leadId solo) llevada a la escritura, que es donde el daño se persiste.',
)
assert.match(
  upsertSetterMeta,
  /create:\s*\{\s*leadId,\s*setterId,/,
  'el `create` del upsert del meta dejó de estampar `setterId`: una fila nueva sin dueño ' +
    'queda fuera del filtro de todos y visible para el que la busque por leadId.',
)

console.log(
  '✓ invariante OK: la nota/pin/snooze del setter es privada (filtrada por setterId) ' +
    'y la cartera sigue aislada por assignedToId — y las consultas REALES lo hacen: ' +
    '`listOwnedLeads` arma su where con `ownedListWhere` y adjunta el meta con ' +
    '`ownSetterMetaWhere`, y `upsertSetterMeta` direcciona por la unique (leadId, setterId).',
)
