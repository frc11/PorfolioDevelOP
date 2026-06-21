import { auth } from '@/auth'
import { unstable_noStore as noStore, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { parseEvaluacion } from '@/lib/leados/flow'
import { esCaliente } from '@/lib/leados/revision'
import { AdminLayoutClient } from './_components/AdminLayoutClient'
import { PageTransition } from './_components/PageTransition'

export const dynamic = 'force-dynamic'

const getPendingAlerts = unstable_cache(
  async () => prisma.botAlert.count({ where: { status: 'PENDING' } }),
  ['admin-alerts-count'],
  { revalidate: 30, tags: ['admin-alerts-count'] }
)

// B-beta: señal in-app de la cola de revisión para el badge del sidebar —
// cuántas demos esperan veredicto y cuántas son calientes. Mismo patrón que
// getPendingAlerts (cache 30s, tag propio). El volumen EN_REVISION es chico, así
// que el findMany del evaluacionJson para contar calientes es barato. Devuelve
// solo números (sin Dates: nada que romper al serializar el cache).
const getRevisionResumen = unstable_cache(
  async () => {
    const enRevision = await prisma.osLeadDossier.findMany({
      where: { stage: 'EN_REVISION' },
      select: { evaluacionJson: true },
    })
    const calientes = enRevision.filter((dossier) =>
      esCaliente(parseEvaluacion(dossier.evaluacionJson)?.score ?? null),
    ).length
    return { pendientes: enRevision.length, calientes }
  },
  ['admin-revision-resumen'],
  { revalidate: 30, tags: ['admin-revision-resumen'] }
)

export default async function AgencyOsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()

  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  const userName = session.user.name ?? session.user.email ?? 'Super Admin'
  const [pendingAlerts, revision] = await Promise.all([
    getPendingAlerts(),
    getRevisionResumen(),
  ])

  return (
    <AdminLayoutClient
      userName={userName}
      userRole={session.user.role}
      pendingAlerts={pendingAlerts}
      revisionPendientes={revision.pendientes}
      revisionCalientes={revision.calientes}
    >
      <PageTransition>{children}</PageTransition>
    </AdminLayoutClient>
  )
}
