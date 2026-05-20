'use client'

import { BotConfigEditor } from '@/modules/chatbot/components/admin/BotConfigEditor'
import type { BotWithDetails } from '../BotDetailClient'

interface Props {
  bot: BotWithDetails
}

export function ConfigTab({ bot }: Props) {
  const initial = {
    botConfigId: bot.id,
    slug: bot.slug,
    botName: bot.botName,
    isActive: bot.isActive,
    industry: bot.industry ?? 'generico',
    tone: bot.tone ?? 'informal_rioplatense',
    welcomeMessage: bot.welcomeMessage ?? '',
    accentColor: bot.accentColor,
    accentSecondary: bot.accentSecondary,
    chatSurfaceTint: bot.chatSurfaceTint,
    avatarStyle: bot.avatarStyle as 'neuro' | 'legacy_neuro' | 'simple' | 'image' | 'emoji',
    avatarImageUrl: bot.avatarImageUrl,
    avatarEmoji: bot.avatarEmoji,
    borderRadius: bot.borderRadius as 'small' | 'medium' | 'large',
    surfaceStyle: bot.surfaceStyle as 'glass' | 'solid' | 'minimal',
    position: bot.position as 'bottom_right' | 'bottom_left',
    fontStyle: bot.fontStyle as 'sans' | 'serif' | 'mono',
    bubbleStyle: bot.bubbleStyle as 'sharp' | 'rounded' | 'pill',
    intensityLevel: bot.intensityLevel as 'low' | 'medium' | 'high',
    whatsappNumber: bot.whatsappNumber,
    whatsappMessage: bot.whatsappMessage,
    llmProvider: bot.llmProvider as 'google' | 'anthropic' | 'openai',
    llmModel: bot.llmModel,
    temperature: bot.temperature,
    maxOutputTokens: bot.maxOutputTokens,
    monthlyQuota: bot.monthlyQuota,
    quickReplies: bot.quickReplies as unknown as Array<{
      id?: string
      emoji?: string
      label: string
      promptToSend: string
    }>,
    proactivePrompts: bot.proactivePrompts as unknown as Record<string, string[]>,
    routeColorMap: bot.routeColorMap as unknown as Record<string, string>,
    leadNotificationEmail: bot.organization.leadNotificationEmail,
    leadNotificationMode: bot.organization.leadNotificationMode as
      | 'IMMEDIATE'
      | 'DAILY_DIGEST'
      | 'DISABLED',
    allowedDomains: bot.allowedDomains ?? [],
  }

  return <BotConfigEditor initial={initial} orgSlug={bot.organization.slug} />
}
