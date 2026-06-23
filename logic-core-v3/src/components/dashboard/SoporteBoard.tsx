'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'motion/react'
import { Book, ChevronRight, Clock, HelpCircle, Inbox, Zap } from 'lucide-react'
import { EmptyState, Modal } from '@/components/ui'
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

// Máx de cards mostradas en la vista de columna; el resto vive en el overview.
const MAX_VISIBLE = 2

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
        // Hover acotado del admin (adminHoverCls: scale 1.015 + shadow + ring, contenido
        // dentro del padding de la columna) — sin el scale grande que desbordaba el borde.
        className={`group block rounded-[22px] border border-white/10 bg-white/5 p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.22)] hover:border-cyan-400/20 hover:bg-white/[0.07] ${adminHoverCls}`}
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
        <h4 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-zinc-100 transition-colors group-hover:text-white">
          {ticket.title}
        </h4>

        {/* Preview del último mensaje */}
        {ticket.lastMessage && (
          <p className="mt-1.5 line-clamp-1 text-xs leading-relaxed text-zinc-400">
            {ticket.lastMessage}
          </p>
        )}

        {/* Footer: tiempo · mensajes */}
        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5 text-[10px] font-medium text-zinc-500">
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

function TicketColumn({
  column,
  tickets,
  onOpenOverview,
}: {
  column: ColumnDef
  tickets: TicketListItem[]
  onOpenOverview: () => void
}) {
  const visibleTickets = tickets.slice(0, MAX_VISIBLE)
  const hasMore = tickets.length > MAX_VISIBLE

  return (
    <section className="relative flex min-w-0 flex-col rounded-[26px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      {/* Header de columna con tinte por estado — click abre el overview de la categoría */}
      <button
        type="button"
        onClick={onOpenOverview}
        aria-label={`Ver todos los tickets de ${column.label} (${tickets.length})`}
        className={cn(
          'block w-full shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br px-4 py-2.5 text-left transition-[filter] hover:brightness-110',
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
      </button>

      {/* Cuerpo: máx 2 cards. Si hay más, un overlay con gradiente (capa aparte) desvanece
          el 2do ticket. El overlay NO recorta el ring del hover de la card (el problema del
          mask-image, que clipeaba el borde): la card conserva su ring completo. px-1 da aire
          al hover. */}
      <div className="mt-3 flex-1 px-1">
        <div className="space-y-2.5 pb-1">
          {tickets.length > 0 ? (
            visibleTickets.map((ticket, idx) => (
              <TicketCard key={ticket.id} ticket={ticket} idx={idx} />
            ))
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
      </div>

      {/* Fade del "Ver más": gradiente SUAVE hacia la superficie de la columna, anclado al
          fondo de la <section> y con sus mismas esquinas redondeadas (rounded-b-[26px]) — sin
          rectángulo duro. Capa aparte que NO enmascara la card → ring del hover completo. */}
      {hasMore && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-[26px] bg-gradient-to-t from-[#141618] to-transparent"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-3">
            <button
              type="button"
              onClick={onOpenOverview}
              className="pointer-events-auto rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold text-cyan-300/90 shadow-lg backdrop-blur-md transition-colors hover:bg-cyan-400/10 hover:text-cyan-200"
            >
              Ver más ({tickets.length})
            </button>
          </div>
        </>
      )}
    </section>
  )
}

interface Props {
  activeTickets: TicketListItem[]
  resolvedTickets: TicketListItem[]
}

export function SoporteBoard({ activeTickets, resolvedTickets }: Props) {
  const [overview, setOverview] = useState<TicketStatus | null>(null)

  const byStatus: Record<TicketStatus, TicketListItem[]> = {
    OPEN: activeTickets.filter((t) => t.status === 'OPEN'),
    IN_PROGRESS: activeTickets.filter((t) => t.status === 'IN_PROGRESS'),
    RESOLVED: resolvedTickets,
  }

  const openColumn = overview ? COLUMNS.find((c) => c.key === overview) ?? null : null
  const overviewTickets = overview ? byStatus[overview] : []

  return (
    // En desktop llena el alto acotado del fold (lg:flex-1): columnas + recursos arriba,
    // el sobrante queda abajo. El board no scrollea (cada columna muestra máx 2 + "Ver más").
    <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1">
      {/* Tablero de 3 columnas (Abiertos · En curso · Resueltos). Columnas de igual alto
          (grid stretch); cada una muestra máx 2 tickets. En mobile (<lg) se apilan. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => (
          <TicketColumn
            key={column.key}
            column={column}
            tickets={byStatus[column.key]}
            onOpenOverview={() => setOverview(column.key)}
          />
        ))}
      </div>

      {/* Overview de categoría — modal portaleado a body (mismo patrón que el resto del lane).
          Scrollea internamente; click en un ticket → su detalle. */}
      <Modal
        open={overview !== null}
        onClose={() => setOverview(null)}
        title={openColumn?.label}
        description={`${overviewTickets.length} ticket${overviewTickets.length !== 1 ? 's' : ''}`}
        size="xl"
        surface="glass"
      >
        {overviewTickets.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {overviewTickets.map((ticket, idx) => (
              <TicketCard key={ticket.id} ticket={ticket} idx={idx} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title={openColumn?.emptyTitle ?? 'Sin tickets'}
            description={openColumn?.emptyDescription ?? ''}
            variant="subtle"
            size="sm"
          />
        )}
      </Modal>

      {/* Recursos de autogestión */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h4 className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          Recursos de Autogestión
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left shadow-lg backdrop-blur-xl hover:border-white/20 hover:bg-white/[0.07] ${adminHoverCls}`}
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
