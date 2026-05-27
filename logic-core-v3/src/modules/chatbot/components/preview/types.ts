/**
 * CC.4 — Tipo compartido para el preview vivo del bot.
 *
 * Subset visual de `BotConfigInput` con SOLO los campos que el preview consume.
 * Lo usan dos lugares:
 *   1. Admin (`/admin/chatbots/[id]?tab=config`) — mapea desde `BotConfigEditorState`.
 *   2. Dashboard cliente (`/dashboard/chatbot/settings`) — merge de campos que
 *      el cliente edita (5) + campos que el admin ya configuró y vienen de DB (resto).
 *
 * No incluye: modelo LLM, temperatura, prompts, tokens, dominios, notificaciones,
 * ni ningún tecnicismo. Solo lo que el visitante ve del widget.
 */

/**
 * Los enums se aceptan como `string` porque el cliente alimenta el preview con
 * valores que vienen crudos de DB (Prisma los devuelve como string, no como
 * literal types). El componente normaliza internamente con defaults.
 */
export interface BotPreviewState {
  botName: string
  isActive: boolean
  accentColor: string
  chatSurfaceTint: string | null
  position: string
  avatarStyle: string
  avatarImageUrl: string | null
  avatarEmoji: string | null
  borderRadius: string
  bubbleStyle: string
  surfaceStyle: string
  intensityLevel: string
  fontStyle: string
  welcomeMessage: string
  quickReplies: BotPreviewQuickReply[]
}

export interface BotPreviewQuickReply {
  id?: string
  emoji?: string
  label: string
}
