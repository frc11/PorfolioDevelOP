import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ClientForm } from '@/components/admin/ClientForm'
import { updateClientAction } from '@/lib/actions/clients'

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      companyName: true,
      logoUrl: true,
      analyticsPropertyId: true,
      siteUrl: true,
      n8nWorkflowIds: true,
      user: { select: { name: true, email: true } },
    },
  })

  if (!client) notFound()

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href={`/admin/clients/${id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft size={14} />
        Volver al detalle
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">
          Editar — {client.companyName}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          El email no puede modificarse desde aquí.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <ClientForm
          action={updateClientAction}
          mode="edit"
          initialValues={{
            clientId: client.id,
            companyName: client.companyName,
            name: client.user.name ?? '',
            logoUrl: client.logoUrl,
            email: client.user.email,
            analyticsPropertyId: client.analyticsPropertyId,
            siteUrl: client.siteUrl,
            n8nWorkflowIds: client.n8nWorkflowIds,
          }}
          cancelHref={`/admin/clients/${id}`}
        />
      </div>
    </div>
  )
}
