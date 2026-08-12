import { ChatbotEventLevel } from '@prisma/client'
import { forOrg, unsafeGlobalQuery } from '@/lib/isolation'
import { chatbotLog, sanitizeErrorMessage } from './logger'

// B11.4 — mantenemos la API lowercase para no romper los ~15 callsites
// existentes; el mapping a enum UPPER vive acá. El console logger sigue
// recibiendo lowercase (formato histórico de los logs).
const LEVEL_TO_ENUM: Record<'info' | 'warn' | 'error', ChatbotEventLevel> = {
  info: ChatbotEventLevel.INFO,
  warn: ChatbotEventLevel.WARN,
  error: ChatbotEventLevel.ERROR,
}

/**
 * PRIVACIDAD — allowlist del camino CONSOLA.
 *
 * `logChatbotEvent` emite a dos sinks: la columna org-scoped
 * `chatbot_events.metadata` (INTACTA — es dato del propio cliente y el panel
 * la consume) y la consola (stdout/stderr → Netlify Logs, visibles para la
 * plataforma). A consola solo pasan las claves de esta lista — la unión de
 * las claves seguras (ids, contadores, duraciones, booleans, enums,
 * longitudes) de los 18 callsites al momento del barrido. El resto se
 * reemplaza por `redactedKeys` (los NOMBRES excluidos, nunca los valores):
 * la señal de que el dato existió sobrevive para diagnóstico.
 *
 * Allowlist y no denylist: una clave nueva queda FUERA del log por omisión
 * (visible y recuperable vía redactedKeys), en vez de FUGARSE por omisión.
 * Agregar una clave acá es una decisión consciente — el test
 * __tests__/console-pii.invariant.ts duplica la lista a propósito y se pone
 * en rojo si divergen.
 */
export const CONSOLE_METADATA_ALLOWLIST: ReadonlySet<string> = new Set([
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

/**
 * Logs an event AND persists it to the chatbot_events table for the
 * activity dashboard.
 *
 * Use this for user-facing events worth showing in the admin (messages,
 * leads, errors). Don't use for verbose debug logs.
 *
 * If persistence fails, falls back to console-only logging — never throws.
 */
export async function logChatbotEvent(params: {
  organizationId: string
  botConfigId: string
  type: string
  level: 'info' | 'warn' | 'error'
  message: string
  conversationId?: string | null
  metadata?: Record<string, unknown>
}): Promise<void> {
  // Always log to console (the existing flow) — pero SOLO claves del
  // allowlist: la metadata completa va únicamente a la DB org-scoped.
  // `message` tampoco sale por acá (solo DB), desde siempre — mantener.
  const consoleFields: Record<string, unknown> = {
    botConfigId: params.botConfigId,
    conversationId: params.conversationId,
  }
  const redactedKeys: string[] = []
  if (params.metadata) {
    for (const [key, value] of Object.entries(params.metadata)) {
      if (CONSOLE_METADATA_ALLOWLIST.has(key)) consoleFields[key] = value
      else redactedKeys.push(key)
    }
  }
  if (redactedKeys.length > 0) consoleFields.redactedKeys = redactedKeys.sort()
  chatbotLog(params.type, consoleFields, params.level)

  // Persist to BD. El create scoped verifica que el bot (y la conversación, si
  // viene) sean de la org.
  //
  // ⚠️ ESTO BLOQUEA. El `await` es real: la función no resuelve hasta que Neon
  // contesta (o el try/catch de abajo atrapa el fallo). El comentario anterior
  // decía "fire and forget — don't block the request" y era falso; con una DB
  // que no responde, esta llamada se cuelga y arrastra a su llamador. Fue parte
  // de por qué el cuelgue del onFinish del chatbot pasó inadvertido.
  //
  // NO se cambió a fire-and-forget de verdad: hay ~18 callsites que hoy asumen
  // que al resolver el evento ya está escrito, y en serverless el trabajo async
  // sin await no tiene garantía de completarse (la plataforma congela la función
  // al cerrar la respuesta). El techo de tiempo lo pone el LLAMADOR cuando está
  // en un camino sensible a latencia — ver `runHookOp`/`withDeadline` en
  // `server/chat/` (DEADLINE-ONFINISH). Acá la semántica queda intacta.
  try {
    await forOrg(params.organizationId).chatbotEvent.create({
      botConfigId: params.botConfigId,
      type: params.type,
      level: LEVEL_TO_ENUM[params.level],
      message: params.message,
      conversationId: params.conversationId ?? null,
      metadata: (params.metadata ?? null) as never,
    })
  } catch (error) {
    // Persistence failure should not break the chat flow
    // We log to console as fallback
    console.error(
      JSON.stringify({
        type: 'logger.persist_failed',
        level: 'error',
        error: sanitizeErrorMessage(error),
      })
    )
  }
}

/**
 * Deletes events older than `maxAgeDays`. Use periodically (cron, manual call).
 * Default: 30 days.
 */
export async function cleanupOldEvents(maxAgeDays: number = 30): Promise<number> {
  const threshold = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000)
  // PLATFORM-MAINTENANCE: purga global de chatbot_events por antigüedad
  // (cron/manual). No tiene eje de tenant — barre todas las orgs por diseño.
  const result = await unsafeGlobalQuery(
    'PLATFORM-MAINTENANCE: purga de chatbot_events por antigüedad, sin eje de tenant (cron/manual)',
    (c) => c.chatbotEvent.deleteMany({ where: { createdAt: { lt: threshold } } }),
  )
  return result.count
}
