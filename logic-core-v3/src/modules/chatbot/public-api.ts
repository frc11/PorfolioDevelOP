/**
 * develOP Chatbot Module — Public API (frontera del Motor).
 *
 * B2-S1 — Este barrel es el ÚNICO punto de entrada por el que `src/modules/motor`
 * puede importar del chatbot (frontera ESLint B0, ver eslint.config.mjs y
 * src/modules/motor/README.md). Todo lo que el Motor necesita del chatbot pasa
 * por acá; nada más de `@/modules/chatbot/*` le está permitido.
 *
 * Superficie mínima a propósito: hoy, solo la respuesta sincrónica del bot
 * (`generateBotReply`) y sus tipos/errores. Crece con cada sprint que exponga
 * algo nuevo al Motor — nunca re-exportando el barrel server-only entero.
 */
export {
  generateBotReply,
  GenerateBotReplyError,
  BotNotInOrgError,
  BotUnavailableError,
} from './server/chat/generateBotReply'
export type {
  GenerateBotReplyInput,
  GenerateBotReplyResult,
} from './server/chat/generateBotReply'
