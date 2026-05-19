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
  const pendingAlerts = await getPendingAlerts()

  return (
    <AdminLayoutClient
      userName={userName}
      userRole={session.user.role}
      pendingAlerts={pendingAlerts}
    >
      <PageTransition>{children}</PageTransition>
    </AdminLayoutClient>
  )
}
