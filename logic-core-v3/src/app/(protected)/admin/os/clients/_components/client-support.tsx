import Link from 'next/link'
import type { TicketStatus } from '@prisma/client'
import { LifeBuoy, MessageCircle } from 'lucide-react'

type ClientTicket = {
  id: string
  title: string
  status: TicketStatus
  category: string
  priority: string
  createdAt: Date
}

type ClientMessage = {
  id: string
  content: string
  fromAdmin: boolean
  read: boolean
  createdAt: Date
}

type ClientSupportProps = {
  organizationId: string
  tickets: ClientTicket[]
  messages: ClientMessage[]
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

function getTicketTone(status: TicketStatus) {
  switch (status) {
    case 'OPEN':
      return 'border-rose-400/20 bg-rose-500/10 text-rose-200'
    case 'IN_PROGRESS':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    case 'RESOLVED':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
  }
}

function getTicketLabel(status: TicketStatus) {
  switch (status) {
    case 'OPEN':
      return 'Abierto'
    case 'IN_PROGRESS':
      return 'En progreso'
    case 'RESOLVED':
      return 'Resuelto'
  }
}

export function ClientSupport({
  organizationId,
  tickets,
  messages,
}: ClientSupportProps) {
  const ticketsHref = `/admin/os/tickets?organizationId=${organizationId}`
  const messagesHref = `/admin/os/messages?organizationId=${organizationId}`

  return (
    <section id="support" className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Soporte
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Tickets y mensajes recientes
          </h2>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-cyan-300" />
                <p className="text-sm font-medium text-white">Ultimos 10 tickets</p>
              </div>
              <Link
                href={ticketsHref}
                className="text-xs uppercase tracking-[0.22em] text-cyan-200 transition-colors hover:text-cyan-100"
              >
                Ver todos
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {tickets.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-white/10 bg-black/10 px-4 py-6 text-sm text-zinc-500">
                  Sin tickets recientes para este cliente.
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="rounded-[20px] border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{ticket.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {ticket.category} · {ticket.priority}
                        </p>
                      </div>
                      <span
                        className={[
                          'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                          getTicketTone(ticket.status),
                        ].join(' ')}
                      >
                        {getTicketLabel(ticket.status)}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-zinc-500">
                      Creado {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-cyan-300" />
                <p className="text-sm font-medium text-white">Ultimos 10 mensajes</p>
              </div>
              <Link
                href={messagesHref}
                className="text-xs uppercase tracking-[0.22em] text-cyan-200 transition-colors hover:text-cyan-100"
              >
                Ver todos
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {messages.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-white/10 bg-black/10 px-4 py-6 text-sm text-zinc-500">
                  Sin mensajes recientes para este cliente.
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-[20px] border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <span
                        className={[
                          'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                          message.fromAdmin
                            ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
                            : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
                        ].join(' ')}
                      >
                        {message.fromAdmin ? 'Admin → cliente' : 'Cliente → admin'}
                      </span>

                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        {!message.read ? (
                          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-amber-200">
                            No leido
                          </span>
                        ) : null}
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-zinc-400">
                      {message.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
