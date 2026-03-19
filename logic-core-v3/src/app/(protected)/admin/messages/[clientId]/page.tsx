import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { SendMessageForm } from '@/components/admin/SendMessageForm'
import { MessagesScrollAnchor } from '@/components/admin/MessagesScrollAnchor'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      user: { select: { name: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!client) notFound()

  // Mark client messages as read on page load
  await prisma.message.updateMany({
    where: { clientId, fromAdmin: false, read: false },
    data: { read: true },
  })

  const messages = client.messages

  return (
    <div className="flex flex-col gap-0 -m-6 h-[calc(100vh-3.5rem)]">
      {/* Conversation header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(8,10,12,0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/admin/messages"
            className="inline-flex items-center gap-1 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
          >
            <ChevronLeft size={13} />
            Bandeja
          </Link>
          <span className="text-zinc-800">/</span>
          <div>
            <p className="text-sm font-semibold text-zinc-100">{client.companyName}</p>
            {client.user.name && (
              <p className="text-[10px] text-zinc-600">{client.user.name}</p>
            )}
          </div>
        </div>
        <Link
          href={`/admin/clients/${clientId}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-all hover:text-zinc-200"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ExternalLink size={11} />
          Ver cliente
        </Link>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-700">
              Todavía no hay mensajes. Enviá el primero abajo.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={[
                  'flex',
                  msg.fromAdmin ? 'justify-end' : 'justify-start',
                ].join(' ')}
              >
                <div
                  className={[
                    'max-w-[70%] rounded-2xl px-4 py-2.5',
                    msg.fromAdmin ? 'rounded-br-sm' : 'rounded-bl-sm',
                  ].join(' ')}
                  style={
                    msg.fromAdmin
                      ? {
                          background: 'linear-gradient(135deg, rgba(6,182,212,0.25) 0%, rgba(16,185,129,0.15) 100%)',
                          border: '1px solid rgba(6,182,212,0.2)',
                          color: 'rgba(236,254,255,0.9)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: 'rgba(228,228,231,0.9)',
                        }
                  }
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div
                    className={[
                      'mt-1 flex items-center gap-1.5',
                      msg.fromAdmin ? 'justify-end' : 'justify-start',
                    ].join(' ')}
                  >
                    <span className="text-[10px] text-zinc-600">
                      {msg.fromAdmin ? 'Admin' : client.companyName}
                    </span>
                    <span className="text-[10px] text-zinc-700">·</span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(msg.createdAt).toLocaleString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {/* Scroll anchor — key changes when new message arrives, triggering scroll */}
            <MessagesScrollAnchor key={messages.at(-1)?.id ?? 'empty'} />
          </div>
        )}
      </div>

      {/* Send form */}
      <SendMessageForm clientId={clientId} />
    </div>
  )
}
