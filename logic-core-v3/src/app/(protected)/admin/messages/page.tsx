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
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
            <MessageSquareText className="h-7 w-7" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Comunicacion
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Mensajes</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Inbox centralizado para conversar con clientes del portal y responder sin salir de Agency OS.
            </p>
          </div>
        </div>
      </div>

      {!conversationsResult.success ? (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
          {conversationsResult.error}
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <ConversationList conversations={conversationsResult.data} activeOrganizationId={selectedConversation?.organizationId} compact />

          <div className="hidden lg:block">
            {selectedConversation && messagesResult?.success ? (
              <div className="space-y-5">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    Conversacion seleccionada
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    {selectedConversation.companyName}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Preview de la conversación más reciente. En mobile podés abrirla en la vista dedicada.
                  </p>
                </div>

                <MessageThread
                  companyName={selectedConversation.companyName}
                  messages={messagesResult.data}
                />
                <MessageInput organizationId={selectedConversation.organizationId} />
              </div>
            ) : (
              <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-black/10 px-6 py-10 text-center text-sm text-white/40">
                Seleccioná una conversación para ver el historial en desktop.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
