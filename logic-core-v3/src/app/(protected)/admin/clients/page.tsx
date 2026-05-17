import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ClientsListClient } from './_components/ClientsListClient'

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const clients = await prisma.organization.findMany({
    include: {
      botConfig: { select: { isActive: true, monthlyQuota: true } },
      subscription: { select: { status: true, planName: true } },
      _count: {
        select: { projects: true, tickets: true, messages: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const listClients = clients.map((client) => ({
    id: client.id,
    companyName: client.companyName,
    slug: client.slug,
    siteUrl: client.siteUrl,
    whatsapp: client.whatsapp,
    botConfig: client.botConfig,
    subscription: client.subscription,
    _count: client._count,
    createdAt: client.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Clientes
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Todos los clientes
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {clients.length} clientes en el sistema
        </p>
      </div>

      <ClientsListClient clients={listClients} />
    </div>
  )
}
