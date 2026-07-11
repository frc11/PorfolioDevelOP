/**
 * C0.2 — Invariantes de la ventana de historial (recorte + forma).
 *
 *   npx tsx src/modules/chatbot/server/chat/__tests__/history-window.invariant.ts
 *   npm run test:c02
 *
 * Cero DB, cero network. Verifica:
 *   1. Camino corto intacto: un array que entra en la ventana vuelve tal cual
 *      (misma referencia, cero cambio).
 *   2. Recorte real: conversación larga → ≤ HISTORY_WINDOW_MESSAGES, el último
 *      'user' (el turno en curso) SIEMPRE preservado, ventana user-led.
 *   3. Caso patológico: cola de ≥ ventana mensajes no-user después del último
 *      'user' → la ventana se ancla en el turno en curso (invariante dura).
 *   4. Array sin ningún 'user': recorte plano sin lanzar (el handler decide,
 *      hoy 400 "No user message found", igual que siempre).
 *   5. requestBodySchema TRUNCA en vez de rechazar: un body más largo que la
 *      ventana (pero dentro de la forma) parsea OK y sale recortado.
 *   6. La validación de FORMA sigue viva: > MAX_MESSAGES_SHAPE items rechaza;
 *      content > MAX_MESSAGE_CHARS rechaza (== pasa).
 *   7. Paridad del camino corto a través del schema: body chico parsea con
 *      mensajes idénticos (deep-equal).
 */

import assert from 'node:assert/strict'
import {
  trimHistory,
  HISTORY_WINDOW_MESSAGES,
  MAX_MESSAGES_SHAPE,
  MAX_MESSAGE_CHARS,
  HARD_CAP_MESSAGES,
} from '../../../shared/historyPolicy'
import { requestBodySchema } from '../handleChatRequest'

type Role = 'user' | 'assistant' | 'system'
interface Msg {
  role: Role
  content: string
}

/** Conversación alternada user/assistant que arranca y (si n es impar) termina en 'user'. */
const conv = (n: number): Msg[] =>
  Array.from({ length: n }, (_, i): Msg => ({
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `msg-${i}`,
  }))

// ─── 0. Coherencia de diseño entre constantes ──────────────────────────────

assert.ok(
  HISTORY_WINDOW_MESSAGES < MAX_MESSAGES_SHAPE,
  'la ventana de recorte debe ser menor al tope de forma (recortar antes de rechazar)',
)
assert.ok(
  Number.isInteger(HARD_CAP_MESSAGES / 2),
  'HARD_CAP_MESSAGES debe ser par: el prompt lo comunica como turnos (mensajes/2)',
)

// ─── 1. Camino corto intacto (misma referencia) ────────────────────────────

const shortConv = conv(HISTORY_WINDOW_MESSAGES)
assert.equal(
  trimHistory(shortConv, HISTORY_WINDOW_MESSAGES),
  shortConv,
  'array que entra justo en la ventana vuelve tal cual (misma referencia)',
)
const tinyConv = conv(3)
assert.equal(trimHistory(tinyConv, HISTORY_WINDOW_MESSAGES), tinyConv, 'array chico vuelve tal cual')
assert.equal(trimHistory(tinyConv, 0), tinyConv, 'ventana absurda (<1) no recorta (defensivo)')

// ─── 2. Recorte real: último user preservado + user-led ────────────────────

const long = conv(45) // termina en msg-44 (user) = turno en curso
const trimmed = trimHistory(long, HISTORY_WINDOW_MESSAGES)
assert.ok(
  trimmed.length <= HISTORY_WINDOW_MESSAGES,
  `recorta a ≤ ${HISTORY_WINDOW_MESSAGES} (quedaron ${trimmed.length})`,
)
assert.equal(trimmed[trimmed.length - 1].content, 'msg-44', 'el último user (turno en curso) queda SIEMPRE')
assert.equal(trimmed[0].role, 'user', 'la ventana queda user-led (Gemini/Vertex lo requiere)')
// slice(-30) de 45 arranca en msg-15 (assistant) → se descarta el huérfano → arranca en msg-16
assert.deepEqual(trimmed, long.slice(16), 'la ventana es un sufijo contiguo del historial (cronología intacta)')

