import { MessageSquareText } from 'lucide-react'
import { ConversationList } from './_components/conversation-list'
import { MessageInput } from './_components/message-input'
import { MessageThread } from './_components/message-thread'
import { getConversation, listConversations } from './_actions/message.actions'

export default async function AgencyOsMessagesPage() {
  const conversationsResult = await listConversations()

  const selectedConversation = conversationsResult.success ? conversationsResult.data[0] : null
  const messagesResult =
    selectedConversation ? await getConversation(selectedConversation.organizationId) : null

  return (
    <section className="flex h-[calc(100dvh_-_228px)] min-h-0 flex-col gap-4 overflow-hidden sm:h-[calc(100dvh_-_200px)]">
      <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
            <MessageSquareText className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              develOP / Comunicación
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white">Mensajes</h1>
          </div>
        </div>
      </div>

      {!conversationsResult.success ? (
        <div className="rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {conversationsResult.error}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-rows-1 gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <ConversationList
            conversations={conversationsResult.data}
            activeOrganizationId={selectedConversation?.organizationId}
          />

          <div className="hidden min-h-0 lg:flex lg:flex-col">
            {selectedConversation && messagesResult?.success ? (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <MessageThread
                  companyName={selectedConversation.companyName}
                  messages={messagesResult.data}
                />
                <MessageInput organizationId={selectedConversation.organizationId} />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-black/10 px-6 text-center text-sm text-white/40">
                Seleccioná una conversación para ver el historial.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
