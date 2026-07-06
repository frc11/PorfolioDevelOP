/**
 * INFRA.1 — Gate del sprint de observabilidad.
 *
 * Prueba que el sink off-Neon (`logPersistFailure`) SOBREVIVE a la muerte de la
 * conexión y captura el diagnóstico: `.code` de Prisma (P1017 terminated /
 * P2024 pool / …) y `.cause` de undici ('terminated' / 'fetch failed').
 *
 * Como el sink es stderr puro (no importa ni toca `@/lib/prisma`), testearlo
 * aislado ES probar que el rastro no muere con Neon: no hay conexión que pueda
 * afectarlo. Cero DB, cero network, cero side effects más allá del console.error
 * que interceptamos. Corre con:  npm run test:infra1   (npx tsx …)
 */
import assert from 'node:assert/strict'
import { Prisma } from '@prisma/client'
import { extractDbErrorInfo, logPersistFailure } from '../logger'

/** Intercepta console.error y devuelve las líneas emitidas por `fn`. */
function captureStderr(fn: () => void): string[] {
  const lines: string[] = []
  const original = console.error
  console.error = (...args: unknown[]): void => {
    lines.push(args.map((a) => String(a)).join(' '))
  }
  try {
    fn()
  } finally {
    console.error = original
  }
  return lines
}

let passed = 0
function check(label: string, fn: () => void): void {
  fn()
  passed += 1
  console.log(`  ✓ ${label}`)
}

console.log('INFRA.1 — persist-failure-sink.invariant')

// ── Caso 1: undici envuelve el socket error real en `error.cause` (path stream) ──
check('undici fetch-failed → captura causeMessage + causeCode, sin prismaCode', () => {
  const err = new Error('fetch failed', {
    cause: Object.assign(new Error('terminated'), { code: 'UND_ERR_SOCKET' }),
  })
  const info = extractDbErrorInfo(err)
  assert.equal(info.errorMessage, 'fetch failed')
  assert.equal(info.causeMessage, 'terminated')
  assert.equal(info.causeCode, 'UND_ERR_SOCKET')
  assert.equal(info.prismaCode, undefined)
})

// ── Caso 2: PrismaClientKnownRequestError P1017 (connection terminated) ──
check('P1017 → una línea estructurada con prismaCode + campos de turno', () => {
  const err = new Prisma.PrismaClientKnownRequestError(
    'Server has closed the connection.',
    { code: 'P1017', clientVersion: 'test' }
  )
  const lines = captureStderr(() =>
    logPersistFailure('chat.persist_failed', err, {
      conversationId: 'conv_1',
      botSlug: 'demo',
      botConfigId: 'bot_1',
      turnIndex: 3,
    })
  )
  assert.equal(lines.length, 1, 'debe emitir exactamente una línea')
  const rec = JSON.parse(lines[0]) as Record<string, unknown>
  assert.equal(rec.type, 'chat.persist_failed')
  assert.equal(rec.level, 'error')
  assert.equal(rec.prismaCode, 'P1017')
  assert.equal(rec.conversationId, 'conv_1')
  assert.equal(rec.botSlug, 'demo')
  assert.equal(rec.botConfigId, 'bot_1')
  assert.equal(rec.turnIndex, 3)
  assert.equal(typeof rec.timestamp, 'string')
})

// ── Caso 3: P2024 (pool timeout) — otra rama del discriminador de causa raíz ──
check('P2024 → prismaCode P2024', () => {
  const err = new Prisma.PrismaClientKnownRequestError(
    'Timed out fetching a new connection from the connection pool.',
    { code: 'P2024', clientVersion: 'test' }
  )
  const lines = captureStderr(() => logPersistFailure('chat.persist_failed', err, {}))
  const rec = JSON.parse(lines[0]) as Record<string, unknown>
  assert.equal(rec.prismaCode, 'P2024')
})

// ── Caso 4: un no-Error (string) no rompe el sink ──
check('no-Error → errorMessage = String(x), errorName NonError', () => {
  const lines = captureStderr(() => logPersistFailure('chat.persist_failed', 'boom', {}))
  const rec = JSON.parse(lines[0]) as Record<string, unknown>
  assert.equal(rec.errorMessage, 'boom')
  assert.equal(rec.errorName, 'NonError')
})

// ── Caso 5: el sink NUNCA lanza (piso garantizado) ──
check('el sink nunca lanza', () => {
  assert.doesNotThrow(() => {
    captureStderr(() => logPersistFailure('chat.stream_error', new Error('x'), {}))
  })
})

console.log(`\n✅ INFRA.1 sink OK — ${passed} checks`)
