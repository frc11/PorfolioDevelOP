/**
 * develOP Chatbot Module
 *
 * Public API of the chatbot module. Anything outside this module
 * should ONLY import from this barrel, never from internal files.
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

// More exports will be added as sprints progress.
// Sprint S1: types only (no runtime code yet).

// LLM abstraction (Sprint S2)
export type { LLMProvider, ModelInfo } from './server/llm'
export {
  ProviderNotImplementedError,
  ModelNotSupportedError,
  getLLMProvider,
  resetProviderCache,
} from './server/llm'

// Cost calculation (Sprint S2)
export type { CostBreakdown } from './server/pricing'
export { calculateCost } from './server/pricing'

// Prompt builder (Sprint S3)
export type {
  BotConfigForPrompt,
  KnowledgeBaseForPrompt,
  PromptContext,
  BuildSystemPromptInput,
} from './server/prompts'
export { buildSystemPrompt, formatTone, formatDateTimeArgentina } from './server/prompts'

// Tools (Sprint S4)
export type {
  ToolCallContext,
  ToolExecuteResult,
  CaptureLeadResult,
  ChatbotTools,
  CaptureLeadInput,
  OfferHandoffOptionsInput,
  ShowWhatsappHandoffInput,
  NavigateToPageInput,
  ValidPath,
} from './server/tools'
export { getTools, VALID_PATHS } from './server/tools'

// Chat handler (Sprint S5) — public entrypoint for the API route
export { handleChatRequest } from './server/chat'

// Auxiliary exports for testing and future use
export { validateAssistantOutput, hashIp } from './server/safety'
export type { ValidationWarning, ValidationSeverity } from './server/safety'
export { checkRateLimit, resetRateLimits } from './server/rate-limit'
export type { RateLimitResult } from './server/rate-limit'
export { checkQuota, incrementQuota } from './server/quota'
export type { QuotaCheckResult } from './server/quota'
export { resolveBotBySlug, getOrCreateConversation } from './server/conversation'
export { chatbotLog } from './server/logging'
export type { LogLevel } from './server/logging'

// Config endpoint (Sprint S6)
export { handleConfigRequest, getPublicConfig } from './server/config'
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

// Admin (Sprint S13+)
export { KnowledgeBaseEditor, BotConfigEditor } from './components/admin'
export { saveKnowledgeBase, saveBotConfig } from './server/admin'
export type { KnowledgeBaseInput, BotConfigInput } from './server/admin'

// Dashboards (Sprint S15)
export { LeadsTable, ConversationsTable } from './components/dashboards'
export { listLeadsForBot, listConversationsForBot, getMonthlyUsageForBot } from './server/admin/queries'
