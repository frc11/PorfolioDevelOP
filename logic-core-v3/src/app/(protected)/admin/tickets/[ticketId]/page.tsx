import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client'
import { TicketStatusSelect } from '@/components/admin/TicketStatusSelect'
import { TicketReplyForm } from '@/components/admin/TicketReplyForm'
import { MessagesScrollAnchor } from '@/components/admin/MessagesScrollAnchor'
import { markTicketResolvedAction } from '@/lib/actions/tickets'

// ─── Badge helpers ─────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config: Record<TicketPriority, { label: string; bg: string; border: string; color: string }> = {
    LOW: { label: 'Baja', bg: 'rgba(113,113,122,0.12)', border: 'rgba(113,113,122,0.3)', color: 'rgb(161,161,170)' },
    MEDIUM: { label: 'Media', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', color: 'rgb(250,204,21)' },
    HIGH: { label: 'Alta', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', color: 'rgb(251,146,60)' },
    URGENT: { label: 'Urgente', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: 'rgb(252,165,165)' },
  }
  const c = config[priority]
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
    >
      {c.label}
    </span>
  )
}

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Nueva función',
  OTHER: 'Otro',
}

// ─── Date separator ────────────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
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

// ─── Page ──────────────────────────────────────────────────────────────────────

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

  return (
    <div className="flex flex-col gap-0 -m-6 h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div
        className="flex flex-shrink-0 items-start justify-between gap-4 px-5 py-3.5"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(8,10,12,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Left — back + info */}
        <div className="flex min-w-0 flex-col gap-2">
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-1 text-xs text-zinc-600 transition-colors hover:text-zinc-300"
          >
            <ChevronLeft size={13} />
            Tickets
          </Link>

          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="truncate text-base font-semibold text-zinc-100">{ticket.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              {/* Client */}
              <div className="flex items-center gap-1.5">
                <div
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-semibold"
                  style={{ background: 'rgba(6,182,212,0.15)', color: 'rgb(34,211,238)' }}
                >
                  {ticket.organization.companyName[0].toUpperCase()}
                </div>
                <Link
                  href={`/admin/clients/${ticket.organization.id}`}
                  className="text-xs text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  {ticket.organization.companyName}
                </Link>
              </div>

              <span className="text-zinc-800">·</span>

              {/* Category */}
              <span className="text-xs text-zinc-600">{CATEGORY_LABELS[ticket.category]}</span>

              <span className="text-zinc-800">·</span>

              {/* Priority */}
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </div>

        {/* Right — status + resolve */}
        <div className="flex flex-shrink-0 items-center gap-3 pt-5">
          <TicketStatusSelect
            key={ticket.status}
            ticketId={ticket.id}
            currentStatus={ticket.status}
          />

          {!isResolved && (
            <form action={markTicketResolvedAction}>
              <input type="hidden" name="ticketId" value={ticket.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:text-emerald-300"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                <CheckCircle2 size={12} />
                Marcar resuelto
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Messages thread */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {ticket.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: 'rgba(6,182,212,0.08)' }}
            >
              <span className="text-lg font-semibold text-cyan-500/40">
                {ticket.organization.companyName[0].toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-zinc-600">
              Todavía no hay mensajes en este ticket.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {ticket.messages.map((msg, i) => {
              const prevMsg = ticket.messages[i - 1]
              const showSeparator =
                !prevMsg || toDateKey(msg.createdAt) !== toDateKey(prevMsg.createdAt)
              const senderName = msg.isAdmin ? 'Admin' : (msg.user.name ?? ticket.organization.companyName)

              return (
                <div key={msg.id}>
                  {showSeparator && <DateSeparator date={msg.createdAt} />}

                  <div className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'} mt-1`}>
                    <div
                      className={[
                        'max-w-[70%] rounded-2xl px-4 py-2.5',
                        msg.isAdmin ? 'rounded-br-sm' : 'rounded-bl-sm',
                      ].join(' ')}
                      style={
                        msg.isAdmin
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
                        className={`mt-1.5 flex items-center gap-1.5 ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <span className="text-[10px] text-zinc-600">{senderName}</span>
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

            <MessagesScrollAnchor key={ticket.messages.at(-1)?.id ?? 'empty'} />
          </div>
        )}
      </div>

      {/* Reply form */}
      {!isResolved ? (
        <TicketReplyForm ticketId={ticket.id} />
      ) : (
        <div
          className="flex flex-shrink-0 items-center justify-center px-5 py-4"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(8,10,12,0.92)',
          }}
        >
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <CheckCircle2 size={13} className="text-emerald-500/60" />
            Este ticket está resuelto. Cambiá el estado para seguir respondiendo.
          </div>
        </div>
      )}
    </div>
  )
}
