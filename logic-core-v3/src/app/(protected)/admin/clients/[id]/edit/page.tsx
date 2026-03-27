import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ClientForm } from '@/components/admin/ClientForm'
import { ClientModulesPanel } from '@/components/admin/ClientModulesPanel'
import { updateClientAction } from '@/lib/actions/clients'
import type { PremiumFeatureKey } from '@/lib/premium-features'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const org = await prisma.organization.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      logoUrl: true,
      analyticsPropertyId: true,
      siteUrl: true,
      n8nWorkflowIds: true,
      members: {
        where: { role: 'ADMIN' },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              unlockedFeatures: true,
            },
          },
        },
        take: 1,
      },
    },
  })

  if (!org) notFound()

  const adminUser = org.members[0]?.user

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/clients/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ChevronLeft size={14} />
          Volver al detalle
        </Link>
        <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
          Clientes
        </p>
        <h1 className="text-xl font-bold text-zinc-100">
          Editar - {org.companyName}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-600">
          El email no puede modificarse desde aqui.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ClientForm
          action={updateClientAction}
          mode="edit"
          initialValues={{
            clientId: org.id,
            companyName: org.companyName,
            name: adminUser?.name ?? '',
            logoUrl: org.logoUrl,
            email: adminUser?.email ?? '',
            analyticsPropertyId: org.analyticsPropertyId,
            siteUrl: org.siteUrl,
            n8nWorkflowIds: org.n8nWorkflowIds,
            unlockedFeatures: adminUser?.unlockedFeatures ?? [],
          }}
          cancelHref={`/admin/clients/${id}`}
        />

        <ClientModulesPanel
          clientId={org.id}
          initialFeatures={(adminUser?.unlockedFeatures ?? []) as PremiumFeatureKey[]}
        />
      </div>
    </div>
  )
}
