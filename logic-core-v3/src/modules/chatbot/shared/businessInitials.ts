/**
 * Derive 1–2 uppercase initials from a bot/business name, used by the
 * Monogram avatar (and ignored by every other avatar in the registry).
 *
 * Returns `undefined` when the input is empty so the MonogramAvatar can
 * fall back to its neutral placeholder.
 */
export function deriveBusinessInitials(botName: string): string | undefined {
  const cleaned = botName.trim().replace(/\s+/g, ' ')
  if (!cleaned) return undefined
  const parts = cleaned.split(' ').filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return cleaned.slice(0, 2).toUpperCase()
}
