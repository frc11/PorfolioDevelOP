import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ClientHeader } from './_components/ClientHeader'
import { ClientTabsNav } from './_components/ClientTabsNav'
import { TabSkeleton } from './_components/TabSkeleton'
import { ChatbotTab } from './_components/tabs/ChatbotTab'
import { OverviewTab } from './_components/tabs/OverviewTab'
import { ProjectsTab } from './_components/tabs/ProjectsTab'
import { SupportTab } from './_components/tabs/SupportTab'
import { VaultTab } from './_components/tabs/VaultTab'

interface PageProps {
  params: Promise<{ orgSlug: string }>
  searchParams: Promise<{ tab?: string }>
}

type TabId = 'overview' | 'chatbot' | 'projects' | 'vault' | 'support'

const VALID_TABS: TabId[] = ['overview', 'chatbot', 'projects', 'vault', 'support']

export default async function ClientDetailPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const { orgSlug } = await params
  const { tab: tabParam } = await searchParams
  const activeTab: TabId = VALID_TABS.includes(tabParam as TabId)
    ? (tabParam as TabId)
    : 'overview'

  const [client, allClients] = await Promise.all([
    prisma.organization.findFirst({
      where: {
        OR: [{ id: orgSlug }, { slug: orgSlug }],
      },
      include: {
        botConfig: {
          include: {
            _count: {
              select: { conversations: true, leads: true },
            },
          },
        },
        subscription: {
          select: { status: true, planName: true },
        },
        _count: {
          select: {
            projects: true,
            clientAssets: true,
            tickets: true,
            messages: true,
          },
        },
      },
    }),
    prisma.organization.findMany({
      select: { id: true, companyName: true, slug: true },
      orderBy: { companyName: 'asc' },
    }),
  ])

  if (!client) notFound()

  return (
    <div className="space-y-6">
      <ClientHeader
        client={client}
        allClients={allClients.map((item) => ({
          id: item.id,
          name: item.companyName,
          slug: item.slug,
        }))}
      />
      <ClientTabsNav clientId={client.id} activeTab={activeTab} />

      <Suspense fallback={<TabSkeleton />}>
        {activeTab === 'overview' && <OverviewTab clientId={client.id} />}
        {activeTab === 'chatbot' && <ChatbotTab clientId={client.id} />}
        {activeTab === 'projects' && <ProjectsTab clientId={client.id} />}
        {activeTab === 'vault' && <VaultTab clientId={client.id} />}
        {activeTab === 'support' && <SupportTab clientId={client.id} />}
      </Suspense>
    </div>
  )
}
