import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { callerCanAccessOrg } from '@/lib/auth/assert-ownership'
import {
  listRecentEvents,
  getMonthlyUsageForBot,
  listLeadsForBot,
  listConversationsForBot,
} from '@/modules/chatbot/server/admin/queries'
import {
  BotDetailClient,
  type MappedEvent,
  type LeadItem,
  type ConversationItem,
  type BotWithDetails,
  type MonthlyUsage,
} from './BotDetailClient'
import { VALID_TABS, type TabId } from './tabs'
import { IntegrationsTab } from './tabs/IntegrationsTab'

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

  const [bot, rawEvents, monthlyUsage, rawLeads, rawConversations] = await Promise.all([
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
    listConversationsForBot(botId, 100),
  ])

  // P0-6: scoping defensivo. SUPER_ADMIN ve cualquier org (no-op); cualquier
  // otro rol futuro queda atado a su propia org. notFound() para no leakear la
  // existencia del bot a otra org.
  if (!bot || !callerCanAccessOrg(session.user, bot.organization.id)) {
    notFound()
  }

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

  const conversations: ConversationItem[] = rawConversations.map(c => ({
    id: c.id,
    sessionId: c.sessionId,
    currentPath: c.currentPath,
    messageCount: c.messageCount,
    tokensIn: c.tokensIn,
    tokensOut: c.tokensOut,
    estimatedCostUsd: Number(c.estimatedCostUsd),
    leadCaptured: c.leadCaptured,
    startedAt: c.startedAt ? c.startedAt.toISOString() : null,
    lastMessageAt: c.lastMessageAt ? c.lastMessageAt.toISOString() : null,
    lead: c.lead ? { id: c.lead.id, name: c.lead.name ?? 'Sin nombre', intent: c.lead.intent } : null,
    _count: c._count,
  }))

  const serializedUsage: MonthlyUsage = monthlyUsage
    ? {
        conversationsCount: monthlyUsage.conversationsCount,
        tokensIn: monthlyUsage.tokensIn,
        tokensOut: monthlyUsage.tokensOut,
        costUsd: Number(monthlyUsage.costUsd),
      }
    : null

  return (
    <BotDetailClient
      bot={bot as BotWithDetails}
      initialTab={activeTab}
      initialEvents={initialEvents}
      monthlyUsage={serializedUsage}
      leads={leads}
      conversations={conversations}
      integrationsTab={
        <IntegrationsTab
          organizationId={bot.organization.id}
          organizationName={bot.organization.companyName}
        />
      }
    />
  )
}
