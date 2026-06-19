import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { EditClientForm } from './EditClientForm'

interface PageProps {
  params: Promise<{ clientId: string }>
}

export default async function EditClientPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const { clientId } = await params

  // Mismo criterio que el detalle: el param puede ser id o slug.
  const org = await prisma.organization.findFirst({
    where: { OR: [{ id: clientId }, { slug: clientId }] },
    select: {
      id: true,
      companyName: true,
      siteUrl: true,
      members: {
        where: { role: 'ADMIN' },
        orderBy: { joinedAt: 'asc' },
        take: 1,
        select: { user: { select: { id: true, email: true, name: true, phone: true } } },
      },
    },
  })

  if (!org) notFound()

  const adminUser = org.members[0]?.user ?? null

  return (
    <div className="pb-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Cliente</p>
        <h1 className="text-3xl font-semibold text-zinc-100">Editar datos</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Actualizá los datos de la empresa y del usuario administrador.
        </p>
      </header>

      <EditClientForm
        clientId={org.id}
        hasAdminUser={adminUser !== null}
        initial={{
          orgName: org.companyName,
          websiteUrl: org.siteUrl,
          userEmail: adminUser?.email ?? '',
          userName: adminUser?.name ?? '',
          userPhone: adminUser?.phone ?? '',
        }}
      />
    </div>
  )
}
