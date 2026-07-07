/**
 * INFRA.2 — Invariante del dedup del user message (idempotencia ante el retry del
 * widget en el cold-start de Neon). Corre SIN DB ni server:
 *
 *   npm run test:infra2
 *   (o: npx tsx src/modules/chatbot/server/chat/__tests__/user-persist-dedup.invariant.ts)
 *
 * Verifica que un reintento (misma conversación, mismo contenido USER como cola SIN
 * responder) NO duplique la fila, sin romper el flujo legítimo:
 *   1. Conversación vacía → crea (primer mensaje).
 *   2. Cola ASSISTANT (turno ya respondido) → crea aunque el contenido coincida
 *      (re-pregunta legítima: "ok"/"dale" dos veces no se pierde).
 *   3. Cola USER idéntica dentro de la ventana → saltea (retry duplicado).
 *   4. Cola USER idéntica en/después de la ventana → crea (no adopta un huérfano viejo).
 *   5. Cola USER con contenido distinto → crea (mensaje nuevo).
 *   6. 3 intentos seguidos (cola huérfana) → exactamente 1 create.
 *
 * Función pura sobre (cola, contenido, now, ventana): no lee reloj ni DB.
 */
import assert from 'node:assert/strict'
import {
  shouldSkipUserPersist,
  USER_PERSIST_DEDUP_WINDOW_MS,
  type TailMessage,
} from '../dedup.ts'

const now = new Date('2026-07-06T12:00:00Z')
const ago = (ms: number) => new Date(now.getTime() - ms)

// ── 1. Conversación vacía: sin cola → crea ───────────────────────────────────
assert.equal(shouldSkipUserPersist(null, 'hola', now), false, 'sin cola → crea (primer mensaje)')

// ── 2. Cola ASSISTANT (turno respondido) → crea, aunque el contenido coincida ─
{
  const answeredTail: TailMessage = { role: 'ASSISTANT', content: 'gracias, ¿algo más?', createdAt: ago(1000) }
  assert.equal(
    shouldSkipUserPersist(answeredTail, 'ok', now),
    false,
    'cola ASSISTANT → crea (re-pregunta legítima)',
  )
  // El rol de la cola manda sobre el contenido: un ASSISTANT que "eco-eó" el texto
  // igual deja pasar el nuevo USER (no es un retry, ya hubo respuesta).
  const echoTail: TailMessage = { role: 'ASSISTANT', content: 'ok', createdAt: ago(1000) }
  assert.equal(
    shouldSkipUserPersist(echoTail, 'ok', now),
    false,
    'rol de la cola manda: ASSISTANT con mismo contenido → crea',
  )
}

// ── 3. Cola USER idéntica dentro de la ventana → saltea (retry duplicado) ─────
{
  const orphanTail: TailMessage = { role: 'USER', content: 'necesito ayuda', createdAt: ago(3000) }
  assert.equal(
    shouldSkipUserPersist(orphanTail, 'necesito ayuda', now),
    true,
    'cola USER idéntica dentro de ventana → saltea',
  )
  const justUnder: TailMessage = {
    role: 'USER',
    content: 'necesito ayuda',
    createdAt: ago(USER_PERSIST_DEDUP_WINDOW_MS - 1),
  }
  assert.equal(
    shouldSkipUserPersist(justUnder, 'necesito ayuda', now),
    true,
    'justo por debajo de la ventana → saltea',
  )
}

// ── 4. Cola USER idéntica en/después de la ventana → crea ─────────────────────
{
  const atWindow: TailMessage = {
    role: 'USER',
    content: 'necesito ayuda',
    createdAt: ago(USER_PERSIST_DEDUP_WINDOW_MS),
  }
  assert.equal(
    shouldSkipUserPersist(atWindow, 'necesito ayuda', now),
    false,
    'exactamente en la ventana → crea (>= no es retry)',
  )
  const past: TailMessage = {
    role: 'USER',
    content: 'necesito ayuda',
    createdAt: ago(USER_PERSIST_DEDUP_WINDOW_MS + 60_000),
  }
  assert.equal(
    shouldSkipUserPersist(past, 'necesito ayuda', now),
    false,
    'pasada la ventana → crea (no adopta huérfano viejo)',
  )
}

// ── 5. Cola USER con contenido distinto → crea (mensaje nuevo) ────────────────
{
  const otherTail: TailMessage = { role: 'USER', content: 'hola', createdAt: ago(2000) }
  assert.equal(shouldSkipUserPersist(otherTail, 'chau', now), false, 'cola USER contenido distinto → crea')
}

// ── 6. 3 intentos seguidos (cola huérfana) → exactamente 1 create ─────────────
{
  // Simula la DB: la cola es la última fila. El 1er intento crea; los reintentos ven la
  // cola USER huérfana con el mismo contenido y saltean.
  const rows: TailMessage[] = []
  let created = 0
  for (let i = 0; i < 3; i += 1) {
    const attemptAt = new Date(now.getTime() + i * 2500) // 3 intentos con backoff ~2s
    const tail = rows.length > 0 ? rows[rows.length - 1] : null
    if (!shouldSkipUserPersist(tail, 'probando', attemptAt)) {
      rows.push({ role: 'USER', content: 'probando', createdAt: attemptAt })
      created += 1
    }
  }
  assert.equal(created, 1, '3 intentos del retry → 1 sola fila USER (idempotente)')
}

// ── 7. Ventana 0 desactiva el dedup (borde) ──────────────────────────────────
{
  const tail: TailMessage = { role: 'USER', content: 'x', createdAt: now }
  assert.equal(shouldSkipUserPersist(tail, 'x', now, 0), false, 'ventana 0 → nunca saltea (dedup off)')
}

console.log(
  '✓ user-persist-dedup invariants OK: conversación vacía crea, cola respondida no ' +
    'pierde re-preguntas, cola USER huérfana idéntica en ventana no duplica, y el retry ' +
    'de 3 intentos deja 1 sola fila.',
)
