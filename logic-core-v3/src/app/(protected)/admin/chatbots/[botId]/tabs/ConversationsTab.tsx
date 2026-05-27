'use client'

import { ConversationsTable } from '@/modules/chatbot/components/dashboards/ConversationsTable'
import type { ConversationItem } from '../BotDetailClient'

interface Props {
  conversations: ConversationItem[]
  totalCount: number
}

export function ConversationsTab({ conversations, totalCount }: Props) {
  return <ConversationsTable conversations={conversations} totalCount={totalCount} />
}
