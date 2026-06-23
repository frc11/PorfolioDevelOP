import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { Clock, Headphones, Users } from 'lucide-react'
import { NewTicketModal } from '@/components/dashboard/NewTicketModal'
import { SoporteTabsClient } from '@/components/dashboard/SoporteTabsClient'
import { PageHeader, StatCard } from '@/components/ui'
import { adminHoverCls } from '@/lib/hover'

export const metadata = { title: 'Soporte B2B | develOP Dashboard' }

export default async function SoportePage() {
  const session = await auth()
  const organizationId = await resolveOrgId()

  if (!session?.user?.id || !organizationId) redirect('/login')

  const [tickets, openTicketsCount] = await Promise.all([
    prisma.ticket.findMany({
      where: { organizationId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true },
        },
      },
    }),
    prisma.ticket.count({
      where: {
        organizationId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    }),
  ])

  const serialized = tickets.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED',
    priority: t.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    category: t.category as 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'OTHER',
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    messageCount: t._count.messages,
    lastMessage: t.messages[0]?.content ?? null,
  }))

  const activeTickets = serialized.filter((t) => t.status !== 'RESOLVED')
  const resolvedTickets = serialized.filter((t) => t.status === 'RESOLVED')

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <PageHeader
          eyebrow="Soporte"
          title="Centro de Soporte"
          description="Un canal directo para ordenar consultas, prioridades y próximos pasos con el equipo."
          icon={Headphones}
        />
        <div className="shrink-0 sm:mt-3">
          <NewTicketModal />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Tickets abiertos"
          value={openTicketsCount}
          icon={Headphones}
          accent="cyan"
          className={adminHoverCls}
        />
        <StatCard
          label="SLA horario laboral"
          value="< 4h"
          icon={Clock}
          accent="emerald"
          subtitle="Lun-Vie 9-19hs ART"
          className={adminHoverCls}
        />
        <StatCard
          label="Tu equipo de soporte"
          value="develOP"
          icon={Users}
          accent="zinc"
          subtitle="Mensajes, tickets o WhatsApp"
          className={adminHoverCls}
        />
      </div>

      <SoporteTabsClient activeTickets={activeTickets} resolvedTickets={resolvedTickets} />
    </div>
  )
}
