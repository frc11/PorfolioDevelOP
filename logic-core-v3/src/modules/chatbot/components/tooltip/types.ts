import type { PublicBotConfig } from '../../shared/publicConfig'

export type TooltipTrigger = 'mount' | 'idle' | 'scroll'

export interface ProactiveTooltipProps {
  config: PublicBotConfig
  /** Path the user is currently on, used to look up the right prompt. */
  currentPath: string
  /** Called when user clicks the tooltip. */
  onAccept: (prompt: string) => void
  /** Called when tooltip auto-dismisses or X click. */
  onDismiss: () => void
  /**
   * Optional, default-off. Overrides the message set the tooltip shows/rotates.
   * When provided (and non-empty), these are used instead of
   * `config.proactivePrompts` — used for the "retomar" reminder when there's an
   * active conversation. Undefined → the configured question teaser (default).
   */
  prompts?: string[]
}
