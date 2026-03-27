import { TicketCategory, TicketPriority } from '@prisma/client'
import { CheckCircle2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MessagesScrollAnchor } from '@/components/admin/MessagesScrollAnchor'
import { TicketReplyForm } from '@/components/admin/TicketReplyForm'
import { TicketStatusSelect } from '@/components/admin/TicketStatusSelect'
import { AdminStatusBadge, AdminSurface } from '@/components/admin/admin-ui'
import { markTicketResolvedAction } from '@/lib/actions/tickets'
import { prisma } from '@/lib/prisma'

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Nueva función',
  OTHER: 'Otro',
}

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatSeparatorDate(date: Date) {
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

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      organization: { select: { companyName: true, id: true } },
      user: { select: { name: true, email: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { name: true } },
        },
      },
    },
  })

  if (!ticket) notFound()

  const isResolved = ticket.status === 'RESOLVED'
  const markResolved = async (formData: FormData) => {
    'use server'
    await markTicketResolvedAction(formData)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/admin/tickets" className="mb-3 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300">
            <ChevronLeft size={14} />
            Volver a tickets
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/75">Ticket</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{ticket.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link href={`/admin/clients/${ticket.organization.id}`} className="text-sm text-zinc-500 transition-colors hover:text-cyan-300">
              {ticket.organization.companyName}
            </Link>
            <AdminStatusBadge label={CATEGORY_LABELS[ticket.category]} tone="muted" />
            <AdminStatusBadge
              label={PRIORITY_LABELS[ticket.priority]}
              tone={ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'urgent' : ticket.priority === 'MEDIUM' ? 'warning' : 'muted'}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <TicketStatusSelect key={ticket.status} ticketId={ticket.id} currentStatus={ticket.status} />
          {!isResolved ? (
            <form action={markResolved}>
              <input type="hidden" name="ticketId" value={ticket.id} />
              <button type="submit" className="admin-btn-secondary inline-flex items-center gap-2 text-emerald-200">
                <CheckCircle2 size={13} />
                Marcar resuelto
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <AdminSurface className="overflow-hidden p-0">
        <div className="border-b border-white/8 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span>{ticket.user.name ?? ticket.organization.companyName}</span>
            <span>·</span>
            <span>{ticket.user.email}</span>
          </div>
        </div>

        <div className="chat-messages-area max-h-[60vh] overflow-y-auto px-4 py-5 sm:px-6">
          {ticket.messages.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <p className="text-sm text-zinc-500">Todavía no hay mensajes en este ticket.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ticket.messages.map((msg, i) => {
                const prevMsg = ticket.messages[i - 1]
                const showSeparator = !prevMsg || toDateKey(msg.createdAt) !== toDateKey(prevMsg.createdAt)
                const senderName = msg.isAdmin ? 'Admin' : (msg.user.name ?? ticket.organization.companyName)

                return (
                  <div key={msg.id}>
                    {showSeparator ? (
                      <div className="flex items-center gap-3 py-3">
                        <div className="h-px flex-1 bg-white/8" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
                          {formatSeparatorDate(msg.createdAt)}
                        </span>
                        <div className="h-px flex-1 bg-white/8" />
                      </div>
                    ) : null}

                    <div className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[82%] rounded-[24px] px-4 py-3 sm:max-w-[70%] ${msg.isAdmin ? 'rounded-br-md' : 'rounded-bl-md'}`}
                        style={
                          msg.isAdmin
                            ? {
                                background: 'linear-gradient(135deg, rgba(6,182,212,0.22), rgba(16,185,129,0.14))',
                                border: '1px solid rgba(6,182,212,0.22)',
                              }
                            : {
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }
                        }
                      >
                        <p className="text-sm leading-7 text-zinc-100">{msg.content}</p>
                        <div className={`mt-2 flex items-center gap-2 text-[10px] text-zinc-500 ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <span>{senderName}</span>
                          <span>·</span>
                          <span>
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
              <MessagesScrollAnchor key={ticket.messages.at(-1)?.id ?? 'empty'} />
            </div>
          )}
        </div>

        {!isResolved ? (
          <TicketReplyForm ticketId={ticket.id} />
        ) : (
          <div className="border-t border-white/8 px-5 py-4 text-center text-xs text-zinc-500">
            Este ticket está resuelto. Cambiá el estado para seguir respondiendo.
          </div>
        )}
      </AdminSurface>
    </div>
  )
}
