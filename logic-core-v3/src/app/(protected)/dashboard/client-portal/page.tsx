import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'

export default async function ClientPortalPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('client-portal') ?? false
  if (!isUnlocked) {
    return <LockedFeatureView featureId="client-portal" />
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-white">Portal de Clientes</h1>
      <p className="text-zinc-400">Módulo activo. Contenido próximamente.</p>
    </div>
  )
}