// ─── 3. Patológico: cola no-user más larga que la ventana ──────────────────

const buried: Msg[] = [
  { role: 'user', content: 'turno-en-curso' },
  ...Array.from({ length: 35 }, (_, i): Msg => ({ role: 'assistant', content: `cola-${i}` })),
]
const anchored = trimHistory(buried, HISTORY_WINDOW_MESSAGES)
assert.equal(
  anchored[0].content,
  'turno-en-curso',
  'si slice(-N) se comiera el turno en curso, la ventana se ancla en él',
)
assert.equal(anchored.length, HISTORY_WINDOW_MESSAGES, 'la ventana anclada respeta el tamaño')

// ─── 4. Sin ningún user: recorte plano, sin lanzar ─────────────────────────

const noUser: Msg[] = Array.from({ length: 40 }, (_, i): Msg => ({
  role: 'assistant',
  content: `a-${i}`,
}))
const noUserTrimmed = trimHistory(noUser, HISTORY_WINDOW_MESSAGES)
assert.equal(noUserTrimmed.length, HISTORY_WINDOW_MESSAGES, 'sin user no hay turno que proteger: slice plano')
assert.equal(noUserTrimmed[0].content, 'a-10', 'slice plano de los últimos N')

// ─── 5. El schema TRUNCA en vez de rechazar (el viejo 400 al mensaje 51) ───

const baseBody = { sessionId: 'session-c02-test' }
const longBody = requestBodySchema.parse({ ...baseBody, messages: conv(45) })
assert.ok(
  longBody.messages.length <= HISTORY_WINDOW_MESSAGES,
  'un body más largo que la ventana parsea OK (no lanza) y sale recortado',
)
const lastParsed = longBody.messages[longBody.messages.length - 1]
assert.equal(lastParsed.role, 'user', 'el último mensaje del body recortado es el user del turno en curso')
assert.equal(lastParsed.content, 'msg-44', 'y es exactamente el último user del body original')
assert.equal(longBody.messages[0].role, 'user', 'el body recortado queda user-led')

// ─── 6. La validación de forma sigue viva ──────────────────────────────────

assert.throws(
  () => requestBodySchema.parse({ ...baseBody, messages: conv(MAX_MESSAGES_SHAPE + 1) }),
  `> ${MAX_MESSAGES_SHAPE} items es payload absurdo (ningún widget real lo produce) → rechaza`,
)
const maxContent = requestBodySchema.parse({
  ...baseBody,
  messages: [{ role: 'user' as const, content: 'a'.repeat(MAX_MESSAGE_CHARS) }],
})
assert.equal(
  maxContent.messages[0].content.length,
  MAX_MESSAGE_CHARS,
  `content de exactamente ${MAX_MESSAGE_CHARS} chars pasa`,
)
assert.throws(
  () =>
    requestBodySchema.parse({
      ...baseBody,
      messages: [{ role: 'user' as const, content: 'a'.repeat(MAX_MESSAGE_CHARS + 1) }],
    }),
  `content > ${MAX_MESSAGE_CHARS} chars rechaza (forma)`,
)

// ─── 7. Paridad del camino corto a través del schema ───────────────────────

const shortMessages = conv(5)
const shortParsed = requestBodySchema.parse({ ...baseBody, messages: shortMessages })
assert.deepEqual(
  shortParsed.messages,
  shortMessages,
  'una conversación corta atraviesa el schema EXACTAMENTE igual que hoy (paridad)',
)

console.log(
  '[C0.2 invariant] ✓ Recorte conserva el último user, ventana user-led, ' +
    'schema trunca en vez de 400 y la validación de forma sigue viva.',
)
