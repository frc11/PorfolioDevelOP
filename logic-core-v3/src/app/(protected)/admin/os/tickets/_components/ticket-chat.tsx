'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MessageSquareText } from 'lucide-react'
import type { TicketStatus } from '@prisma/client'
import { updateTicketStatus } from '../_actions/ticket.actions'
import { TicketReplyForm } from './ticket-reply-form'

type TicketChatProps = {
  ticket: {
    id: string
    title: string
    status: TicketStatus
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'OTHER'
    createdAt: string
    updatedAt: string
    organizationId: string
    organization: {
      id: string
      companyName: string
      slug: string
      logoUrl: string | null
      siteUrl: string | null
      whatsapp: string | null
      createdAt: string
    }
    messages: Array<{
      id: string
      content: string
      createdAt: string
      isAdmin: boolean
      user: {
        name: string | null
        role: 'SUPER_ADMIN' | 'ORG_MEMBER'
      }
    }>
  }
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelto',
}

const STATUS_TONES: Record<TicketStatus, string> = {
  OPEN: 'border-cyan-400/20 bg-cyan-500/10 text-cyan-200',
  IN_PROGRESS: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
  RESOLVED: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
}

function formatMessageDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function TicketChat({ ticket }: TicketChatProps) {
  const router = useRouter()
  const [status, setStatus] = useState<TicketStatus>(ticket.status)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setStatus(ticket.status)
  }, [ticket.status])

  function handleStatusChange(nextStatus: TicketStatus) {
    const previousStatus = status
    setError(null)
    setStatus(nextStatus)

    startTransition(async () => {
      const result = await updateTicketStatus(ticket.id, nextStatus)

      if (!result.success) {
        setStatus(previousStatus)
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Agency OS / Tickets
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{ticket.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-zinc-200">
                {ticket.organization.companyName}
              </span>
              <span>Actualizado {formatMessageDate(ticket.updatedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={status}
                disabled={isPending}
                onChange={(event) => handleStatusChange(event.target.value as TicketStatus)}
                className={[
                  'rounded-2xl border px-4 py-3 text-sm font-medium outline-none transition-colors',
                  STATUS_TONES[status],
                  isPending ? 'cursor-wait opacity-80' : 'cursor-pointer',
                ].join(' ')}
              >
                {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((option) => (
                  <option key={option} value={option} className="bg-[#0d1117] text-zinc-100">
                    {STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
              {isPending ? (
                <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-300" />
              ) : null}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <MessageSquareText className="h-4 w-4 text-cyan-300" />
            <span>{ticket.messages.length} mensajes en la conversación</span>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 py-5">
          {ticket.messages.length > 0 ? (
            ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={[
                    'max-w-[85%] rounded-[24px] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.18)] sm:max-w-[70%]',
                    message.isAdmin
                      ? 'border border-cyan-400/20 bg-cyan-500/10 text-cyan-50'
                      : 'border border-white/10 bg-black/20 text-zinc-100',
                  ].join(' ')}
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                    <span>{message.isAdmin ? 'Admin' : message.user.name ?? 'Cliente'}</span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-500">{formatMessageDate(message.createdAt)}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-zinc-500">
              Todavía no hay mensajes en este ticket.
            </div>
          )}
        </div>
      </div>

      <TicketReplyForm ticketId={ticket.id} />
    </section>
  )
}
