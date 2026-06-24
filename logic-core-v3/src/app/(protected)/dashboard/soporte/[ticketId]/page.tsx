import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Hash,
  MessageSquare,
  MessageSquareText,
  Shield,
  Tag,
} from 'lucide-react'
import Link from 'next/link'
import { TicketReplyForm } from '@/components/dashboard/TicketReplyForm'
import { ClientChatThread, type ChatMessage } from '@/components/dashboard/ClientChatThread'
import { TicketStatusSelector } from '@/components/dashboard/TicketStatusSelector'
import { ResolveTicketButton } from '@/components/dashboard/ResolveTicketButton'

const CATEGORY_MAP: Record<string, string> = {
  TECHNICAL: 'Soporte Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Nuevo Requerimiento',
  OTHER: 'Otro',
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  OPEN: { label: 'Abierto', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  IN_PROGRESS: { label: 'En Progreso', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  RESOLVED: { label: 'Resuelto', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
}

const PRIORITY_MAP: Record<string, { label: string; cls: string; pulse?: boolean }> = {
  LOW: { label: 'Baja', cls: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20' },
  MEDIUM: { label: 'Media', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  HIGH: { label: 'Alta', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  URGENT: { label: 'Urgente', cls: 'text-red-400 bg-red-500/10 border-red-500/20', pulse: true },
}

function fmtShort(d: Date) {
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = await params
  const session = await auth()
  const organizationId = await resolveOrgId()

  if (!session?.user?.id || !organizationId) redirect('/login')

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN'

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId, organizationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true, role: true } } },
      },
    },
  })

  if (!ticket) redirect('/dashboard/soporte')

  const firstAdminMsg = ticket.messages.find((m) => m.isAdmin)
  const timeline = [
    {
      label: 'Ticket creado',
      time: fmtShort(ticket.createdAt),
      done: true,
      active: ticket.status === 'OPEN' && !firstAdminMsg,
    },
    {
      label: 'Primera respuesta',
      time: firstAdminMsg ? fmtShort(firstAdminMsg.createdAt) : null,
      done: !!firstAdminMsg,
      active: !!firstAdminMsg && ticket.status === 'IN_PROGRESS',
    },
    {
      label: 'En progreso',
      time: firstAdminMsg ? fmtShort(firstAdminMsg.createdAt) : null,
      done: ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED',
      active: ticket.status === 'IN_PROGRESS',
    },
    {
      label: 'Resuelto',
      time: ticket.status === 'RESOLVED' ? fmtShort(ticket.updatedAt) : null,
      done: ticket.status === 'RESOLVED',
      active: ticket.status === 'RESOLVED',
    },
  ]

  const priority = PRIORITY_MAP[ticket.priority] ?? PRIORITY_MAP.MEDIUM
  const status = STATUS_MAP[ticket.status] ?? STATUS_MAP.OPEN

  // Mapeo al molde compartido (mismo que Mensajes). Datos del Ticket
  // (tabla TicketMessage) — NO se mezclan con los de Mensajes.
  // isAdmin → isAgency: develOP a la izquierda, cliente a la derecha.
  const chatMessages: ChatMessage[] = ticket.messages.map((m) => ({
    id: m.id,
    content: m.content,
    isAgency: m.isAdmin,
    authorLabel: m.isAdmin ? 'develOP' : (m.user.name ?? 'Tú'),
    createdAt: m.createdAt,
  }))

  return (
    <div className="flex h-[calc(100svh-14rem)] min-h-0 w-full flex-col gap-5 sm:h-[calc(100svh-12.5rem)]">
      {/* ── Header (info-bar del ticket) ────────────────────── */}
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href="/dashboard/soporte"
          className="w-fit rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="mb-1 truncate text-xl font-bold tracking-tight text-white">
            {ticket.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${priority.cls}`}
            >
              {priority.pulse && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              )}
              {priority.label}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${status.cls}`}
            >
              {status.label}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              {CATEGORY_MAP[ticket.category]} · #{ticket.id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        {isSuperAdmin && (
          <div className="shrink-0">
            <TicketStatusSelector
              ticketId={ticket.id}
              currentStatus={ticket.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'}
            />
          </div>
        )}
      </div>

      {/* ── Main layout ─────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 flex-col gap-5 lg:flex-row">
        {/* Chat area — molde compartido ClientChatThread (mismo que Mensajes) */}
        <ClientChatThread
          messages={chatMessages}
          scrollTrigger={ticket.messages.length}
          subHeader={
            <div className="shrink-0 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <MessageSquareText className="h-4 w-4 text-cyan-300" strokeWidth={1.5} />
                <span>{ticket.messages.length} mensajes en la conversación</span>
              </div>
            </div>
          }
          emptyState={
            <div className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-zinc-500">
              Todavía no hay mensajes en este ticket.
            </div>
          }
          composer={
            ticket.status === 'RESOLVED' ? (
              <div className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/5 py-4 text-emerald-400">
                <CheckCircle2 size={22} className="mb-2 opacity-80" />
                <p className="text-sm font-semibold">Este ticket ha sido marcado como resuelto.</p>
                <p className="mt-1 text-xs text-emerald-500/60">
                  Si el problema persiste, por favor abrí un nuevo ticket.
                </p>
              </div>
            ) : (
              <div className="flex shrink-0 flex-col gap-3">
                <TicketReplyForm ticketId={ticket.id} />
                <div className="flex justify-end">
                  <ResolveTicketButton ticketId={ticket.id} />
                </div>
              </div>
            )
          }
        />

        {/* ── Timeline sidebar ──────────────────────────────── */}
        <div className="flex flex-col min-h-0 shrink-0 overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0e12]/60 p-5 shadow-xl backdrop-blur-xl lg:w-52 xl:w-56">
          <p className="mb-5 flex shrink-0 items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <Clock size={10} />
            Timeline
          </p>

          <div className="flex flex-col">
            {timeline.map((step, idx) => {
              const isLast = idx === timeline.length - 1
              return (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                        step.done
                          ? step.active
                            ? 'border-cyan-500/40 bg-cyan-500/20'
                            : 'border-emerald-500/30 bg-emerald-500/15'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      {step.done ? (
                        step.active ? (
                          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                        ) : (
                          <CheckCircle2 size={11} className="text-emerald-400" />
                        )
                      ) : (
                        <Circle size={9} className="text-zinc-700" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`my-1 min-h-[20px] w-px flex-1 ${
                          step.done ? 'bg-emerald-500/20' : 'bg-white/5'
                        }`}
                      />
                    )}
                  </div>

                  <div className={`${isLast ? 'pb-0' : 'pb-4'}`}>
                    <p
                      className={`text-[11px] font-semibold leading-tight ${
                        step.active
                          ? 'text-cyan-300'
                          : step.done
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.time ? (
                      <p className="mt-0.5 font-mono text-[9px] text-zinc-600">{step.time}</p>
                    ) : (
                      !step.done && (
                        <p className="mt-0.5 text-[9px] italic text-zinc-700">Pendiente</p>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stats */}
          <div className="mt-5 flex flex-col gap-2 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-zinc-600">
                <MessageSquare size={9} />
                Mensajes
              </span>
              <span className="font-mono font-bold text-zinc-400">{ticket.messages.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-zinc-600">
                <Shield size={9} />
                Prioridad
              </span>
              <span
                className={`text-[9px] font-bold uppercase tracking-wide ${priority.cls.split(' ')[0]}`}
              >
                {priority.label}
              </span>
            </div>
          </div>

          {/* Detalles del ticket */}
          <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
            <p className="mb-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
              <Tag size={9} />
              Detalles
            </p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1 text-zinc-600">
                <Hash size={9} />
                ID
              </span>
              <span className="font-mono text-zinc-500">
                #{ticket.id.slice(-6).toUpperCase()}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2 text-[10px]">
              <span className="shrink-0 text-zinc-600">Categoría</span>
              <span className="text-right text-[9px] text-zinc-500">
                {CATEGORY_MAP[ticket.category]}
              </span>
            </div>
            <div className="flex items-start justify-between gap-2 text-[10px]">
              <span className="shrink-0 text-zinc-600">Creado</span>
              <span className="text-right font-mono text-[9px] text-zinc-500">
                {ticket.createdAt.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
