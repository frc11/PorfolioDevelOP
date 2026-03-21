import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { MessageSquare, Plus } from 'lucide-react'

export default async function MessagesPage() {
  const allClients = await prisma.organization.findMany({
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

      {/* Empty state — no clients at all */}
      {allClients.length === 0 && (
        <div
          className="flex flex-col items-center gap-4 rounded-2xl py-20 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(6,182,212,0.1)' }}
          >
            <MessageSquare size={20} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">No hay clientes registrados.</p>
            <p className="mt-1 text-xs text-zinc-600">
              Creá un cliente desde la sección Clientes para comenzar.
            </p>
          </div>
        </div>
      )}

      {/* Active conversations */}
      {withMessages.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-600">
            Conversaciones ({withMessages.length})
          </p>

          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {withMessages.map((client, i) => {
              const lastMessage = client.messages[0]
              const unread = client._count.messages
              const isLast = i === withMessages.length - 1

              return (
                <Link
                  key={client.id}
                  href={`/admin/messages/${client.id}`}
                  className="relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025]"
                  style={{
                    borderBottom: isLast ? undefined : '1px solid rgba(255,255,255,0.04)',
                    borderLeft: unread > 0 ? '2px solid rgb(34,211,238)' : '2px solid transparent',
                    paddingLeft: unread > 0 ? 'calc(1.25rem - 2px)' : '1.25rem',
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={
                      unread > 0
                        ? { background: 'rgba(6,182,212,0.18)', color: 'rgb(34,211,238)' }
                        : { background: 'rgba(255,255,255,0.07)', color: 'rgb(113,113,122)' }
                    }
                  >
                    {client.companyName[0].toUpperCase()}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`truncate text-sm font-medium ${unread > 0 ? 'text-zinc-100' : 'text-zinc-400'}`}
                      >
                        {client.companyName}
                      </span>
                      {lastMessage && (
                        <span className="flex-shrink-0 text-[11px] tabular-nums text-zinc-600">
                          {new Date(lastMessage.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <p
                        className={`mt-0.5 truncate text-xs ${unread > 0 ? 'text-zinc-400' : 'text-zinc-600'}`}
                      >
                        {lastMessage.fromAdmin && (
                          <span className="text-zinc-500">Tú: </span>
                        )}
                        {lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Unread badge */}
                  {unread > 0 && (
                    <span className="flex h-5 min-w-[1.25rem] flex-shrink-0 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-[10px] font-bold tabular-nums text-zinc-950">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Clients without messages */}
      {withoutMessages.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-600">
            Iniciar conversación ({withoutMessages.length})
          </p>

          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            {withoutMessages.map((client, i) => {
              const isLast = i === withoutMessages.length - 1
              return (
                <Link
                  key={client.id}
                  href={`/admin/messages/${client.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.025]"
                  style={{
                    borderBottom: isLast ? undefined : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgb(113,113,122)' }}
                  >
                    {client.companyName[0].toUpperCase()}
                  </div>

                  <span className="flex-1 truncate text-sm text-zinc-500">
                    {client.companyName}
                  </span>

                  <div className="flex flex-shrink-0 items-center gap-1.5 text-xs text-zinc-600 transition-colors group-hover:text-zinc-400">
                    <Plus size={12} />
                    Nueva
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
