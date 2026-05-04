import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { Headphones } from 'lucide-react'
import { NewTicketModal } from '@/components/dashboard/NewTicketModal'
import { SoporteTabsClient } from '@/components/dashboard/SoporteTabsClient'
import { Card } from '@/components/ui/Card'

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
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Headphones className="text-cyan-500" size={24} />
            Centro de Soporte Profesional
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
            Un canal directo para ordenar consultas, prioridades y próximos pasos con el equipo.
          </p>
          <div className="mt-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SOPORTE PERSONALIZADO
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <NewTicketModal />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        {/* Tickets abiertos REAL */}
        <Card padding="md">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Tickets abiertos
            </p>
            <p className="text-3xl font-black tabular-nums text-cyan-400">
              {openTicketsCount}
            </p>
          </div>
        </Card>

        {/* SLA en horario laboral */}
        <Card padding="md">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              SLA en horario laboral
            </p>
            <p className="text-3xl font-black tabular-nums text-emerald-400">
              &lt; 4h
            </p>
            <p className="text-[10px] text-zinc-600">Lun-Vie 9-19hs ART</p>
          </div>
        </Card>

        {/* Tu equipo */}
        <Card padding="md">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Tu equipo de soporte
            </p>
            <p className="text-base font-bold text-zinc-200">Equipo develOP</p>
            <p className="text-[10px] text-zinc-600">
              Respondemos por mensajes, tickets o WhatsApp directo
            </p>
          </div>
        </Card>
      </div>

      <SoporteTabsClient activeTickets={activeTickets} resolvedTickets={resolvedTickets} />
    </div>
  )
}
