import { Suspense } from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { ClientsListClient } from './_components/ClientsListClient'

const getClients = unstable_cache(
  async () =>
    prisma.organization.findMany({
      include: {
        botConfig: { select: { isActive: true, monthlyQuota: true } },
        subscription: { select: { status: true, plan: { select: { name: true } } } },
        _count: {
          select: { projects: true, tickets: true, messages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ['admin-clients'],
  { revalidate: 60, tags: ['admin-clients'] }
)

async function ClientsList() {
  const clients = await getClients()
  const listClients = clients.map((client) => ({
    id: client.id,
    companyName: client.companyName,
    slug: client.slug,
    siteUrl: client.siteUrl,
    whatsapp: client.whatsapp,
    botConfig: client.botConfig,
    subscription: client.subscription,
    _count: client._count,
    createdAt: new Date(client.createdAt).toISOString(),
  }))
  return (
    <>
      <p className="text-sm text-zinc-400">{clients.length} clientes en el sistema</p>
      <ClientsListClient clients={listClients} />
    </>
  )
}

function ClientsListSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-40 animate-pulse rounded bg-white/5" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
  )
}

export default async function ClientsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Clientes
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Todos los clientes
        </h1>
      </div>

      <Suspense fallback={<ClientsListSkeleton />}>
        <ClientsList />
      </Suspense>
    </div>
  )
}
