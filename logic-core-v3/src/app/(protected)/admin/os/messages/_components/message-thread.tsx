import { MessageSquareText } from 'lucide-react'
import { MessagesScrollAnchor } from '@/components/admin/MessagesScrollAnchor'

type MessageThreadProps = {
  companyName: string
  messages: Array<{
    id: string
    content: string
    fromAdmin: boolean
    read: boolean
    createdAt: string
    organizationId: string
  }>
}

function formatMessageDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function MessageThread({ companyName, messages }: MessageThreadProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MessageSquareText className="h-4 w-4 text-cyan-300" />
          <span>{messages.length} mensajes en la conversación</span>
        </div>
      </div>

      <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-5">
        {messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.fromAdmin ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={[
                    'max-w-[85%] rounded-[24px] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:max-w-[70%]',
                    message.fromAdmin
                      ? 'border border-cyan-400/20 bg-cyan-500/10 text-cyan-50'
                      : 'border border-white/10 bg-black/20 text-zinc-100',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                    <span>{message.fromAdmin ? 'Admin' : companyName}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">{formatMessageDate(message.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                </div>
              </div>
            ))}
            <MessagesScrollAnchor />
          </>
        ) : (
          <div className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-zinc-500">
            Todavía no hay mensajes en esta conversación.
          </div>
        )}
      </div>
    </section>
  )
}
