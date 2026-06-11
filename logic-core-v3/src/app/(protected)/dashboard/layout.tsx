import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { resolveOrgId, isAdminPreview } from '@/lib/preview'
import { getImpersonationSession } from '@/lib/impersonation'
import { ImpersonationBanner } from '@/components/dashboard/ImpersonationBanner'
import { SubscriptionBanner } from '@/components/dashboard/SubscriptionBanner'
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient'
import { unstable_noStore as noStore, unstable_cache } from 'next/cache'
import { countHotNewLeadsForOrg } from '@/modules/chatbot/index.server'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'

export const dynamic = 'force-dynamic'

function getCachedOrgMeta(orgId: string) {
  return unstable_cache(
    async () =>
      prisma.organization.findUnique({
        where: { id: orgId },
        select: { companyName: true, onboardingCompleted: true },
      }),
    ['dashboard-org-meta', orgId],
    { revalidate: 15, tags: [`org-meta:${orgId}`] }
  )()
}

function getCachedUnreadMessages(orgId: string) {
  return unstable_cache(
    async () =>
      prisma.message.count({
        where: { organizationId: orgId, fromAdmin: true, read: false },
      }),
    ['dashboard-unread-messages', orgId],
    { revalidate: 30, tags: [`unread-messages:${orgId}`] }
  )()
}

// B5.7 — cuenta de leads hot + NEW para el badge del sidebar.
// Revalidate 30s para alinear con el polling de la lista de leads y mantener
// presión barata en DB. Tag específico para poder invalidar desde mutaciones
// (updateLeadStatus / captureLead) en el futuro si hace falta refrescar al toque.
function getCachedHotLeadsCount(orgId: string) {
  return unstable_cache(
    async () => countHotNewLeadsForOrg(orgId),
    ['dashboard-hot-leads-count', orgId],
    { revalidate: 30, tags: [`hot-leads-count:${orgId}`] }
  )()
}

function getCachedActiveModules(orgId: string) {
  return unstable_cache(
    async () =>
      prisma.organizationModule.findMany({
        where: { organizationId: orgId, status: 'ACTIVE' },
        select: { module: { select: { slug: true } } },
      }),
    ['dashboard-active-modules', orgId],
    { revalidate: 300, tags: [`org-modules:${orgId}`] }
  )()
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()

  const [session, organizationId, preview, impersonation] = await Promise.all([
    auth(),
    resolveOrgId(),
    isAdminPreview(),
    getImpersonationSession(),
  ])

  if (session?.user?.id) {
    prisma.user
      .update({
        where: { id: session.user.id },
        data: { lastDashboardVisit: new Date() },
      })
      .catch((error) => {
        console.error('[lastDashboardVisit] update failed:', error)
      })
  }

  if (!organizationId) {
    redirect(session?.user?.role === 'SUPER_ADMIN' ? '/admin/clients' : '/login')
  }

  const [client, unreadMessages, hotLeadsCount, notifications, activeModulesData, plan] = await Promise.all([
    getCachedOrgMeta(organizationId),
    getCachedUnreadMessages(organizationId),
    getCachedHotLeadsCount(organizationId),
    prisma.notification.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    getCachedActiveModules(organizationId),
    getPlanForOrg(organizationId),
  ])

  const activeModuleSlugs = activeModulesData.map((m) => m.module.slug)

  // P0.3 — El badge "X calientes" del sidebar es clasificación. Gateado por el
  // mismo helper de plan: si no incluye priorización, no se muestra.
  const visibleHotLeadsCount = planAllows(plan, 'leadScoring') ? hotLeadsCount : 0

  if (!client) redirect('/login')

  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isBienvenida = pathname.startsWith('/bienvenida')

  if ((!client.onboardingCompleted || !client.companyName?.trim()) && !preview && !isBienvenida) {
    redirect('/bienvenida')
  }

  return (
    <DashboardLayoutClient
      companyName={client.companyName}
      unreadMessages={unreadMessages}
      hotLeadsCount={visibleHotLeadsCount}
      activeModuleSlugs={activeModuleSlugs}
      notifications={notifications}
      userDisplayName={
        preview
          ? `${session?.user?.name ?? session?.user?.email ?? 'Admin'} · soporte`
          : (session?.user?.name ?? session?.user?.email ?? undefined)
      }
      banners={
        <>
          <SubscriptionBanner orgId={organizationId} />
          {preview && impersonation && (
            <ImpersonationBanner
              companyName={client.companyName}
              expiresAt={new Date(impersonation.expiresAt).toISOString()}
            />
          )}
        </>
      }
    >
      {children}
    </DashboardLayoutClient>
  )
}
