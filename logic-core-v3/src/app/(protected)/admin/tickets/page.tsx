import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client'
import { Headphones } from 'lucide-react'
import Link from 'next/link'
import { TicketsFilters } from '@/components/admin/TicketsFilters'
import { AdminEmptyState, AdminPageHeader, AdminStatusBadge, AdminSurface } from '@/components/admin/admin-ui'
import { prisma } from '@/lib/prisma'

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  TECHNICAL: 'Técnico',
  BILLING: 'Facturación',
  FEATURE_REQUEST: 'Nueva función',
  OTHER: 'Otro',
}

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Abierto',
  IN_PROGRESS: 'En progreso',
  RESOLVED: 'Resuelto',
}

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
      <AdminPageHeader
        eyebrow="Soporte"
        title="Tickets"
        description={`${tickets.length} ${tickets.length === 1 ? 'resultado' : 'resultados'}`}
        action={openCount > 0 ? <AdminStatusBadge label={`${openCount} sin resolver`} tone="info" /> : undefined}
      />

      <TicketsFilters currentStatus={statusParam} currentPriority={priorityParam} />

      {tickets.length === 0 ? (
        <AdminEmptyState
          icon={Headphones}
          title="No hay tickets que coincidan con los filtros."
          description="Probá limpiando el estado o la prioridad para volver a revisar la bandeja."
          ctaHref={statusParam || priorityParam ? '/admin/tickets' : undefined}
          ctaLabel={statusParam || priorityParam ? 'Limpiar filtros →' : undefined}
        />
      ) : (
        <AdminSurface className="overflow-x-auto p-0">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-sm font-semibold text-cyan-200">
                        {ticket.organization.companyName[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-zinc-100">{ticket.organization.companyName}</span>
                    </div>
                  </td>
                  <td className="max-w-[220px]">
                    <p className="truncate font-medium text-zinc-200">{ticket.title}</p>
                    {ticket.user.name ? <p className="mt-1 truncate text-[11px] text-zinc-500">{ticket.user.name}</p> : null}
                  </td>
                  <td className="text-zinc-500">{CATEGORY_LABELS[ticket.category]}</td>
                  <td>
                    <AdminStatusBadge label={PRIORITY_LABELS[ticket.priority]} tone={ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'urgent' : ticket.priority === 'MEDIUM' ? 'warning' : 'muted'} />
                  </td>
                  <td>
                    <AdminStatusBadge label={STATUS_LABELS[ticket.status]} />
                  </td>
                  <td className="tabular-nums text-zinc-500">
                    {new Date(ticket.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="text-right">
                    <Link href={`/admin/tickets/${ticket.id}`} className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminSurface>
      )}
    </div>
  )
}
