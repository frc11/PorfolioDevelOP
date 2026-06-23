'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Book, ChevronRight, Clock, HelpCircle, Inbox, Zap } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { adminHoverCls } from '@/lib/hover'
import { cn } from '@/lib/utils'

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
type TicketCategory = 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'OTHER'

export interface TicketListItem {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  category: TicketCategory
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage: string | null
}

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

type ColumnDef = {
  key: TicketStatus
  label: string
  /** Gradiente + color de texto del header (mismo lenguaje que statusTone del pipeline admin). */
  tone: string
  emptyTitle: string
  emptyDescription: string
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'OPEN',
    label: 'Abiertos',
    tone: 'from-cyan-400/20 to-cyan-400/5',
    emptyTitle: 'Sin tickets abiertos',
    emptyDescription: 'Cuando abras un ticket nuevo va a aparecer acá.',
  },
  {
    key: 'IN_PROGRESS',
    label: 'En curso',
    tone: 'from-amber-400/20 to-amber-400/5',
    emptyTitle: 'Nada en curso',
    emptyDescription: 'Los tickets que el equipo esté atendiendo se ven acá.',
  },
  {
    key: 'RESOLVED',
    label: 'Resueltos',
    tone: 'from-emerald-400/20 to-emerald-400/5',
    emptyTitle: 'Sin resueltos todavía',
    emptyDescription: 'El historial de tickets cerrados va a aparecer acá.',
  },
]

function timeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60) return 'hace un momento'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

function TicketCard({ ticket, idx }: { ticket: TicketListItem; idx: number }) {
  const priority = PRIORITY_MAP[ticket.priority]

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.15) }}
    >
      <Link
        href={`/dashboard/soporte/${ticket.id}`}
        className="group block rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-all hover:scale-[1.02] hover:border-cyan-400/20 hover:bg-white/[0.07] motion-reduce:hover:scale-100"
      >
        {/* Badges: prioridad + categoría + id */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${priority.cls}`}
          >
            {priority.pulse && (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            )}
            {priority.label}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
            {CATEGORY_MAP[ticket.category]}
          </span>
          <span className="ml-auto font-mono text-[10px] text-zinc-600">
            #{ticket.id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Título */}
        <h4 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-white">
          {ticket.title}
        </h4>

        {/* Preview del último mensaje */}
        {ticket.lastMessage && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
            {ticket.lastMessage}
          </p>
        )}

        {/* Footer: tiempo · mensajes */}
        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[10px] font-medium text-zinc-500">
          <Clock size={9} strokeWidth={1.5} />
          <span>{timeAgo(ticket.createdAt)}</span>
          <span>·</span>
          <span>
            {ticket.messageCount} {ticket.messageCount === 1 ? 'msg' : 'msgs'}
          </span>
          <ChevronRight
            size={12}
            strokeWidth={1.5}
            className="ml-auto transition-colors group-hover:text-cyan-400"
          />
        </div>
      </Link>
    </motion.div>
  )
}

function TicketColumn({ column, tickets }: { column: ColumnDef; tickets: TicketListItem[] }) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col rounded-[26px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      {/* Header de columna con tinte por estado (label + nombre + contador) */}
      <div
        className={cn(
          'shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br px-4 py-3',
          column.tone,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Soporte</p>
            <h3 className="mt-1 truncate text-sm font-semibold text-white">{column.label}</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-medium text-white/85">
            {tickets.length}
          </div>
        </div>
      </div>

      {/* Cuerpo: altura fija (flex-1) con scroll interno. px-1 da aire al hover:scale. */}
      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto px-1 pb-1">
        {tickets.length > 0 ? (
          tickets.map((ticket, idx) => <TicketCard key={ticket.id} ticket={ticket} idx={idx} />)
        ) : (
          <EmptyState
            icon={Inbox}
            title={column.emptyTitle}
            description={column.emptyDescription}
            variant="subtle"
            size="sm"
          />
        )}
      </div>
    </section>
  )
}

interface Props {
  activeTickets: TicketListItem[]
  resolvedTickets: TicketListItem[]
}

export function SoporteBoard({ activeTickets, resolvedTickets }: Props) {
  const byStatus: Record<TicketStatus, TicketListItem[]> = {
    OPEN: activeTickets.filter((t) => t.status === 'OPEN'),
    IN_PROGRESS: activeTickets.filter((t) => t.status === 'IN_PROGRESS'),
    RESOLVED: resolvedTickets,
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      {/* Tablero de 3 columnas. En desktop llena el alto disponible (cada columna
          scrollea internamente); en mobile (<lg) las columnas se apilan y la página scrollea. */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-1">
        {COLUMNS.map((column) => (
          <TicketColumn key={column.key} column={column} tickets={byStatus[column.key]} />
        ))}
      </div>

      {/* Recursos de autogestión — fijo al pie, siempre visible (no obliga a scrollear). */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="shrink-0"
      >
        <h4 className="mb-3 px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Recursos de Autogestión
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Guía del Usuario',
              Icon: Book,
              color: 'text-blue-400',
              desc: 'Aprendé a gestionar tu negocio.',
            },
            {
              label: 'Preguntas Frecuentes',
              Icon: HelpCircle,
              color: 'text-amber-400',
              desc: 'Respuestas rápidas a dudas comunes.',
            },
            {
              label: 'Tips de Optimización',
              Icon: Zap,
              color: 'text-emerald-400',
              desc: 'Mejorá tu conversión hoy.',
            },
          ].map((item) => (
            <button
              key={item.label}
              className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left shadow-lg backdrop-blur-xl hover:border-white/20 hover:bg-white/[0.07] ${adminHoverCls}`}
            >
              <div
                className={`shrink-0 rounded-xl border border-white/5 bg-black/20 p-2.5 transition-transform group-hover:scale-110 ${item.color}`}
              >
                <item.Icon size={18} strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-zinc-200 transition-colors group-hover:text-white">
                  {item.label}
                </span>
                <p className="mt-0.5 truncate text-[10px] leading-relaxed text-zinc-500">
                  {item.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
