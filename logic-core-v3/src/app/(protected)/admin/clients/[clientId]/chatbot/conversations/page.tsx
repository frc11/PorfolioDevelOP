import { notFound } from 'next/navigation'
import { listConversationsByOrgSlug } from '@/modules/chatbot/index.server'
import { ConversationsTable } from '@/modules/chatbot/components/dashboards/ConversationsTable'

export default async function ChatbotConversations({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const orgSlug = clientId
  const conversations = await listConversationsByOrgSlug(orgSlug, 100)

  if (!conversations) notFound()

  return <ConversationsTable conversations={conversations} />
}
