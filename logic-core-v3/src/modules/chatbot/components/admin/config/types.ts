import type { BotConfigInput } from '@/modules/chatbot/server/admin/saveBotConfig'

export type BotConfigEditorState = BotConfigInput

export type BotConfigUpdate = <K extends keyof BotConfigEditorState>(
  key: K,
  value: BotConfigEditorState[K],
) => void

export interface BotConfigTabProps {
  state: BotConfigEditorState
  update: BotConfigUpdate
}

export type QuickReplyItem = BotConfigEditorState['quickReplies'][number]
