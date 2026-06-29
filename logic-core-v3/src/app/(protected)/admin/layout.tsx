import { auth } from '@/auth'
import { unstable_noStore as noStore, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
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
// getPendingAlerts (cache 30s, tag propio). El volumen EN_REVISION es chico.
// admin-1b: "caliente" lee el campo persistido del lead (lo marca Franco), no el
// score del blob. Devuelve solo números (sin Dates: nada que romper al cachear).
const getRevisionResumen = unstable_cache(
  async () => {
    const enRevision = await prisma.osLeadDossier.findMany({
      where: { stage: 'EN_REVISION' },
      select: { lead: { select: { caliente: true } } },
    })
    const calientes = enRevision.filter((dossier) => dossier.lead.caliente).length
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
