import { prisma } from '@/lib/prisma'
import type { BotConfig, KnowledgeBase, Conversation } from '@prisma/client'

/**
 * Resolves the bot by its public slug. Returns null if not found
 * or inactive.
 */
export async function resolveBotBySlug(slug: string): Promise<
  | (BotConfig & {
      knowledgeBase: KnowledgeBase | null
      organization: { id: string; companyName: string }
    })
  | null
> {
  const bot = await prisma.botConfig.findUnique({
    where: { slug },
    include: {
      knowledgeBase: true,
      organization: {
        select: { id: true, companyName: true },
      },
    },
  })

  if (!bot || !bot.isActive || !bot.knowledgeBase) {
    return null
  }

  return bot
}

export interface GetOrCreateConversationInput {
  botConfigId: string
  sessionId: string
  currentPath?: string
  referrer?: string
  visitorIpHash?: string
  visitorUserAgent?: string
}

/**
 * Returns the existing conversation for this (bot, sessionId) pair,
 * or creates a new one. Updates lastMessageAt on every call.
 */
export async function getOrCreateConversation(
  input: GetOrCreateConversationInput
): Promise<Conversation> {
  const existing = await prisma.conversation.findFirst({
    where: {
      botConfigId: input.botConfigId,
      sessionId: input.sessionId,
    },
  })

  const now = new Date()

  if (existing) {
    return await prisma.conversation.update({
      where: { id: existing.id },
      data: {
        lastMessageAt: now,
        // Update soft metadata only if newly provided
        ...(input.currentPath ? { currentPath: input.currentPath } : {}),
      },
    })
  }

  return await prisma.conversation.create({
    data: {
      botConfigId: input.botConfigId,
      sessionId: input.sessionId,
      currentPath: input.currentPath ?? null,
      referrerUrl: input.referrer ?? null,
      ipHash: input.visitorIpHash ?? null,
      userAgent: input.visitorUserAgent ?? null,
      startedAt: now,
      lastMessageAt: now,
    },
  })
}
