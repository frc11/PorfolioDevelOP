/**
 * develOP Chatbot Module — Client-safe exports
 *
 * This barrel is safe to import from client components.
 * It contains ONLY types, UI components, and hooks.
 *
 * For server-side code (LLM, tools, DB queries), import from:
 *   '@/modules/chatbot/index.server'
 *
 * @see README.md for extraction guide and module boundary rules.
 */

// Types (Sprint S1)
export type {
  ChatbotOrganization,
  QuickReply,
  ProactivePromptsMap,
  RouteColorMap,
  AvatarStyle,
  LLMProviderName,
  ChatbotLeadStatus,
  BotTone,
  BotIndustry,
} from './shared/types'

// Public config type (Sprint S6)
export type { PublicBotConfig } from './shared/publicConfig'

// Avatar (Sprint S7)
export { NeuroAvatar } from './components/avatar'
export type { NeuroAvatarProps, NeuroAvatarState } from './components/avatar'

// ChatWindow (Sprint S8)
export {
  ChatWindow,
  ChatHeader,
  ChatMessages,
  ChatMessage,
  ChatInput,
  QuickReplyChips,
  DegradedBanner,
} from './components/chat'
export type {
  ChatWindowProps,
  UIChatMessage,
  ToolCallInUIMessage,
} from './components/chat'

// Tool cards (Sprint S9)
export {
  HandoffOptionsCard,
  WhatsappHandoffCard,
  NavigateToPageCard,
  renderToolCall,
} from './components/tool-cards'
export type { ToolCallCallbacks } from './components/tool-cards'

// ProactiveTooltip (Sprint S10)
export { ProactiveTooltip } from './components/tooltip'
export type { ProactiveTooltipProps, TooltipTrigger } from './components/tooltip'

// Companion (Sprint S11)
export { LogicCompanion } from './components/LogicCompanion'
export { useChatbot } from './hooks'
export type { UseChatbotOptions, UseChatbotReturn } from './hooks'

// Avatar variants (Sprint S12)
export { AvatarRenderer, LegacyNeuroAvatar } from './components/avatar'
export type { AvatarRendererProps } from './components/avatar'

// Admin UI components (Sprint S13+)
export { KnowledgeBaseEditor, BotConfigEditor } from './components/admin'
export { ActivityLog } from './components/admin'
export { ClientChatbotTabs, OnboardingWizard } from './components/admin'

// Admin actions
export { createClientWithBot } from './server/admin/createClientWithBot'
export type { Industry } from './server/admin/createClientWithBot'

// Dashboard UI components (Sprint S15)
export { LeadsTable, ConversationsTable } from './components/dashboards'
export { ClientDashboardTabs, ClientLeadsTable } from './components/dashboard'

// Lead CRM Server Actions
export { updateLeadStatus } from './server/admin/updateLeadStatus'
export { saveClientSettings } from './server/admin/saveClientSettings'
export { saveClientKnowledgeBase } from './server/admin/saveClientKnowledgeBase'
