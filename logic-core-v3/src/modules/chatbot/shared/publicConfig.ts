import type { QuickReply, ProactivePromptsMap, RouteColorMap } from './types'

/**
 * Shape of the public config returned by GET /api/chatbot/[slug]/config.
 *
 * This is the ONLY data the frontend needs to render the widget.
 * Anything in BotConfig that's not here is considered server-only.
 *
 * Specifically excluded (server-only): llmProvider, llmModel, monthlyQuota,
 * tone (used in prompt builder), temperature, maxOutputTokens,
 * industry, knowledgeBase, forbiddenStatements.
 */
export interface PublicBotConfig {
  // Identity
  botName: string
  isActive: boolean

  // Visual design
  accentColor: string
  accentSecondary: string | null
  chatSurfaceTint: string | null
  avatarStyle: string
  avatarImageUrl: string | null
  avatarEmoji: string | null
  borderRadius: string
  surfaceStyle: string
  position: string
  fontStyle: string
  bubbleStyle: string
  intensityLevel: string

  // Behavior config
  welcomeMessage: string
  quickReplies: QuickReply[]
  routeColorMap: RouteColorMap
  proactivePrompts: ProactivePromptsMap

  // Handoff
  whatsappNumber: string | null
}
