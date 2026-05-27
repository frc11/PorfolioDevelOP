import { redirect } from 'next/navigation'
import { getClientChatbotSession, listConversationsByOrgSlug } from '@/modules/chatbot/index.server'
import { ConversationsTable } from '@/modules/chatbot/components/dashboards/ConversationsTable'

export const dynamic = 'force-dynamic'

export default async function ChatbotConversationsPage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  const { items, total } = await listConversationsByOrgSlug(session.organization.slug, 100)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Mi Chatbot</p>
        <h2 className="text-xl font-semibold text-zinc-100 mt-0.5">Conversaciones</h2>
        <p className="text-sm text-zinc-500 mt-1">Historial completo de chats con tu asistente</p>
      </div>
      <ConversationsTable conversations={items} totalCount={total} />
    </div>
  )
}
