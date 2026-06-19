import { MessageSquareText } from 'lucide-react'
import { MessagesScrollAnchor } from '@/components/admin/MessagesScrollAnchor'
import { MessageBubble } from './message-bubble'

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

export function MessageThread({ companyName, messages }: MessageThreadProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MessageSquareText className="h-4 w-4 text-cyan-300" />
          <span>{messages.length} mensajes en la conversación</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length > 0 ? (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                fromAdmin={message.fromAdmin}
                companyName={companyName}
                content={message.content}
                createdAt={message.createdAt}
              />
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
