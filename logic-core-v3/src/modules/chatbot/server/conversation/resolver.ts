import { prisma } from '@/lib/prisma'
import type { BotConfig, KnowledgeBase, Conversation } from '@prisma/client'

type BotConfigWithRelations = BotConfig & {
  knowledgeBase: KnowledgeBase | null
  organization: { id: string; companyName: string }
}

// In-memory cache for BotConfig + KnowledgeBase (changes only when admin saves config)
const botCache = new Map<string, { data: BotConfigWithRelations; expiresAt: number }>()
const BOT_CACHE_TTL_MS = 60_000

/**
 * Resolves the bot by its public slug. Returns null if not found
 * or inactive. Results are cached in-memory for 60s.
 */
export async function resolveBotBySlug(slug: string): Promise<BotConfigWithRelations | null> {
  const cached = botCache.get(slug)
  if (cached && cached.expiresAt > Date.now()) return cached.data

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

  botCache.set(slug, { data: bot, expiresAt: Date.now() + BOT_CACHE_TTL_MS })
  return bot
}

/** Invalidates the bot cache for a given slug (call after admin saves config). */
export function invalidateBotCache(slug: string): void {
  botCache.delete(slug)
}

export interface GetOrCreateConversationInput {
  botConfigId: string
  sessionId: string
  currentPath?: string
  referrer?: string
  visitorIpHash?: string
  visitorUserAgent?: string
}

export interface GetOrCreateConversationResult {
  conversation: Conversation
  isNew: boolean
}

/**
 * Returns the existing conversation for this (bot, sessionId) pair,
 * or creates a new one. Updates lastMessageAt on every call.
 * Returns { conversation, isNew } so callers don't need a separate findFirst.
 */
export async function getOrCreateConversation(
  input: GetOrCreateConversationInput
): Promise<GetOrCreateConversationResult> {
  const existing = await prisma.conversation.findFirst({
    where: {
      botConfigId: input.botConfigId,
      sessionId: input.sessionId,
    },
  })

  const now = new Date()

  if (existing) {
    const conversation = await prisma.conversation.update({
      where: { id: existing.id },
      data: {
        lastMessageAt: now,
        ...(input.currentPath ? { currentPath: input.currentPath } : {}),
      },
    })
    return { conversation, isNew: false }
  }

  const conversation = await prisma.conversation.create({
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
  return { conversation, isNew: true }
}
