import type { PublicBotConfig } from '../../shared/publicConfig'
import type { NeuroAvatarState } from '../avatar'

/**
 * A message rendered in the chat. The frontend tracks a simpler shape
 * than the API: it doesn't care about tokens/cost/timestamps for rendering.
 */
export interface UIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** Set when the bot invoked a client-side tool in this message. */
  toolCalls?: ToolCallInUIMessage[]
}

export interface ToolCallInUIMessage {
  toolCallId: string
  toolName: string
  input: unknown  // validated client-side by individual renderers
}

export interface ChatWindowProps {
  config: PublicBotConfig
  messages: UIChatMessage[]
  isStreaming: boolean
  avatarState: NeuroAvatarState
  /** Called when user submits a message. */
  onSendMessage: (text: string) => void
  /** Called when user clicks the close (X) button. */
  onClose: () => void
  /** Called when user clicks a quick reply chip. */
  onQuickReply: (text: string) => void
  /** True if quota was exceeded — render degraded mode banner. */
  degradedMode?: boolean
}
