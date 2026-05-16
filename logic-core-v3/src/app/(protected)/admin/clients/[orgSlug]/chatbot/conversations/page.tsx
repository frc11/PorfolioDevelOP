import { notFound } from 'next/navigation'
import { listConversationsByOrgSlug } from '@/modules/chatbot/index.server'
import { ConversationsTable } from '@/modules/chatbot/components/dashboards/ConversationsTable'

export default async function ChatbotConversations({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const conversations = await listConversationsByOrgSlug(orgSlug, 100)

  if (!conversations) notFound()

  return <ConversationsTable conversations={conversations} />
}
