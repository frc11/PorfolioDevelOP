import { redirect } from 'next/navigation'
import { getClientChatbotSession, listConversationsByOrgSlug } from '@/modules/chatbot/index.server'
import { ConversationsTable } from '@/modules/chatbot/components/dashboards/ConversationsTable'

export const dynamic = 'force-dynamic'

export default async function ChatbotConversationsPage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  const { items, total } = await listConversationsByOrgSlug(session.organization.slug, 100)

  return <ConversationsTable conversations={items} totalCount={total} />
}
