import { listConversations } from '../_actions/message.actions'
import { ConversationList } from './conversation-list'

/**
 * Carga server-side de las conversaciones para la lista persistente del layout.
 * Va dentro de un <Suspense> en layout.tsx → en el primer load streamea con el
 * skeleton de la lista, sin bloquear el shell ni caer al loading del admin.
 */
export async function ConversationListLoader() {
  const conversationsResult = await listConversations()

  if (!conversationsResult.success) {
    return (
      <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
        {conversationsResult.error}
      </div>
    )
  }

  return <ConversationList conversations={conversationsResult.data} />
}
