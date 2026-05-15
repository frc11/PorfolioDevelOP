import { notFound } from 'next/navigation'
import {
  getBotByOrgSlug,
  listConversationsByOrgSlug,
} from '@/modules/chatbot/index.server'
import { ConversationsTable } from '@/modules/chatbot'

export default async function ChatbotConversationsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const data = await getBotByOrgSlug(orgSlug)
  if (!data) notFound()

  const conversations = await listConversationsByOrgSlug(orgSlug, 50)
  return <ConversationsTable conversations={conversations} />
}
