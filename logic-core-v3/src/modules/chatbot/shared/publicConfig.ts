import type { QuickReply, ProactivePromptsMap, RouteColorMap } from './types'

/**
 * Set when the bot is paused (B8.3 — `BotConfig.isActive = false`). The
 * widget still mounts so the visitor sees a dignified "we're offline,
 * reach us by WhatsApp" card instead of a silent disappearance.
 *
 * Same shape as the per-request `degradedResponse` from handleChatRequest —
 * useChatbot maps it to `degradedInfo` with `reason: 'bot_paused'`.
 */
export interface PausedInfo {
  message: string
  whatsappNumber: string | null
  whatsappMessage: string | null
  companyName: string | null
}

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

  /**
   * Present only when the bot is paused. The widget reads this to render
   * the degraded card immediately (no /chat round-trip needed). `null`
   * when the bot is active.
   */
  paused: PausedInfo | null
}
