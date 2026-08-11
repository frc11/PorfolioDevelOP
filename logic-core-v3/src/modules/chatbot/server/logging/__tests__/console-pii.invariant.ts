/**
 * PRIVACIDAD — Invariante: ninguna clave de PII de visitantes sale por consola.
 *
 * `logChatbotEvent` emite a DOS sinks: la columna org-scoped
 * `chatbot_events.metadata` (intacta — el panel del cliente la consume) y la
 * consola (stdout/stderr → Netlify Logs, visibles para la plataforma). Este
 * test pinnea el contrato del camino CONSOLA:
 *
 *   1. Las claves sensibles (visitorName, visitorContact, topicSummary,
 *      purchaseSignals, reason) NUNCA llegan a consola — ni sus valores ni
 *      los de una clave NUEVA no contemplada (allowlist: lo no listado se
 *      pierde por omisión, que es el modo de falla seguro).
 *   2. Lo excluido queda nombrado en `redactedKeys` (los nombres, jamás los
 *      valores): la señal de que el dato existió sobrevive.
 *   3. `message` va SOLO a la DB — jamás a consola.
 *   4. Las claves seguras pasan intactas, y un evento 100% seguro no gana
 *      un `redactedKeys` vacío.
 *   5. La telemetría permanente (chat.onfinish_phases, watchdog_settled,
 *      provider.stream_chunks, chat.watchdog_fired) sale vía `chatbotLog`
 *      directo y conserva TODOS sus campos — el filtro vive en
 *      `logChatbotEvent`, no en `chatbotLog`.
 *
 * El ALLOWLIST está DUPLICADO acá a propósito: agregar una clave en
 * producción sin decidirlo también acá pone este test en rojo. Es fricción
 * intencional para una superficie de seguridad.
 *
 * Cero DB: sin DATABASE_URL el create de Prisma falla y cae en el fallback
 * `logger.persist_failed`, que también queda bajo assert (no arrastra
 * metadata). Corre con:  npm run test:pii   (npx tsx …)
 */
import assert from 'node:assert/strict'
import { Prisma } from '@prisma/client'
import { logChatbotEvent } from '../persistentLogger'
import { chatbotLog, chatbotError, logPersistFailure, sanitizeErrorMessage } from '../logger'
import { __INTERNALS_FOR_TESTING__ } from '@/lib/sentry/scrub-pii'

// ── Copia pin del allowlist de consola (ver persistentLogger.ts) ────────────
const ALLOWLIST_PIN: ReadonlySet<string> = new Set([
  'orgSlug',
  'intent',
  'hadLeadBeforeHandoff',
  'preferredChannel',
  'phoneReason',
  'emailReason',
  'category',
  'channels',
  'leadId',
  'signals',
  'score',
  'classification',
  'dqReason',
  'scoreBreakdown',
  'warnings',
  'finishReason',
  'toolCallCount',
  'tokensIn',
  'tokensOut',
  'costUsd',
  'durationMs',
  'latencyMs',
  'timings',
  'planKey',
  'maxDomains',
  'conversationsUsed',
  'conversationsLimit',
  'period',
  'reservedRace',
  'trigger',
  'compensated',
  'conversationId',
  'year',
  'month',
  'messageCount',
  'hardCap',
  'requestedProvider',
  'requestedModel',
  'effectiveProvider',
  'effectiveModel',
  'newStatus',
  'userId',
  'insightId',
])

/** Claves del sobre que `logChatbotEvent`/`chatbotLog` agregan por fuera de metadata. */
const ENVELOPE_KEYS: ReadonlySet<string> = new Set([
  'type',
  'level',
  'timestamp',
  'botConfigId',
  'conversationId',
  'redactedKeys',
])

/** Intercepta TODOS los métodos de console y devuelve las líneas emitidas. */
async function captureConsole(fn: () => Promise<void> | void): Promise<string[]> {
  const lines: string[] = []
  const original = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  }
  const push = (...args: unknown[]): void => {
    lines.push(args.map((a) => String(a)).join(' '))
  }
  console.log = push
  console.warn = push
  console.error = push
  console.debug = push
  try {
    await fn()
  } finally {
    console.log = original.log
    console.warn = original.warn
    console.error = original.error
    console.debug = original.debug
  }
  return lines
}

