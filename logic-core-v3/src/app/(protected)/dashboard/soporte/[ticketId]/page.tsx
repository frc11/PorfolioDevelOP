import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  Shield,
  Circle,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { TicketReplyForm } from '@/components/dashboard/TicketReplyForm'
import { AnimatedChatBubble } from '@/components/dashboard/AnimatedChatBubble'
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

function fmtDate(d: Date) {
  return d.toLocaleString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  })
}

function fmtShort(d: Date) {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
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
        include: { user: { select: { name: true, image: true, role: true } } },
      },
    },
  })

  if (!ticket) redirect('/dashboard/soporte')

  // Derive timeline
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

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full gap-5">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link
          href="/dashboard/soporte"
          className="p-2 w-fit bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight truncate">{ticket.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority */}
            <span
              className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${priority.cls}`}
            >
              {priority.pulse && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
              {priority.label}
            </span>
            {/* Status */}
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${status.cls}`}
            >
              {status.label}
            </span>
            {/* Category + ID */}
            <span className="text-xs text-zinc-500 font-mono">
              {CATEGORY_MAP[ticket.category]} · #{ticket.id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Admin-only inline status selector */}
        {isSuperAdmin && (
          <div className="shrink-0">
            <TicketStatusSelector
              ticketId={ticket.id}
              currentStatus={ticket.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'}
            />
          </div>
        )}
      </div>

      {/* ── Main layout: chat + timeline ────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 lg:items-start">

        {/* Chat area */}
        <div className="flex flex-col flex-1 border border-white/10 bg-[#0c0e12]/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl min-h-[500px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {ticket.messages.map((message) => {
              const isAgency = message.isAdmin
              const initials = (message.user.name ?? 'C').charAt(0).toUpperCase()

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isAgency ? '' : 'flex-row-reverse'}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 self-end">
                    {isAgency ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/20 bg-[#030a14] flex items-center justify-center">
                        <Image
                          src="/logodevelOP.png"
                          alt="develOP"
                          width={28}
                          height={28}
                          className="object-contain p-0.5"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[11px] font-black text-white">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className={`flex flex-col max-w-[82%] sm:max-w-[72%] ${
                      isAgency ? 'items-start' : 'items-end'
                    }`}
                  >
                    {/* Meta */}
                    <div
                      className={`flex items-center gap-2 mb-1.5 ${
                        isAgency ? '' : 'flex-row-reverse'
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold ${
                          isAgency ? 'text-cyan-400' : 'text-zinc-400'
                        }`}
                      >
                        {isAgency ? 'develOP Operations' : message.user.name || 'Cliente'}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-mono">
                        {fmtDate(message.createdAt)}
                      </span>
                    </div>

                    {/* Bubble */}
                    <AnimatedChatBubble
                      isAgency={isAgency}
                      className={`px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                        isAgency
                          ? 'bg-gradient-to-br from-[#0a192f] to-[#04111d] border border-cyan-500/25 text-cyan-50 rounded-tl-sm shadow-[0_4px_20px_rgba(6,182,212,0.1)]'
                          : 'bg-[#181a1f] border border-white/5 text-zinc-300 rounded-tr-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
                      }`}
                    >
                      {message.content}
                    </AnimatedChatBubble>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Input area */}
          <div className="p-4 sm:p-6 border-t border-white/5 bg-[#0a0c0f]">
            {ticket.status === 'RESOLVED' ? (
              <div className="flex flex-col items-center justify-center py-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={22} className="mb-2 opacity-80" />
                <p className="text-sm font-semibold">Este ticket ha sido marcado como resuelto.</p>
                <p className="text-xs text-emerald-500/60 mt-1">
                  Si el problema persiste, por favor abrí un nuevo ticket.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <TicketReplyForm ticketId={ticket.id} />
                <div className="flex justify-end">
                  <ResolveTicketButton ticketId={ticket.id} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Timeline sidebar ──────────────────────────────── */}
        <div className="lg:w-52 xl:w-56 shrink-0 border border-white/10 bg-[#0c0e12]/60 backdrop-blur-xl rounded-2xl p-5 shadow-xl">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-5 flex items-center gap-1.5">
            <Clock size={10} />
            Timeline
          </p>

          <div className="flex flex-col">
            {timeline.map((step, idx) => {
              const isLast = idx === timeline.length - 1
              return (
                <div key={step.label} className="flex gap-3">
                  {/* Line + dot column */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        step.done
                          ? step.active
                            ? 'bg-cyan-500/20 border-cyan-500/40'
                            : 'bg-emerald-500/15 border-emerald-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {step.done ? (
                        step.active ? (
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        ) : (
                          <CheckCircle2 size={11} className="text-emerald-400" />
                        )
                      ) : (
                        <Circle size={9} className="text-zinc-700" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-px flex-1 my-1 min-h-[20px] ${
                          step.done ? 'bg-emerald-500/20' : 'bg-white/5'
                        }`}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
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
                      <p className="text-[9px] text-zinc-600 font-mono mt-0.5">{step.time}</p>
                    ) : (
                      !step.done && (
                        <p className="text-[9px] text-zinc-700 italic mt-0.5">Pendiente</p>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Stats */}
          <div className="mt-5 pt-4 border-t border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-600 flex items-center gap-1">
                <MessageSquare size={9} />
                Mensajes
              </span>
              <span className="text-zinc-400 font-mono font-bold">{ticket.messages.length}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-600 flex items-center gap-1">
                <Shield size={9} />
                Prioridad
              </span>
              <span className={`font-bold text-[9px] uppercase tracking-wide ${priority.cls.split(' ')[0]}`}>
                {priority.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
