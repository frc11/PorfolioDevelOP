export { handleChatRequest } from './handleChatRequest'

// B2-S1 — superficie sincrónica (consumo interno, ej. el Motor vía public-api).
export {
  generateBotReply,
  GenerateBotReplyError,
  BotNotInOrgError,
  BotUnavailableError,
} from './generateBotReply'
export type { GenerateBotReplyInput, GenerateBotReplyResult } from './generateBotReply'
