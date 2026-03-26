import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Headphones } from 'lucide-react'
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client'
import { TicketsFilters } from '@/components/admin/TicketsFilters'

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

function StatusBadge({ status }: { status: TicketStatus }) {
  const config: Record<TicketStatus, { label: string; bg: string; border: string; color: string }> = {
    OPEN: { label: 'Abierto', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.3)', color: 'rgb(34,211,238)' },
    IN_PROGRESS: { label: 'En progreso', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', color: 'rgb(250,204,21)' },
    RESOLVED: { label: 'Resuelto', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: 'rgb(52,211,153)' },
  }
  const c = config[status]
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>
}) {
  const { status: statusParam, priority: priorityParam } = await searchParams

  const statusFilter = Object.values(TicketStatus).includes(statusParam as TicketStatus)
    ? (statusParam as TicketStatus)
    : undefined

  const priorityFilter = Object.values(TicketPriority).includes(priorityParam as TicketPriority)
    ? (priorityParam as TicketPriority)
    : undefined

  const [tickets, openCount] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(priorityFilter ? { priority: priorityFilter } : {}),
      },
      include: {
        organization: { select: { companyName: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ticket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
    }),
  ])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
            Soporte
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-zinc-100">Tickets</h1>
            {openCount > 0 && (
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                style={{
                  background: 'rgba(6,182,212,0.12)',
                  border: '1px solid rgba(6,182,212,0.3)',
                  color: 'rgb(34,211,238)',
                }}
              >
                {openCount} sin resolver
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-zinc-600">
            {tickets.length} {tickets.length === 1 ? 'resultado' : 'resultados'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <TicketsFilters currentStatus={statusParam} currentPriority={priorityParam} />

      {/* Content */}
      {tickets.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-2xl py-20 text-center"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(6,182,212,0.08)' }}
          >
            <Headphones size={20} className="text-cyan-400/50" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">No hay tickets que coincidan con los filtros.</p>
            {(statusParam || priorityParam) && (
              <Link
                href="/admin/tickets"
                className="mt-2 inline-block text-sm text-cyan-400 transition-colors hover:text-cyan-300"
              >
                Limpiar filtros →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div
          className="overflow-x-auto rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                {['Cliente', 'Título', 'Categoría', 'Prioridad', 'Estado', 'Fecha', ''].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-600"
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="group transition-colors hover:bg-white/[0.025]"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                >
                  {/* Cliente */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
                        style={{ background: 'rgba(6,182,212,0.1)', color: 'rgb(34,211,238)' }}
                      >
                        {ticket.organization.companyName[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-zinc-100">
                        {ticket.organization.companyName}
                      </span>
                    </div>
                  </td>

                  {/* Título */}
                  <td className="max-w-[220px] px-5 py-4">
                    <p className="truncate font-medium text-zinc-200">{ticket.title}</p>
                    {ticket.user.name && (
                      <p className="mt-0.5 truncate text-[11px] text-zinc-600">
                        {ticket.user.name}
                      </p>
                    )}
                  </td>

                  {/* Categoría */}
                  <td className="px-5 py-4 text-zinc-500">
                    {CATEGORY_LABELS[ticket.category]}
                  </td>

                  {/* Prioridad */}
                  <td className="px-5 py-4">
                    <PriorityBadge priority={ticket.priority} />
                  </td>

                  {/* Estado */}
                  <td className="px-5 py-4">
                    <StatusBadge status={ticket.status} />
                  </td>

                  {/* Fecha */}
                  <td className="px-5 py-4 tabular-nums text-zinc-600">
                    {new Date(ticket.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>

                  {/* Acciones */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
