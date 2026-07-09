import { ChatbotEventLevel } from '@prisma/client'
import { forOrg, unsafeGlobalQuery } from '@/lib/isolation'
import { chatbotLog } from './logger'

// B11.4 — mantenemos la API lowercase para no romper los ~15 callsites
// existentes; el mapping a enum UPPER vive acá. El console logger sigue
// recibiendo lowercase (formato histórico de los logs).
const LEVEL_TO_ENUM: Record<'info' | 'warn' | 'error', ChatbotEventLevel> = {
  info: ChatbotEventLevel.INFO,
  warn: ChatbotEventLevel.WARN,
  error: ChatbotEventLevel.ERROR,
}

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
  // Always log to console (the existing flow)
  chatbotLog(
    params.type,
    {
      botConfigId: params.botConfigId,
      conversationId: params.conversationId,
      ...params.metadata,
    },
    params.level
  )

  // Persist to BD (fire and forget — don't block the request). El create
  // scoped verifica que el bot (y la conversación, si viene) sean de la org.
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
        error: error instanceof Error ? error.message : 'unknown',
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
