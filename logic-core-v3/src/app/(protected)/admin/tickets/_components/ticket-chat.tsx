'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, Loader2, MessageSquareText, Trash2 } from 'lucide-react'
import type { Role, TicketStatus } from '@prisma/client'
import { Select } from '@/components/ui'
import { updateTicketStatusAction } from '@/lib/tickets/actions'
import { TicketReplyForm } from './ticket-reply-form'
import { HoverScale } from './hover-scale'

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
        role: Role
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

type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type TicketCategory = 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'OTHER'

const PRIORITY_MAP: Record<TicketPriority, { label: string; cls: string; pulse?: boolean }> = {
  LOW: { label: 'Baja', cls: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
  MEDIUM: { label: 'Media', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  HIGH: { label: 'Alta', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  URGENT: { label: 'Urgente', cls: 'text-red-400 bg-red-500/10 border-red-500/20', pulse: true },
}

const CATEGORY_MAP: Record<TicketCategory, string> = {
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Requerimiento',
  OTHER: 'Otro',
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
  const [deletionDismissed, setDeletionDismissed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al último mensaje cuando cambia la cantidad. Incluye el envío:
  // replyToTicketAction revalida y router.refresh() refresca este server
  // component con el mensaje nuevo. Mismo patrón que el chat del cliente
  // (ClientChatThread) y el auto-scroll del admin de Mensajes.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket.messages.length])

  function handleStatusChange(nextStatus: TicketStatus) {
    const previousStatus = status
    setError(null)
    setStatus(nextStatus)

    startTransition(async () => {
      const result = await updateTicketStatusAction(ticket.id, nextStatus)

      if (!result.success) {
        setStatus(previousStatus)
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  const priority = PRIORITY_MAP[ticket.priority]
  // Solo los tickets que genera requestAccountDeletionAction llevan este título exacto.
  const isDeletionRequest = ticket.title === 'Solicitud de eliminación de cuenta'

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs tracking-tight text-zinc-500">
              develOP / Tickets
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{ticket.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-zinc-200">
                {ticket.organization.companyName}
              </span>
              <span
                className={[
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                  priority.cls,
                ].join(' ')}
              >
                {priority.pulse && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                )}
                {priority.label}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-400">
                {CATEGORY_MAP[ticket.category]}
              </span>
              <span>Actualizado {formatMessageDate(ticket.updatedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isPending ? (
              <Loader2
                className="h-4 w-4 animate-spin text-zinc-300"
                strokeWidth={1.5}
                aria-label="Actualizando estado"
              />
            ) : null}
            <Select
              value={status}
              disabled={isPending}
              onChange={(event) => handleStatusChange(event.target.value as TicketStatus)}
              options={(Object.keys(STATUS_LABELS) as TicketStatus[]).map((option) => ({
                value: option,
                label: STATUS_LABELS[option],
              }))}
              aria-label="Cambiar estado del ticket"
              className={`min-w-[168px] rounded-2xl ${STATUS_TONES[status]}`}
            />
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="shrink-0 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <MessageSquareText className="h-4 w-4 text-cyan-300" />
            <span>{ticket.messages.length} mensajes en la conversación</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {ticket.messages.length > 0 ? (
            ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
              >
                <HoverScale
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
                </HoverScale>
              </div>
            ))
          ) : (
            <div className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-zinc-500">
              Todavía no hay mensajes en este ticket.
            </div>
          )}

          {/* Ancla de auto-scroll al fondo */}
          <div ref={bottomRef} />
        </div>
      </div>

      {isDeletionRequest && !deletionDismissed ? (
        <div className="shrink-0 rounded-[28px] border border-red-500/30 bg-red-500/[0.06] p-5 backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" strokeWidth={1.5} />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-200">
                ¿Aprobar solicitud de eliminación?
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                El cliente{' '}
                <span className="font-medium text-zinc-200">
                  {ticket.organization.companyName}
                </span>{' '}
                solicitó eliminar su cuenta y todos los datos asociados. «Ir a borrar» te lleva
                al borrado definitivo (con confirmación tipeada); no elimina nada por sí solo.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={`/admin/clients?delete=${ticket.organizationId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  Ir a borrar
                </Link>
                <button
                  type="button"
                  onClick={() => setDeletionDismissed(true)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <TicketReplyForm ticketId={ticket.id} />
    </section>
  )
}
