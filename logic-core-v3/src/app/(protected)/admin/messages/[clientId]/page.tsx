import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { SendMessageForm } from '@/components/admin/SendMessageForm'
import { MessagesScrollAnchor } from '@/components/admin/MessagesScrollAnchor'

// ─── Date separator helper ────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10) // "YYYY-MM-DD"
}

function formatSeparatorDate(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (toDateKey(date) === toDateKey(today)) return 'Hoy'
  if (toDateKey(date) === toDateKey(yesterday)) return 'Ayer'

  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

function DateSeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-zinc-600">
        {formatSeparatorDate(date)}
      </span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId: organizationId } = await params

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      members: {
        where: { role: 'ADMIN' },
        select: { user: { select: { name: true } } },
        take: 1,
      },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!org) notFound()

  // Mark client messages as read on page load (non-critical, swallow errors)
  try {
    await prisma.message.updateMany({
      where: { organizationId, fromAdmin: false, read: false },
      data: { read: true },
    })
  } catch {
    // non-critical — page still loads
  }

  const adminUser = org.members[0]?.user
  const messages = org.messages

  return (
    <div className="flex flex-col gap-0 -m-6 h-[calc(100vh-3.5rem)]">
      {/* Conversation header */}
      <div
        className="flex flex-shrink-0 items-center justify-between px-5 py-3.5"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(8,10,12,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
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
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: 'rgba(6,182,212,0.15)', color: 'rgb(34,211,238)' }}
            >
              {org.companyName[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight text-zinc-100">
                {org.companyName}
              </p>
              {adminUser?.name && (
                <p className="text-[10px] leading-tight text-zinc-600">{adminUser.name}</p>
              )}
            </div>
          </div>
        </div>

        <Link
          href={`/admin/clients/${organizationId}`}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-zinc-500 transition-all hover:text-zinc-200"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ExternalLink size={11} />
          Ver cliente
        </Link>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(6,182,212,0.08)' }}
            >
              <span className="text-lg font-semibold text-cyan-500/40">
                {org.companyName[0].toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-zinc-600">
              Todavía no hay mensajes. Enviá el primero abajo.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {messages.map((msg, i) => {
              const prevMsg = messages[i - 1]
              const showSeparator =
                !prevMsg || toDateKey(msg.createdAt) !== toDateKey(prevMsg.createdAt)

              return (
                <div key={msg.id}>
                  {showSeparator && <DateSeparator date={msg.createdAt} />}

                  <div
                    className={`flex ${msg.fromAdmin ? 'justify-end' : 'justify-start'} mt-1`}
                  >
                    <div
                      className={[
                        'max-w-[70%] rounded-2xl px-4 py-2.5',
                        msg.fromAdmin ? 'rounded-br-sm' : 'rounded-bl-sm',
                      ].join(' ')}
                      style={
                        msg.fromAdmin
                          ? {
                              background:
                                'linear-gradient(135deg, rgba(6,182,212,0.22) 0%, rgba(16,185,129,0.14) 100%)',
                              border: '1px solid rgba(6,182,212,0.22)',
                              color: 'rgba(236,254,255,0.92)',
                            }
                          : {
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: 'rgba(212,212,216,0.9)',
                            }
                      }
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <div
                        className={`mt-1.5 flex items-center gap-1.5 ${msg.fromAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <span className="text-[10px] text-zinc-600">
                          {msg.fromAdmin ? 'Admin' : org.companyName}
                        </span>
                        <span className="text-[10px] text-zinc-700">·</span>
                        <span className="text-[10px] tabular-nums text-zinc-600">
                          {new Date(msg.createdAt).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <MessagesScrollAnchor key={messages.at(-1)?.id ?? 'empty'} />
          </div>
        )}
      </div>

      {/* Send form */}
      <SendMessageForm organizationId={organizationId} />
    </div>
  )
}
