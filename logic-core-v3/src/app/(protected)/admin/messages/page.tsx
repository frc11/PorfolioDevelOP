import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

export default async function MessagesPage() {
  const clients = await prisma.client.findMany({
    where: { messages: { some: {} } },
    include: {
      user: { select: { name: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: {
          messages: { where: { fromAdmin: false, read: false } },
        },
      },
    },
  })

  // Sort by last message date descending
  clients.sort((a, b) => {
    const aDate = a.messages[0]?.createdAt ?? new Date(0)
    const bDate = b.messages[0]?.createdAt ?? new Date(0)
    return bDate.getTime() - aDate.getTime()
  })

  const totalUnread = clients.reduce((sum, c) => sum + c._count.messages, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Mensajes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {totalUnread > 0
            ? `${totalUnread} mensaje${totalUnread !== 1 ? 's' : ''} sin leer`
            : 'Todas las conversaciones al día'}
        </p>
      </div>

      {/* Conversation list */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 py-16 text-center">
          <MessageSquare size={32} className="text-zinc-700" />
          <p className="text-sm text-zinc-500">Todavía no hay mensajes registrados.</p>
          <p className="text-xs text-zinc-600">
            Los mensajes aparecen desde el detalle de cada cliente.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {clients.map((client) => {
            const lastMessage = client.messages[0]
            const unread = client._count.messages

            return (
              <li key={client.id}>
                <Link
                  href={`/admin/messages/${client.id}`}
                  className={[
                    'flex items-center gap-4 rounded-lg border px-4 py-3.5 transition-colors hover:border-zinc-700 hover:bg-zinc-800/50',
                    unread > 0
                      ? 'border-cyan-500/20 bg-cyan-500/5'
                      : 'border-zinc-800 bg-zinc-900',
                  ].join(' ')}
                >
                  {/* Avatar */}
                  <div
                    className={[
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      unread > 0
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-zinc-800 text-zinc-400',
                    ].join(' ')}
                  >
                    {client.companyName[0].toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={[
                          'truncate text-sm font-medium',
                          unread > 0 ? 'text-zinc-100' : 'text-zinc-300',
                        ].join(' ')}
                      >
                        {client.companyName}
                      </span>
                      {lastMessage && (
                        <span className="flex-shrink-0 text-xs text-zinc-600">
                          {new Date(lastMessage.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p
                        className={[
                          'mt-0.5 truncate text-xs',
                          unread > 0 ? 'text-zinc-400' : 'text-zinc-600',
                        ].join(' ')}
                      >
                        {lastMessage.fromAdmin ? 'Tú: ' : ''}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Unread badge */}
                  {unread > 0 && (
                    <span className="flex h-5 min-w-[1.25rem] flex-shrink-0 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-semibold text-zinc-950">
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
