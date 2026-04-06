'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { LifeBuoy, MessageSquareText } from 'lucide-react'
import type { TicketStatus } from '@prisma/client'
import { EmptyState } from '@/app/(protected)/admin/os/_components/empty-state'

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function TicketList({ tickets }: TicketListProps) {
  const [activeTab, setActiveTab] = useState<TicketTab>('ALL')

  const filteredTickets = useMemo(() => {
    if (activeTab === 'ALL') {
      return tickets
    }

    return tickets.filter((ticket) => ticket.status === activeTab)
  }, [activeTab, tickets])

  const counts = useMemo(
    () => ({
      ALL: tickets.length,
      OPEN: tickets.filter((ticket) => ticket.status === 'OPEN').length,
      IN_PROGRESS: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
      RESOLVED: tickets.filter((ticket) => ticket.status === 'RESOLVED').length,
    }),
    [tickets]
  )

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
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
      </div>

      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No hay tickets en esta bandeja"
          description="Cuando entren nuevas conversaciones de soporte para este estado, van a aparecer aca."
        />
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/admin/os/tickets/${ticket.id}`}
              className="group rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/20 hover:bg-white/[0.07]"
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
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                      {ticket.organization.companyName}
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
          ))}
        </div>
      )}
    </section>
  )
}
