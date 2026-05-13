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
}
