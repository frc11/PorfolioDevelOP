import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { Clock, Headphones, Users } from 'lucide-react'
import { NewTicketModal } from '@/components/dashboard/NewTicketModal'
import { SoporteBoard } from '@/components/dashboard/SoporteBoard'
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
    // No-scroll en pantallas normales/altas: en desktop (lg+) la página tiene min-height igual
    // al área visible de <main> (mismo calc que la página de detalle), y con las columnas
    // acotadas (COLUMN_BODY_MAX_H) todo el contenido entra dentro de ese alto → sin scroll.
    // Uso min-h (no h + overflow-hidden): en un viewport BAJO de ancho lg (p.ej. 1366×768) el
    // contenido excede el fold y la página scrollea para ALCANZAR los recursos, en vez de
    // recortarlos sin retorno (lo que hacía overflow-hidden). En mobile (<lg) fluye natural.
    <div className="flex w-full flex-col gap-4 lg:min-h-[calc(100svh-12.5rem)]">
      <div className="flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <PageHeader
          eyebrow="Soporte"
          title="Centro de Soporte"
          description="Un canal directo para ordenar consultas, prioridades y próximos pasos con el equipo."
          icon={Headphones}
          className="pt-0 sm:pt-1"
        />
        <div className="shrink-0 sm:mt-3">
          <NewTicketModal />
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Tickets abiertos"
          value={openTicketsCount}
          icon={Headphones}
          accent="cyan"
          className={`${adminHoverCls} p-3.5`}
        />
        <StatCard
          label="SLA horario laboral"
          value="< 4h"
          icon={Clock}
          accent="emerald"
          subtitle="Lun-Vie 9-19hs ART"
          className={`${adminHoverCls} p-3.5`}
        />
        <StatCard
          label="Tu equipo de soporte"
          value="develOP"
          icon={Users}
          accent="zinc"
          subtitle="Mensajes, tickets o WhatsApp"
          className={`${adminHoverCls} p-3.5`}
        />
      </div>

      <SoporteBoard activeTickets={activeTickets} resolvedTickets={resolvedTickets} />
    </div>
  )
}
