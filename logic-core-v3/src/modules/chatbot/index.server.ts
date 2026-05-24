/**
 * develOP Chatbot Module — Server-only exports
 *
 * This barrel contains exports that depend on Node.js runtime
 * (LLM providers, DB queries, tools, etc.). Import from here
 * in API routes and Server Components only.
 *
 * Client components should import from '@/modules/chatbot' instead.
 */

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

// Chat handler (Sprint S5)
export { handleChatRequest } from './server/chat'

// Safety, rate-limiting, quota
export { validateAssistantOutput, hashIp } from './server/safety'
export type { ValidationWarning, ValidationSeverity } from './server/safety'
export { checkRateLimit, resetRateLimits } from './server/rate-limit'
export type { RateLimitResult } from './server/rate-limit'
export { checkQuota, incrementQuota } from './server/quota'
export type { QuotaCheckResult } from './server/quota'
export { resolveBotBySlug, getOrCreateConversation } from './server/conversation'

// Intent detection
export { detectIntent } from './server/intent'
export type { IntentType, IntentResult } from './server/intent'

// Logging
export { chatbotLog, chatbotDebug, chatbotError, logChatbotEvent } from './server/logging'
export type { LogLevel } from './server/logging'
export { sendLeadNotificationEmail } from './server/notifications'

// Config endpoint (Sprint S6)
export { handleConfigRequest, getPublicConfig } from './server/config'
export {
  generateInsightsForBot,
  actOnInsight,
  getPendingInsightsByOrgSlug,
  getInsightHistoryByOrgSlug,
  getInsightsCountForBot,
} from './server/insights'

// Admin server actions (Sprint S13+)
export {
  saveKnowledgeBase,
  saveBotConfig,
  saveKnowledgeBaseByOrgSlug,
  saveBotConfigByOrgSlug,
  sendTestNotification,
} from './server/admin'
export type { KnowledgeBaseInput, BotConfigInput } from './server/admin'

// Admin queries (Sprint S15)
export { getClientChatbotSession } from './server/admin/getClientSession'
export { checkClientHasChatbot } from './server/admin/clientHasChatbot'
export { listLeadsForBot, listConversationsForBot, getMonthlyUsageForBot } from './server/admin/queries'
export { getBotByOrgSlug, listLeadsByOrgSlug, listConversationsByOrgSlug, getUsageByOrgSlug, listRecentHandoffsByOrgSlug, getLeadByIdForOrg, getConversationMessagesForOrg, countHotNewLeadsForOrg } from './server/admin/multiTenantQueries'
export type { HandoffEvent } from './server/admin/multiTenantQueries'

// Health (Sprint S20)
export { checkChatbotHealth, runLLMSmokeTest } from './server/health'
export type { HealthCheckResult, SmokeTestResult } from './server/health'
export { checkChatbotEnv, requireChatbotEnv } from './server/config/envValidator'
export type { EnvVarStatus, EnvCheckResult } from './server/config/envValidator'