function parseLine(line: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(line)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

let passed = 0
let failed = 0
async function check(label: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn()
    passed += 1
    console.log(`  OK ${label}`)
  } catch (e) {
    failed += 1
    console.log(`  FALLA ${label}`)
    console.log(`     ${e instanceof Error ? e.message : String(e)}`)
  }
}

// Marcadores únicos: si CUALQUIERA aparece en CUALQUIER línea de consola, hay fuga.
const M = {
  nombre: 'PII_MARKER_NOMBRE_a1x',
  contacto: 'PII_MARKER_CONTACTO_b2y',
  resumen: 'PII_MARKER_RESUMEN_c3z',
  senales: 'PII_MARKER_SENALES_d4w',
  reason: 'PII_MARKER_REASON_e5v',
  nuevo: 'PII_MARKER_CAMPO_NUEVO_f6u',
  message: 'PII_MARKER_MESSAGE_g7t',
} as const
const MARKERS: readonly string[] = Object.values(M)

function assertNoMarker(lines: string[]): void {
  for (const line of lines) {
    for (const marker of MARKERS) {
      assert.ok(
        !line.includes(marker),
        `marcador ${marker} FUGADO a consola en: ${line.slice(0, 160)}`,
      )
    }
  }
}

async function main(): Promise<void> {
  console.log('PRIVACIDAD — console-pii.invariant')

  // ── 1. El caso real: handoff.whatsapp con PII + una clave nueva no listada ──
  await check('handoff.whatsapp: ni PII ni claves nuevas salen a consola', async () => {
    const lines = await captureConsole(() =>
      logChatbotEvent({
        organizationId: 'org_test',
        botConfigId: 'bot_test',
        type: 'handoff.whatsapp',
        level: 'info',
        message: `Handoff de ${M.message}`,
        conversationId: 'conv_test',
        metadata: {
          visitorName: M.nombre,
          visitorContact: M.contacto,
          topicSummary: M.resumen,
          purchaseSignals: M.senales,
          reason: M.reason,
          nuevoCampoNoContemplado: M.nuevo,
          intent: 'test_drive',
          hadLeadBeforeHandoff: false,
        },
      }),
    )
    assertNoMarker(lines)

    const event = lines.map(parseLine).find((l) => l?.type === 'handoff.whatsapp')
    assert.ok(event, 'la línea handoff.whatsapp tiene que seguir saliendo')

    // Lo excluido queda NOMBRADO (nunca los valores).
    assert.deepEqual(
      event.redactedKeys,
      [
        'nuevoCampoNoContemplado',
        'purchaseSignals',
        'reason',
        'topicSummary',
        'visitorContact',
        'visitorName',
      ],
      'redactedKeys tiene que nombrar exactamente lo excluido, ordenado',
    )

    // Lo seguro sobrevive con su valor.
    assert.equal(event.intent, 'test_drive')
    assert.equal(event.hadLeadBeforeHandoff, false)
    assert.equal(event.botConfigId, 'bot_test')
    assert.equal(event.conversationId, 'conv_test')

    // Toda clave emitida es del allowlist o del sobre.
    for (const key of Object.keys(event)) {
      assert.ok(
        ALLOWLIST_PIN.has(key) || ENVELOPE_KEYS.has(key),
        `clave emitida fuera del allowlist/sobre: ${key}`,
      )
    }
  })

  // ── 2. message va SOLO a DB (el fallback de persistencia tampoco lo arrastra) ──
  await check('message nunca llega a consola', async () => {
    const lines = await captureConsole(() =>
      logChatbotEvent({
        organizationId: 'org_test',
        botConfigId: 'bot_test',
        type: 'tool.lead_captured',
        level: 'info',
        message: `Lead de ${M.message} capturado`,
      }),
    )
    assertNoMarker(lines)
  })

  // ── 3. Evento sin metadata: sobre solo, sin redactedKeys ──
  await check('sin metadata: sobre solo, sin redactedKeys', async () => {
    const lines = await captureConsole(() =>
      logChatbotEvent({
        organizationId: 'org_test',
        botConfigId: 'bot_test',
        type: 'chat.persist_error',
        level: 'error',
        message: 'x',
      }),
    )
    const event = lines.map(parseLine).find((l) => l?.type === 'chat.persist_error')
    assert.ok(event, 'la línea chat.persist_error tiene que salir')
    assert.ok(!('redactedKeys' in event), 'sin metadata no hay redactedKeys')
  })

  // ── 4. Evento 100% seguro pasa intacto, sin redactedKeys ──
  await check('metadata segura pasa intacta, sin redactedKeys', async () => {
    const metadata = {
      tokensIn: 120,
      tokensOut: 350,
      costUsd: 0.0021,
      durationMs: 1800,
      latencyMs: 420,
      toolCallCount: 1,
      timings: { llm_ttfb_ms: 400, total_ms: 1800 },
    }
    const lines = await captureConsole(() =>
      logChatbotEvent({
        organizationId: 'org_test',
        botConfigId: 'bot_test',
        type: 'chat.message_completed',
        level: 'info',
        message: 'ok',
        conversationId: 'conv_test',
        metadata,
      }),
    )
    const event = lines.map(parseLine).find((l) => l?.type === 'chat.message_completed')
    assert.ok(event, 'la línea chat.message_completed tiene que salir')
    for (const [key, value] of Object.entries(metadata)) {
      assert.deepEqual(event[key], value, `la clave segura ${key} tiene que pasar intacta`)
    }
    assert.ok(!('redactedKeys' in event), 'evento todo-seguro no gana redactedKeys')
  })

  // ── 5. Telemetría permanente vía chatbotLog directo: TODOS los campos pasan ──
  // Formas canónicas tomadas de persistTurn.ts:646 / handleChatRequest.ts:747,
  // :1291 y :1329. El filtro vive en logChatbotEvent; chatbotLog es pass-through.
  const TELEMETRY_SHAPES: ReadonlyArray<{
    type: string
    fields: Record<string, unknown>
  }> = [
    {
      type: 'chat.onfinish_phases',
      fields: {
        conversationId: 'conv_test',
        botConfigId: 'bot_test',
        botSlug: 'develop',
        source: 'onFinish',
        chunks_total: 42,
        msSinceLastChunk: 15,
        chunks_text_delta: 40,
        finishReason: 'stop',
        assistantMessageLength: 512,
        phases: { quota_ms: 12, persist_ms: 80 },
        retrySkipped: false,
        attempts: 1,
        totalMs: 950,
        budgetMs: 5000,
        budgetExhausted: false,
        requestElapsedMsAtHookStart: 3200,
        budgetCapMs: 5000,
      },
    },
    {
      type: 'watchdog_settled',
      fields: {
        conversationId: 'conv_test',
        botConfigId: 'bot_test',
        botSlug: 'develop',
        reason: 'closed',
        chunks: 42,
        contentChunks: 40,
        window: 'content',
        elapsedMs: 4200,
        lastGapMs: 120,
      },
    },
    {
      type: 'provider.stream_chunks',
      fields: {
        conversationId: 'conv_test',
        botConfigId: 'bot_test',
        botSlug: 'develop',
        reason: 'natural',
        sawFinishChunk: true,
        totalChunks: 42,
        chunk_text_delta: 40,
        chunk_finish: 1,
        finishReason: 'stop',
        finishInputTokens: 120,
        finishOutputTokens: 350,
        elapsedMs: 4200,
        lastGapMs: 120,
      },
    },
    {
      type: 'chat.watchdog_fired',
      fields: {
        conversationId: 'conv_test',
        botConfigId: 'bot_test',
        botSlug: 'develop',
        reason: 'idle',
        chunks: 3,
        contentChunks: 0,
        window: 'content',
        elapsedMs: 30000,
        lastGapMs: 25000,
        assistantTextLength: 0,
        toolsInFlight: 0,
        suspendedMsTotal: 0,
      },
    },
  ]
  for (const shape of TELEMETRY_SHAPES) {
    await check(`telemetría permanente intacta: ${shape.type}`, async () => {
      const lines = await captureConsole(() => {
        chatbotLog(shape.type, shape.fields, 'info')
      })
      const event = lines.map(parseLine).find((l) => l?.type === shape.type)
      assert.ok(event, `la línea ${shape.type} tiene que salir`)
      for (const [key, value] of Object.entries(shape.fields)) {
        assert.deepEqual(
          event[key],
          value,
          `${shape.type}.${key} tiene que pasar SIN filtrar (misma forma)`,
        )
      }
    })
  }

  // ── 6. (commit 3) PrismaClientValidationError ecoa los ARGUMENTOS de la
  // query en su .message (y el stack arranca con el message). Si la query
  // llevaba name/email/phone (capture_lead, persistTurn), el mensaje los
  // arrastra. La clase entera se redacta; name/prismaCode se conservan.
  const validationError = new Prisma.PrismaClientValidationError(
    `Invalid \`prisma.chatbotLead.create()\` invocation:\n{ data: { name: "${M.nombre}", email: "${M.contacto}" } }`,
    { clientVersion: 'test' },
  )

  await check('logPersistFailure: PrismaClientValidationError no ecoa argumentos', async () => {
    const lines = await captureConsole(() => {
      logPersistFailure('chat.persist_failed', validationError, {
        conversationId: 'conv_test',
        turnIndex: 1,
      })
    })
    assertNoMarker(lines)
    const event = lines.map(parseLine).find((l) => l?.type === 'chat.persist_failed')
    assert.ok(event, 'la línea chat.persist_failed tiene que salir')
    assert.equal(event.errorName, 'PrismaClientValidationError', 'el nombre de la clase se conserva')
    assert.equal(event.conversationId, 'conv_test', 'los campos del turno se conservan')
  })

  await check('chatbotError: PrismaClientValidationError no ecoa argumentos (ni en stack)', async () => {
    const lines = await captureConsole(() => {
      chatbotError('lead_capture', validationError, { conversationId: 'conv_test' })
    })
    assertNoMarker(lines)
    const event = lines.map(parseLine).find((l) => l?.type === 'error.lead_capture')
    assert.ok(event, 'la línea error.lead_capture tiene que salir')
  })

  await check('los errores comunes conservan su message (solo se redacta la clase que ecoa args)', async () => {
    const known = new Prisma.PrismaClientKnownRequestError('Server has closed the connection.', {
      code: 'P1017',
      clientVersion: 'test',
    })
    const lines = await captureConsole(() => {
      logPersistFailure('chat.persist_failed', known, {})
    })
    const event = lines.map(parseLine).find((l) => l?.type === 'chat.persist_failed')
    assert.ok(event, 'la línea tiene que salir')
    assert.equal(event.errorMessage, 'Server has closed the connection.')
    assert.equal(event.prismaCode, 'P1017')
  })

  // El helper que usan los catch de tools/admin (captureLead,
  // confirmContactRequest, saveBotConfig, saveKnowledgeBase) — pin directo.
  await check('sanitizeErrorMessage: redacta SOLO la clase que ecoa argumentos', () => {
    assert.ok(
      !sanitizeErrorMessage(validationError).includes(M.nombre),
      'validation error → mensaje redactado',
    )
    assert.equal(sanitizeErrorMessage(new Error('fetch failed')), 'fetch failed')
    assert.equal(sanitizeErrorMessage('boom'), 'boom')
  })

  // ── 7. (commit 3) Claves de IP en la denylist de scrub-pii — blindaje
  // pre-activación de Sentry: la IPv6 pasa los regex de texto libre, así que
  // los headers de IP se redactan por CLAVE, enteros.
  await check('scrub-pii: los headers de IP están en la denylist por clave', () => {
    const { SENSITIVE_KEY_PATTERN } = __INTERNALS_FOR_TESTING__
    for (const key of [
      'x-forwarded-for',
      'X-Forwarded-For',
      'x-real-ip',
      'x-nf-client-connection-ip',
      'ip_address',
      'ip',
      'forwarded',
    ]) {
      assert.ok(
        SENSITIVE_KEY_PATTERN.test(key),
        `la clave ${key} tiene que estar cubierta por la denylist`,
      )
    }
    // Y una clave inocente no se come el redactado por accidente.
    assert.ok(!SENSITIVE_KEY_PATTERN.test('conversationId'), 'conversationId no se redacta')
    assert.ok(!SENSITIVE_KEY_PATTERN.test('shipping'), 'shipping (contiene "ip") no se redacta')
  })

  console.log(
    failed === 0
      ? `\nPRIVACIDAD console-pii OK — ${passed} checks`
      : `\nPRIVACIDAD console-pii EN ROJO — ${failed} de ${passed + failed} checks fallaron`,
  )
  if (failed > 0) process.exit(1)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
