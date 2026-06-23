export const CURATED_COLORS = [
  '#06b6d4',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#f43f5e',
  '#6366f1',
  '#0ea5e9',
  '#14b8a6',
] as const

export const BOT_POSITIONS = ['bottom_right', 'bottom_left'] as const
/**
 * Avatar styles that the CLIENT dashboard exposes. The five registry ids
 * must stay in sync with AVATAR_REGISTRY in
 * src/modules/chatbot/components/avatar/registry.ts. Listed here as plain
 * literals so this shared module stays free of UI component imports
 * (avoids circular dep with the registry).
 *
 * 'emoji' and 'image' are escape hatches the client may pick (a single emoji
 * on a brand-tinted disc, or a custom uploaded photo). Neither is a registry
 * entry — AvatarRenderer handles them directly.
 *
 * Source of truth for runtime validation lives in
 * src/modules/chatbot/components/avatar/avatarStyleSchema.ts.
 */
export const CLIENT_AVATAR_STYLES = [
  'neuro',
  'legacy_neuro',
  'monograma',
  'onda',
  'geometrico',
  'emoji',
  'image',
] as const

export type CuratedColor = (typeof CURATED_COLORS)[number]
export type BotPosition = (typeof BOT_POSITIONS)[number]
export type ClientAvatarStyle = (typeof CLIENT_AVATAR_STYLES)[number]

export function isCuratedColor(value: string): value is CuratedColor {
  return CURATED_COLORS.includes(value as CuratedColor)
}
