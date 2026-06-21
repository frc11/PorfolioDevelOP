/**
 * Chequeo de invariante del TIMELINE del lead (setter) — corre sin DB.
 *
 *   npm run check:invariant:timeline
 *
 * Constata, ejecutable (no "es obvio"), las dos garantías que la consigna pide:
 *
 *   (a) AISLAMIENTO — el timeline de un lead solo lo ve su setter. La lectura se
 *       arma con `timelineActivityWhere(leadId)` (lead-scoped) DESPUÉS del gate de
 *       ownership `ownedLeadWhere(leadId, userId)` (= getOwnedLead, anti-IDOR). Dos
 *       puntos no-obvios:
 *         · El gate restringe al dueño: tras reasignar A→B el filtro de A ya no
 *           alcanza el lead → A deja de ver su timeline.
 *         · El where del timeline keyea por `leadId`, NUNCA por `performedById`.
 *           Es DELIBERADO: los eventos `SISTEMA` (reasignación) los hace el ADMIN,
 *           así que un timeline keyed por performer DEJARÍA AFUERA la reasignación
 *           —justo lo que el timeline debe mostrar—. Pin de la decisión de lectura.
 *
 *   (b) SISTEMA SE MUESTRA PERO NO CUENTA — agregar el evento de sistema al
 *       historial no lo convierte en contacto comercial. El filtro que alimenta el
 *       conteo (`SOLO_CONTACTOS_COMERCIALES`) sigue excluyendo SISTEMA y no cambió;
 *       el where del timeline NO lo lleva (incluye SISTEMA a propósito); y el
 *       conteo que abre el paso de Seguimiento da lo mismo con o sin la fila
 *       SISTEMA: la reasignación aporta 0.
 *
 * Importa solo el módulo puro `isolation.ts` y los enums de Prisma (valores en
 * runtime, sin DB) — cero Neon, cero efectos.
 */
import assert from 'node:assert/strict'
import { ActivityChannel } from '@prisma/client'
import {
  esContactoComercial,
  ownedLeadWhere,
  SOLO_CONTACTOS_COMERCIALES,
  timelineActivityWhere,
} from './isolation.ts'

const LEAD = 'lead-1'
const SETTER_A = 'setter-a'
const SETTER_B = 'setter-b'

// ── (a) Aislamiento: gate por dueño + where lead-scoped (NO performer) ──
assert.deepEqual(ownedLeadWhere(LEAD, SETTER_A), { id: LEAD, assignedToId: SETTER_A })
assert.notEqual(
  ownedLeadWhere(LEAD, SETTER_A).assignedToId,
  ownedLeadWhere(LEAD, SETTER_B).assignedToId,
  'el timeline pasa por el gate de ownership: el lead de A no lo abre B',
)

const whereTimeline = timelineActivityWhere(LEAD)
assert.deepEqual(whereTimeline, { leadId: LEAD })
// Lead-scoped, no performer-scoped: si filtrara por `performedById` (el setter),
// los eventos SISTEMA (los hace el admin) quedarían fuera — el caso que el
// timeline DEBE mostrar. Por eso NO va por T6 ([performedById, createdAt]) sino
// por el índice hermano [leadId, createdAt].
assert.ok(
  !('performedById' in whereTimeline),
  'el timeline es lead-scoped: keyear por performer perdería la reasignación SISTEMA',
)

// ── (b) SISTEMA se muestra pero NO cuenta ──
// El filtro comercial (lo que cuenta) sigue excluyendo SISTEMA y no cambió.
assert.equal(esContactoComercial(ActivityChannel.SISTEMA), false)
assert.deepEqual(SOLO_CONTACTOS_COMERCIALES, { channel: { not: ActivityChannel.SISTEMA } })
// El where del timeline NO lleva filtro de canal → incluye SISTEMA a propósito.
assert.ok(
  !('channel' in whereTimeline),
  'el timeline no filtra canal: muestra el evento de sistema (memoria del lead)',
)

// Prueba ejecutable del gate: el conteo que abre Seguimiento (`contactos`, solo
// comercial) da IGUAL con o sin la fila SISTEMA. Mostrar la reasignación en el
// historial no abre el paso antes del primer contacto real.
type Fila = { channel: ActivityChannel }
const comercialA: Fila = { channel: ActivityChannel.WHATSAPP }
const comercialB: Fila = { channel: ActivityChannel.INSTAGRAM_DM }
const sistema: Fila = { channel: ActivityChannel.SISTEMA }

const contarComercial = (filas: Fila[]): number =>
  filas.filter((fila) => esContactoComercial(fila.channel)).length

const conSistema: Fila[] = [comercialA, comercialB, sistema]
const sinSistema: Fila[] = [comercialA, comercialB]

// El timeline MUESTRA las 3 filas (incluida SISTEMA)…
assert.equal(conSistema.length, 3)
// …pero el conteo comercial ve 2 con o sin la fila SISTEMA: la reasignación aporta 0.
assert.equal(contarComercial(conSistema), 2)
assert.equal(contarComercial(sinSistema), 2)
assert.equal(contarComercial(conSistema), contarComercial(sinSistema))
// Y un lead con SOLO eventos de sistema NO abre Seguimiento (conteo comercial 0).
assert.equal(contarComercial([sistema, sistema]), 0)

console.log(
  '✓ invariante OK: timeline lead-scoped (gate ownership + where por leadId, no ' +
    'por performer → la reasignación SISTEMA aparece) y SISTEMA se MUESTRA pero NO ' +
    'cuenta (el conteo que abre Seguimiento lo ignora; agregar el historial no mueve ' +
    'el gate).',
)
