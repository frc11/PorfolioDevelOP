import { prisma } from '@/lib/prisma'
import { chatbotLog } from './logger'

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

  // Persist to BD (fire and forget — don't block the request)
  try {
    await prisma.chatbotEvent.create({
      data: {
        botConfigId: params.botConfigId,
        type: params.type,
        level: params.level,
        message: params.message,
        conversationId: params.conversationId ?? null,
        metadata: (params.metadata ?? null) as never,
      },
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
  const result = await prisma.chatbotEvent.deleteMany({
    where: { createdAt: { lt: threshold } },
  })
  return result.count
}
