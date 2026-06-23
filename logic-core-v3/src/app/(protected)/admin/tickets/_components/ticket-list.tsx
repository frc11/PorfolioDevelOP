'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { LifeBuoy, MessageSquareText } from 'lucide-react'
import type { TicketStatus } from '@prisma/client'
import { EmptyState } from '@/components/ui'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { TicketDateFilter, type TicketDateRange } from './ticket-date-filter'

type TicketListItem = {
  id: string
  title: string
  status: TicketStatus
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'OTHER'
  createdAt: string
  updatedAt: string
  organizationId: string
  organization: {
    companyName: string
  }
  _count: {
    messages: number
  }
}

type TicketListProps = {
  tickets: TicketListItem[]
}

type TicketTab = 'ALL' | TicketStatus

const TABS: Array<{ id: TicketTab; label: string }> = [
  { id: 'ALL', label: 'Todos' },
  { id: 'OPEN', label: 'Abiertos' },
  { id: 'IN_PROGRESS', label: 'En progreso' },
  { id: 'RESOLVED', label: 'Resueltos' },
]

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function TicketList({ tickets }: TicketListProps) {
  const [activeTab, setActiveTab] = useState<TicketTab>('ALL')
  const [dateRange, setDateRange] = useState<TicketDateRange>(null)
  const reduce = useReducedMotion()

  // Filtro de fecha primero (por updatedAt = ultima actividad, el campo que la lista
  // muestra y ordena); luego el tab de estado. Los counts reflejan el periodo activo.
  const dateFilteredTickets = useMemo(() => {
    if (!dateRange) {
      return tickets
    }

    return tickets.filter((ticket) => {
      const updatedMs = new Date(ticket.updatedAt).getTime()
      return updatedMs >= dateRange.fromMs && updatedMs <= dateRange.toMs
    })
  }, [dateRange, tickets])

  const filteredTickets = useMemo(() => {
    if (activeTab === 'ALL') {
      return dateFilteredTickets
    }

    return dateFilteredTickets.filter((ticket) => ticket.status === activeTab)
  }, [activeTab, dateFilteredTickets])

  const counts = useMemo(
    () => ({
      ALL: dateFilteredTickets.length,
      OPEN: dateFilteredTickets.filter((ticket) => ticket.status === 'OPEN').length,
      IN_PROGRESS: dateFilteredTickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
      RESOLVED: dateFilteredTickets.filter((ticket) => ticket.status === 'RESOLVED').length,
    }),
    [dateFilteredTickets]
  )

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    'inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-100'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200',
                  ].join(' ')}
                >
                  <span>{tab.label}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px]">
                    {counts[tab.id]}
                  </span>
                </button>
              )
            })}
          </div>

          <TicketDateFilter onChange={setDateRange} />
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No hay tickets en esta bandeja"
          description="Cuando entren nuevas conversaciones de soporte para este estado, van a aparecer aca."
        />
      ) : (
        <motion.div
          key={activeTab}
          className="grid gap-4"
          variants={staggerContainer}
          initial={reduce ? false : 'hidden'}
          animate="visible"
        >
          {filteredTickets.map((ticket) => {
            const priority = PRIORITY_MAP[ticket.priority]
            return (
            <motion.div key={ticket.id} variants={staggerItem}>
            <Link
              href={`/admin/tickets/${ticket.id}`}
              className="group block rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/20 hover:bg-white/[0.07]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-lg font-semibold text-white">{ticket.title}</h3>
                    <span
                      className={[
                        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                        STATUS_TONES[ticket.status],
                      ].join(' ')}
                    >
                      {STATUS_LABELS[ticket.status]}
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
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                      {ticket.organization.companyName}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-400">
                      {CATEGORY_MAP[ticket.category]}
                    </span>
                    <span>Actualizado {formatDate(ticket.updatedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-zinc-300">
                    <MessageSquareText className="h-4 w-4 text-cyan-300" />
                    <span>{ticket._count.messages} mensajes</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-cyan-300 transition-colors group-hover:text-cyan-200">
                    Ver ticket
                  </span>
                </div>
              </div>
            </Link>
            </motion.div>
          )
          })}
        </motion.div>
      )}
    </section>
  )
}
