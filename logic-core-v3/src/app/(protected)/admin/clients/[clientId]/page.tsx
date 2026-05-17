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
  params: Promise<{ clientId: string }>
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

  const { clientId } = await params
  const { tab: tabParam } = await searchParams
  const activeTab: TabId = VALID_TABS.includes(tabParam as TabId)
    ? (tabParam as TabId)
    : 'overview'

  const client = await prisma.organization.findUnique({
    where: { id: clientId },
    include: {
      botConfig: {
        select: {
          id: true,
          slug: true,
          botName: true,
          isActive: true,
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
  })

  if (!client) notFound()

  return (
    <div className="space-y-6">
      <ClientHeader client={client} />
      <ClientTabsNav clientId={clientId} activeTab={activeTab} />

      <Suspense fallback={<TabSkeleton />}>
        {activeTab === 'overview' && <OverviewTab clientId={clientId} />}
        {activeTab === 'chatbot' && <ChatbotTab clientId={clientId} />}
        {activeTab === 'projects' && <ProjectsTab clientId={clientId} />}
        {activeTab === 'vault' && <VaultTab clientId={clientId} />}
        {activeTab === 'support' && <SupportTab clientId={clientId} />}
      </Suspense>
    </div>
  )
}
