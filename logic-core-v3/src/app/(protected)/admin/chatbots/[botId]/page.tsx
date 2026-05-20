import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  listRecentEvents,
  getMonthlyUsageForBot,
  listLeadsForBot,
} from '@/modules/chatbot/server/admin/queries'
import {
  BotDetailClient,
  VALID_TABS,
  type TabId,
  type MappedEvent,
  type LeadItem,
  type BotWithDetails,
} from './BotDetailClient'

interface Props {
  params: Promise<{ botId: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function BotDetailPage({ params, searchParams }: Props) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const { botId } = await params
  const { tab } = await searchParams

  const [bot, rawEvents, monthlyUsage, rawLeads] = await Promise.all([
    prisma.botConfig.findUnique({
      where: { id: botId },
      include: {
        organization: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            leadNotificationEmail: true,
            leadNotificationMode: true,
          },
        },
        knowledgeBase: true,
        _count: {
          select: { conversations: true, leads: true, events: true },
        },
      },
    }),
    listRecentEvents(botId, 100),
    getMonthlyUsageForBot(botId),
    listLeadsForBot(botId, 100),
  ])

  if (!bot) notFound()

  const activeTab: TabId = (VALID_TABS as readonly string[]).includes(tab ?? '')
    ? (tab as TabId)
    : 'overview'

  const initialEvents: MappedEvent[] = rawEvents.map(e => ({
    id: e.id,
    type: e.type,
    level: (e.level ?? 'info') as MappedEvent['level'],
    message: e.message,
    createdAt: e.createdAt.toISOString(),
    conversationSession: e.conversation?.sessionId ?? null,
    conversationPath: e.conversation?.currentPath ?? null,
    metadata: e.metadata as Record<string, unknown> | null,
  }))

  const leads: LeadItem[] = rawLeads.map(l => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    intent: l.intent,
    message: l.message,
    status: l.status,
    capturedAt: l.capturedAt,
    conversation: l.conversation ?? null,
  }))

  return (
    <BotDetailClient
      bot={bot as BotWithDetails}
      initialTab={activeTab}
      initialEvents={initialEvents}
      monthlyUsage={monthlyUsage}
      leads={leads}
    />
  )
}
