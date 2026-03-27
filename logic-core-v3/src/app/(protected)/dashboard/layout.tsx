import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { resolveOrgId, isAdminPreview } from '@/lib/preview'
import { PreviewBanner } from '@/components/dashboard/PreviewBanner'
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const organizationId = await resolveOrgId()
  const preview = await isAdminPreview()

  if (!organizationId) redirect('/login')

  const [client, unreadMessages, notifications, currentUser] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { companyName: true, onboardingCompleted: true },
    }),
    prisma.message.count({
      where: { organizationId, fromAdmin: true, read: false },
    }),
    prisma.notification.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { unlockedFeatures: true },
        })
      : Promise.resolve(null),
  ])

  if (!client) redirect('/login')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isBienvenida = pathname.startsWith('/bienvenida')

  if (!client.onboardingCompleted && !preview && !isBienvenida) {
    redirect('/bienvenida')
  }

  return (
    <DashboardLayoutClient
      companyName={client.companyName}
      unreadMessages={unreadMessages}
      unlockedFeatures={currentUser?.unlockedFeatures ?? []}
      notifications={notifications}
      userDisplayName={session?.user?.name ?? session?.user?.email ?? undefined}
      banners={
        <>
          <SubscriptionBanner />
          {preview && <PreviewBanner companyName={client.companyName} />}
        </>
      }
    >
      {children}
    </DashboardLayoutClient>
  )
}
