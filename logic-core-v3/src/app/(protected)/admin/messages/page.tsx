import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MessageSquare, Plus } from 'lucide-react'

export default async function MessagesPage() {
  // Fetch ALL clients — not just those with messages
  const allClients = await prisma.client.findMany({
    include: {
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
    orderBy: { companyName: 'asc' },
  })

  const withMessages = allClients
    .filter((c) => c.messages.length > 0)
    .sort((a, b) => {
      const aDate = a.messages[0]?.createdAt ?? new Date(0)
      const bDate = b.messages[0]?.createdAt ?? new Date(0)
      return bDate.getTime() - aDate.getTime()
    })

  const withoutMessages = allClients.filter((c) => c.messages.length === 0)

  const totalUnread = withMessages.reduce((sum, c) => sum + c._count.messages, 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
          Comunicación
        </p>
        <h1 className="text-xl font-bold text-zinc-100">Mensajes</h1>
        <p className="mt-0.5 text-sm text-zinc-600">
          {totalUnread > 0
            ? `${totalUnread} mensaje${totalUnread !== 1 ? 's' : ''} sin leer`
            : 'Todas las conversaciones al día'}
        </p>
      </div>

      {/* Active conversations */}
      {withMessages.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-600">
            Conversaciones ({withMessages.length})
          </p>
          <ul className="flex flex-col gap-1">
            {withMessages.map((client) => {
              const lastMessage = client.messages[0]
              const unread = client._count.messages

              return (
                <li key={client.id}>
                  <Link
                    href={`/admin/messages/${client.id}`}
                    className="flex items-center gap-4 rounded-xl px-4 py-3.5 transition-all"
                    style={
                      unread > 0
                        ? {
                            border: '1px solid rgba(6,182,212,0.2)',
                            background: 'rgba(6,182,212,0.05)',
                          }
                        : {
                            border: '1px solid rgba(255,255,255,0.06)',
                            background: 'rgba(255,255,255,0.02)',
                          }
                    }
                  >
                    {/* Avatar */}
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                      style={
                        unread > 0
                          ? { background: 'rgba(6,182,212,0.15)', color: 'rgb(34,211,238)' }
                          : { background: 'rgba(255,255,255,0.06)', color: 'rgb(113,113,122)' }
                      }
                    >
                      {client.companyName[0].toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={[
                            'truncate text-sm font-medium',
                            unread > 0 ? 'text-zinc-100' : 'text-zinc-400',
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
        </div>
      )}

      {/* Clients without messages — start new conversation */}
      {withoutMessages.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-600">
            Iniciar conversación ({withoutMessages.length})
          </p>
          <ul className="flex flex-col gap-1">
            {withoutMessages.map((client) => (
              <li key={client.id}>
                <Link
                  href={`/admin/messages/${client.id}`}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:bg-white/[0.03]"
                  style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgb(113,113,122)' }}
                  >
                    {client.companyName[0].toUpperCase()}
                  </div>
                  <span className="flex-1 truncate text-sm text-zinc-500">
                    {client.companyName}
                  </span>
                  <div className="flex flex-shrink-0 items-center gap-1 text-xs text-zinc-600">
                    <Plus size={12} />
                    Nueva conversación
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty state — no clients at all */}
      {allClients.length === 0 && (
        <div
          className="flex flex-col items-center gap-3 rounded-xl py-16 text-center"
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <MessageSquare size={32} className="text-zinc-700" />
          <p className="text-sm text-zinc-500">No hay clientes registrados.</p>
          <p className="text-xs text-zinc-700">
            Creá un cliente desde la sección Clientes para comenzar.
          </p>
        </div>
      )}
    </div>
  )
}
