import type { NeuroAvatarState } from './types'

/**
 * Mapper from the modern 5-state model to the legacy NeuroAvatar's
 * complex prop combinations.
 *
 * The legacy avatar uses "phases" (dormant/initializing/stabilizing/active/sleeping)
 * combined with boolean flags (isThinking, isOpen, etc.). This function
 * provides the closest semantic equivalent.
 */
export interface LegacyAvatarProps {
  phase: 'dormant' | 'initializing' | 'stabilizing' | 'active' | 'sleeping'
  isThinking: boolean
  isOpen: boolean
  showPrompt: boolean
  isBooped: boolean
  isHovered: boolean
  messagePulse: number
  hoverPulse: number
  lastMessageRole: 'user' | 'assistant' | undefined
  contextColor: 'cyan' | 'violet' | 'emerald' | 'amber' | 'cycle'
  embedded: boolean
}

/**
 * Hex → context color name (closest match).
 * Falls back to 'cyan' for unrecognized colors.
 */
export function hexToContextColor(hex: string): LegacyAvatarProps['contextColor'] {
  const normalized = hex.toLowerCase()
  if (normalized.startsWith('#06b') || normalized.startsWith('#00e')) return 'cyan'
  if (normalized.startsWith('#8b5') || normalized.startsWith('#a78')) return 'violet'
  if (normalized.startsWith('#10b') || normalized.startsWith('#22c') || normalized.startsWith('#00f')) return 'emerald'
  if (normalized.startsWith('#f59') || normalized.startsWith('#fbb') || normalized.startsWith('#f97')) return 'amber'
  return 'cyan'
}

/**
 * Translates the modern state into props for the legacy avatar.
 *
 * Notes:
 * - We avoid 'sleeping' phase (which renders the "Z" sprite) — that
 *   was deliberately rejected in design review (B2B mismatch). Instead,
 *   'dormant' is mapped to phase='dormant' with isOpen=false.
 * - 'speaking' is mapped to active + messagePulse bumped to trigger
 *   the mouth/face reactions.
 */
export function mapStateToLegacyProps(
  state: NeuroAvatarState,
  accentColor: string,
  messagePulse: number = 0
): LegacyAvatarProps {
  const contextColor = hexToContextColor(accentColor)
  const base: LegacyAvatarProps = {
    phase: 'active',
    isThinking: false,
    isOpen: true,
    showPrompt: false,
    isBooped: false,
    isHovered: false,
    messagePulse,
    hoverPulse: 0,
    lastMessageRole: undefined,
    contextColor,
    embedded: true,
  }
  switch (state) {
    case 'idle':
      return { ...base, isOpen: false }
    case 'listening':
      return { ...base, isHovered: true }
    case 'thinking':
      return { ...base, isThinking: true }
    case 'speaking':
      return { ...base, messagePulse: messagePulse + 1, lastMessageRole: 'assistant' }
    case 'dormant':
      return { ...base, phase: 'dormant', isOpen: false }
  }
}
