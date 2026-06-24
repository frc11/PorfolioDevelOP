import { redirect } from 'next/navigation'
import { getClientChatbotSession, listConversationsByOrgSlug } from '@/modules/chatbot/index.server'
import { ConversationsTable } from '@/modules/chatbot/components/dashboards/ConversationsTable'
import { getClientConversationTranscriptAction } from './transcript-action'

export const dynamic = 'force-dynamic'

export default async function ChatbotConversationsPage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  const { items, total } = await listConversationsByOrgSlug(session.organization.slug, 100)

  // Transcript expandible inline (opt-in de ConversationsTable). La action es
  // client-scoped: deriva el org de la sesión → no se puede leer otra org.
  return (
    <ConversationsTable
      conversations={items}
      totalCount={total}
      expandable
      fetchTranscript={getClientConversationTranscriptAction}
    />
  )
}
