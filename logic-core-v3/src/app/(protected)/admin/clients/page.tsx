import { Suspense } from 'react'
import { Prisma } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { ClientsListClient } from './_components/ClientsListClient'

const clientInclude = {
  botConfig: { select: { isActive: true, monthlyQuota: true } },
  subscription: { select: { status: true, plan: { select: { name: true } } } },
  _count: {
    select: { projects: true, tickets: true, messages: true },
  },
} satisfies Prisma.OrganizationInclude

// Activos: deletedAt IS NULL por default. Los archivados (soft-delete) salen en
// una query aparte para el toggle "Archivados". Misma tag → un revalidateTag
// busca ambas cuando se archiva/desarchiva.
const getClients = unstable_cache(
  async () =>
    prisma.organization.findMany({
      where: { deletedAt: null },
      include: clientInclude,
      orderBy: { createdAt: 'desc' },
    }),
  ['admin-clients-active'],
  { revalidate: 60, tags: ['admin-clients'] }
)

const getArchivedClients = unstable_cache(
  async () =>
    prisma.organization.findMany({
      where: { deletedAt: { not: null } },
      include: clientInclude,
      orderBy: { deletedAt: 'desc' },
    }),
  ['admin-clients-archived'],
  { revalidate: 60, tags: ['admin-clients'] }
)

type ClientRow = Awaited<ReturnType<typeof getClients>>[number]

function toListItem(client: ClientRow) {
  return {
    id: client.id,
    companyName: client.companyName,
    slug: client.slug,
    siteUrl: client.siteUrl,
    whatsapp: client.whatsapp,
    avatarImageUrl: client.avatarImageUrl,
    avatarEmoji: client.avatarEmoji,
    avatarInitials: client.avatarInitials,
    botConfig: client.botConfig,
    subscription: client.subscription,
    _count: client._count,
    createdAt: new Date(client.createdAt).toISOString(),
  }
}

async function ClientsList() {
  const [clients, archivedClients] = await Promise.all([
    getClients(),
    getArchivedClients(),
  ])
  return (
    <>
      <p className="text-sm text-zinc-400">
        {clients.length} clientes activos en el sistema
      </p>
      <ClientsListClient
        clients={clients.map(toListItem)}
        archivedClients={archivedClients.map(toListItem)}
      />
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
