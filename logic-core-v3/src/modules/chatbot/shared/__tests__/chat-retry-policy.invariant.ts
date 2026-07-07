/**
 * INFRA.2 — Invariante de la política de reintento del widget (chatRetryPolicy). Corre
 * SIN DB ni red:
 *
 *   npm run test:infra2
 *   (o: npx tsx src/modules/chatbot/shared/__tests__/chat-retry-policy.invariant.ts)
 *
 * Verifica que el retry del cold-start:
 *   1. Clasifica bien el status (2xx éxito, 5xx transitorio, 4xx cliente).
 *   2. Reintenta SOLO transitorios (red / 5xx), NUNCA 4xx (incl. 429).
 *   3. Está acotado (máx CHAT_RETRY_MAX_ATTEMPTS intentos).
 *   4. Backoff 2s / 4s con clamp; parseo de Retry-After en segundos.
 *   5. Un éxito no reintenta.
 *
 * Funciones puras: sin fetch, sin reloj, sin efectos.
 */
import assert from 'node:assert/strict'
import {
  classifyStatus,
  isTransientOutcome,
  shouldRetry,
  backoffForAttempt,
  parseRetryAfterMs,
  CHAT_RETRY_MAX_ATTEMPTS,
  CHAT_RETRY_BACKOFFS_MS,
  type FetchOutcome,
} from '../chatRetryPolicy.ts'

// ── 1. classifyStatus ────────────────────────────────────────────────────────
assert.deepEqual(classifyStatus(200, null), { kind: 'success', status: 200 }, '200 → success')
assert.deepEqual(classifyStatus(204, null), { kind: 'success', status: 204 }, '2xx → success')
assert.deepEqual(classifyStatus(503, null), { kind: 'server-error', status: 503 }, '503 → server-error')
assert.deepEqual(classifyStatus(500, null), { kind: 'server-error', status: 500 }, '500 → server-error')
assert.deepEqual(
  classifyStatus(429, '5'),
  { kind: 'client-error', status: 429, retryAfterMs: 5000 },
  '429 → client-error con Retry-After parseado',
)
assert.deepEqual(
  classifyStatus(400, null),
  { kind: 'client-error', status: 400, retryAfterMs: null },
  '400 → client-error sin Retry-After',
)

// ── 2. isTransientOutcome ────────────────────────────────────────────────────
assert.equal(isTransientOutcome({ kind: 'network-error' }), true, 'red → transitorio')
assert.equal(isTransientOutcome({ kind: 'server-error', status: 502 }), true, '5xx → transitorio')
assert.equal(
  isTransientOutcome({ kind: 'client-error', status: 429, retryAfterMs: null }),
  false,
  '4xx → NO transitorio',
)
assert.equal(isTransientOutcome({ kind: 'success', status: 200 }), false, 'éxito → NO transitorio')

// ── 3. shouldRetry: solo transitorios, y acotado ─────────────────────────────
const netErr: FetchOutcome = { kind: 'network-error' }
const srvErr: FetchOutcome = { kind: 'server-error', status: 503 }
const cliErr: FetchOutcome = { kind: 'client-error', status: 429, retryAfterMs: 3000 }
const ok: FetchOutcome = { kind: 'success', status: 200 }

assert.equal(shouldRetry(netErr, 1), true, 'red, intento 1 → reintenta')
assert.equal(shouldRetry(srvErr, 2), true, '5xx, intento 2 → reintenta')
assert.equal(shouldRetry(srvErr, 3), false, '5xx, intento 3 (presupuesto agotado) → NO reintenta')
assert.equal(shouldRetry(cliErr, 1), false, '429 → NUNCA reintenta')
assert.equal(
  shouldRetry({ kind: 'client-error', status: 400, retryAfterMs: null }, 1),
  false,
  '400 → NUNCA reintenta',
)
assert.equal(shouldRetry(ok, 1), false, 'éxito → no reintenta')

// ── 4. Acotado: un 5xx permanente hace exactamente MAX intentos y para ────────
{
  let attemptsMade = 0
  let attempts = 0
  for (;;) {
    attemptsMade += 1
    attempts += 1
    if (!shouldRetry(srvErr, attemptsMade)) break
    assert.ok(attempts <= CHAT_RETRY_MAX_ATTEMPTS, 'nunca excede el máximo')
  }
  assert.equal(
    attempts,
    CHAT_RETRY_MAX_ATTEMPTS,
    `5xx permanente → exactamente ${CHAT_RETRY_MAX_ATTEMPTS} intentos`,
  )
}

// ── 5. Backoff 2s / 4s con clamp ─────────────────────────────────────────────
assert.equal(backoffForAttempt(1), 2000, 'backoff tras intento 1 → 2000ms')
assert.equal(backoffForAttempt(2), 4000, 'backoff tras intento 2 → 4000ms')
assert.equal(backoffForAttempt(3), 4000, 'backoff tras intento 3 → clamp al último (4000ms)')
assert.deepEqual([...CHAT_RETRY_BACKOFFS_MS], [2000, 4000], 'schedule = [2000, 4000]')

// ── 6. parseRetryAfterMs (segundos → ms) ─────────────────────────────────────
assert.equal(parseRetryAfterMs('5'), 5000, '"5" → 5000ms')
assert.equal(parseRetryAfterMs('0'), 0, '"0" → 0ms')
assert.equal(parseRetryAfterMs(null), null, 'null → null')
assert.equal(parseRetryAfterMs('abc'), null, 'no numérico (HTTP-date) → null')
assert.equal(parseRetryAfterMs('-1'), null, 'negativo → null')

// ── 7. Máximo esperado ───────────────────────────────────────────────────────
assert.equal(CHAT_RETRY_MAX_ATTEMPTS, 3, '3 intentos (1 + 2 reintentos)')

console.log(
  '✓ chat-retry-policy invariants OK: reintenta solo red/5xx, nunca 4xx/429, acotado a ' +
    `${CHAT_RETRY_MAX_ATTEMPTS} intentos, backoff 2s/4s con clamp.`,
)
