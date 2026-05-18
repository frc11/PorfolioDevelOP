import { prisma } from '@/lib/prisma'
import type { PublicBotConfig } from '../../shared/publicConfig'
import type { QuickReply, ProactivePromptsMap, RouteColorMap } from '../../shared/types'

function normalizeQuickReplies(value: unknown): QuickReply[] {
  if (!Array.isArray(value)) return []

  const replies: QuickReply[] = []

  for (const item of value) {
    if (typeof item === 'string') {
      const text = item.trim()
      if (text) replies.push({ label: text, promptToSend: text })
      continue
    }

    if (!item || typeof item !== 'object') continue

    const record = item as Record<string, unknown>
    const label = typeof record.label === 'string' ? record.label.trim() : ''
    const promptToSend =
      typeof record.promptToSend === 'string'
        ? record.promptToSend.trim()
        : typeof record.prompt === 'string'
          ? record.prompt.trim()
          : label
    const emoji = typeof record.emoji === 'string' ? record.emoji : undefined

    if (label && promptToSend) {
      replies.push({ emoji, label, promptToSend })
    }
  }

  return replies
}

/**
 * Returns the public config for a bot by its slug, or null if not found
 * or inactive.
 *
 * Uses Prisma `select` to fetch only the fields needed — no server-only
 * data (llmProvider, llmModel, monthlyQuota, tone, temperature, etc.)
 * ever leaves the database layer.
 */
export async function getPublicConfig(slug: string): Promise<PublicBotConfig | null> {
  const bot = await prisma.botConfig.findUnique({
    where: { slug },
    select: {
      botName: true,
      isActive: true,
      accentColor: true,
      accentSecondary: true,
      chatSurfaceTint: true,
      avatarStyle: true,
      avatarImageUrl: true,
      avatarEmoji: true,
      borderRadius: true,
      surfaceStyle: true,
      position: true,
      fontStyle: true,
      bubbleStyle: true,
      intensityLevel: true,
      welcomeMessage: true,
      quickReplies: true,
      routeColorMap: true,
      proactivePrompts: true,
      whatsappNumber: true,
    },
  })

  if (!bot || !bot.isActive) return null

  return {
    botName: bot.botName,
    isActive: bot.isActive,
    accentColor: bot.accentColor,
    accentSecondary: bot.accentSecondary,
    chatSurfaceTint: bot.chatSurfaceTint,
    avatarStyle: bot.avatarStyle,
    avatarImageUrl: bot.avatarImageUrl,
    avatarEmoji: bot.avatarEmoji,
    borderRadius: bot.borderRadius,
    surfaceStyle: bot.surfaceStyle,
    position: bot.position,
    fontStyle: bot.fontStyle,
    bubbleStyle: bot.bubbleStyle,
    intensityLevel: bot.intensityLevel,
    welcomeMessage: bot.welcomeMessage,
    quickReplies: normalizeQuickReplies(bot.quickReplies),
    routeColorMap: (bot.routeColorMap as unknown as RouteColorMap) ?? {},
    proactivePrompts: (bot.proactivePrompts as unknown as ProactivePromptsMap) ?? {},
    whatsappNumber: bot.whatsappNumber,
  }
}
