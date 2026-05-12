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
