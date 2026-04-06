import Link from 'next/link'
import { MessageCircleMore } from 'lucide-react'
import { EmptyState } from '@/app/(protected)/admin/os/_components/empty-state'

type Conversation = {
  organizationId: string
  companyName: string
  slug: string
  lastMessage: {
    id: string
    content: string
    fromAdmin: boolean
    read: boolean
    createdAt: string
  } | null
  unreadCount: number
  totalMessages: number
}

type ConversationListProps = {
  conversations: Conversation[]
  activeOrganizationId?: string | null
  title?: string
  compact?: boolean
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function ConversationList({
  conversations,
  activeOrganizationId,
  title = 'Conversaciones',
  compact = false,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageCircleMore}
        title="No hay conversaciones activas"
        description="Cuando los clientes escriban desde el portal, sus mensajes aparecerán acá."
      />
    )
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{title}</p>
        <p className="mt-2 text-sm text-zinc-400">
          {conversations.length} conversaciones con historial
        </p>
      </div>

      <div className={compact ? 'max-h-[70vh] overflow-y-auto' : undefined}>
        {conversations.map((conversation, index) => {
          const isActive = activeOrganizationId === conversation.organizationId
          const isLast = index === conversations.length - 1

          return (
            <Link
              key={conversation.organizationId}
              href={`/admin/os/messages/${conversation.organizationId}`}
              className={[
                'group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/5',
                isActive ? 'bg-cyan-500/10' : '',
              ].join(' ')}
              style={{
                borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-sm font-semibold text-zinc-100">
                {conversation.companyName[0]?.toUpperCase() ?? 'C'}
                {conversation.unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-[#081018] bg-cyan-400" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-white">
                    {conversation.companyName}
                  </p>
                  {conversation.lastMessage ? (
                    <span className="shrink-0 text-[11px] text-zinc-500">
                      {formatDate(conversation.lastMessage.createdAt)}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 truncate text-sm text-zinc-400">
                  {conversation.lastMessage ? (
                    <>
                      {conversation.lastMessage.fromAdmin ? 'Admin: ' : ''}
                      {conversation.lastMessage.content}
                    </>
                  ) : (
                    'Todavía no hay mensajes en esta conversación.'
                  )}
                </p>
              </div>

              {conversation.unreadCount > 0 ? (
                <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/15 px-2 py-1 text-[11px] font-semibold text-cyan-100">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
