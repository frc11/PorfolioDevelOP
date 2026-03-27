import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

const PREMIUM_FEATURE_KEYS = new Set([
  'email-automation',
  'client-portal',
  'whatsapp-autopilot',
  'agenda-inteligente',
  'social-media-hub',
  'seo-avanzado',
  'ecommerce',
  'pixel-retargeting',
  'motor-resenias',
  'mini-crm',
  'email-nurturing',
])

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}

function isUpsellLead(lead: { service: string | null; message: string }) {
  return (
    lead.message.startsWith('Solicitud de módulo premium:') ||
    (lead.service !== null && PREMIUM_FEATURE_KEYS.has(lead.service))
  )
}

function getUpsellModuleName(lead: { service: string | null; message: string }) {
  const match = lead.message.match(/^Solicitud de módulo premium:\s*(.+)$/)
  return match?.[1] ?? lead.service ?? 'Módulo premium'
}

function getLastActivityDate(organization: {
  createdAt: Date
  messages: Array<{ createdAt: Date }>
  tickets: Array<{ updatedAt: Date }>
  invoices: Array<{ updatedAt: Date }>
  clientAssets: Array<{ updatedAt: Date }>
  brandProfile: { updatedAt: Date } | null
  subscription: { updatedAt: Date; status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' } | null
}) {
  const candidates: Date[] = [organization.createdAt]

  const messageDate = organization.messages[0]?.createdAt
  const ticketDate = organization.tickets[0]?.updatedAt
  const invoiceDate = organization.invoices[0]?.updatedAt
  const assetDate = organization.clientAssets[0]?.updatedAt
  const brandProfileDate = organization.brandProfile?.updatedAt
  const subscriptionDate = organization.subscription?.updatedAt

  if (messageDate) candidates.push(messageDate)
  if (ticketDate) candidates.push(ticketDate)
  if (invoiceDate) candidates.push(invoiceDate)
  if (assetDate) candidates.push(assetDate)
  if (brandProfileDate) candidates.push(brandProfileDate)
  if (subscriptionDate) candidates.push(subscriptionDate)

  return new Date(Math.max(...candidates.map((value) => value.getTime())))
}

export default async function AdminPage() {
  const now = new Date()
  const today = startOfDay(now)
  const weekStart = addDays(today, -6)
  const thirtyDaysAgo = addDays(today, -29)
  const upcomingRenewalLimit = addDays(today, 7)
  const inactiveThreshold = addDays(today, -30)
  const upsellThreshold = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  const [
    session,
    activeSubscriptions,
    projectsInProgress,
    unresolvedTickets,
    newLeadsThisWeek,
    urgentUnansweredTickets,
    organizations,
    oldUpsellLeads,
    leadTrendRows,
    resolvedTicketsTrendRows,
    recentTickets,
    recentLeads,
    recentApprovals,
  ] = await Promise.all([
    auth(),
    prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        price: true,
        currency: true,
        renewalDate: true,
        organization: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    }),
    prisma.project.count({
      where: { status: 'IN_PROGRESS' },
    }),
    prisma.ticket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
    }),
    prisma.contactSubmission.count({
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.ticket.findMany({
      where: {
        priority: 'URGENT',
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        messages: {
          none: { isAdmin: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        title: true,
        createdAt: true,
        organization: {
          select: { companyName: true },
        },
      },
    }),
    prisma.organization.findMany({
      select: {
        id: true,
        companyName: true,
        createdAt: true,
        messages: {
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        tickets: {
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        invoices: {
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        clientAssets: {
          select: { updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        brandProfile: {
          select: { updatedAt: true },
        },
        subscription: {
          select: {
            status: true,
            updatedAt: true,
          },
        },
      },
    }),
    prisma.contactSubmission.findMany({
      where: {
        read: false,
        createdAt: { lte: upsellThreshold },
        OR: [
          { message: { startsWith: 'Solicitud de módulo premium:' } },
          { service: { in: Array.from(PREMIUM_FEATURE_KEYS) } },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 4,
      select: {
        id: true,
        company: true,
        name: true,
        service: true,
        message: true,
        createdAt: true,
      },
    }),
    prisma.contactSubmission.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.ticket.findMany({
      where: {
        status: 'RESOLVED',
        updatedAt: { gte: thirtyDaysAgo },
      },
      select: { updatedAt: true },
      orderBy: { updatedAt: 'asc' },
    }),
    prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        priority: true,
        createdAt: true,
        organization: {
          select: { companyName: true },
        },
      },
    }),
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        company: true,
        service: true,
        message: true,
        email: true,
        createdAt: true,
      },
    }),
    prisma.notification.findMany({
      where: {
        taskId: { not: null },
        OR: [
          { title: { contains: 'Aprobada' } },
          { message: { contains: 'ha aprobado' } },
          { message: { contains: 'aprobado' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        message: true,
        actionUrl: true,
        createdAt: true,
        organization: {
          select: { companyName: true },
        },
      },
    }),
  ])

  const userName = session?.user?.name ?? session?.user?.email ?? 'Admin'
  const currentDateLabel = now.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const mrr = activeSubscriptions.reduce((sum, subscription) => sum + subscription.price, 0)
  const arr = mrr * 12
  const primaryCurrency = activeSubscriptions[0]?.currency ?? 'USD'

  const expiringSubscriptions = activeSubscriptions
    .filter((subscription) => {
      if (!subscription.renewalDate) return false
      return subscription.renewalDate >= today && subscription.renewalDate <= upcomingRenewalLimit
    })
    .sort((a, b) => {
      const aDate = a.renewalDate?.getTime() ?? Number.MAX_SAFE_INTEGER
      const bDate = b.renewalDate?.getTime() ?? Number.MAX_SAFE_INTEGER
      return aDate - bDate
    })
    .slice(0, 4)

  const inactiveOrganizations = organizations
    .filter((organization) => organization.subscription?.status === 'ACTIVE')
    .map((organization) => ({
      id: organization.id,
      companyName: organization.companyName,
      lastActivity: getLastActivityDate(organization),
    }))
    .filter((organization) => organization.lastActivity < inactiveThreshold)
    .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
    .slice(0, 4)

  const alerts = [
    ...expiringSubscriptions.map((subscription) => ({
      id: `subscription-${subscription.id}`,
      tone: 'danger' as const,
      badge: 'Renovación < 7 días',
      title: `${subscription.organization.companyName} renueva pronto`,
      description: `La suscripción activa vence el ${subscription.renewalDate?.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
      })}.`,
      href: '/admin/clients',
      actionLabel: 'Ver cliente',
    })),
    ...urgentUnansweredTickets.map((ticket) => ({
      id: `urgent-ticket-${ticket.id}`,
      tone: 'danger' as const,
      badge: 'Urgente sin respuesta',
      title: `${ticket.organization.companyName} abrió un ticket urgente`,
      description: ticket.title,
      href: `/admin/tickets/${ticket.id}`,
      actionLabel: 'Responder ticket',
    })),
    ...inactiveOrganizations.map((organization) => ({
      id: `inactive-client-${organization.id}`,
      tone: 'warning' as const,
      badge: 'Sin actividad > 30 días',
      title: `${organization.companyName} necesita reactivación`,
      description: `Último movimiento registrado el ${organization.lastActivity.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
      })}.`,
      href: '/admin/clients',
      actionLabel: 'Ver cliente',
    })),
    ...oldUpsellLeads.map((lead) => ({
      id: `upsell-${lead.id}`,
      tone: 'warning' as const,
      badge: 'Upsell > 48 hs',
      title: `${lead.company ?? lead.name} espera contacto comercial`,
      description: getUpsellModuleName(lead),
      href: '/admin/leads',
      actionLabel: 'Abrir lead',
    })),
  ]

  const trendSeed = Array.from({ length: 30 }, (_, index) => {
    const date = addDays(thirtyDaysAgo, index)
    const key = date.toISOString().slice(0, 10)

    return {
      key,
      dateLabel: date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
      }),
      fullDate: date.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      leads: 0,
      resolvedTickets: 0,
    }
  })

  const trendMap = new Map(trendSeed.map((entry) => [entry.key, entry]))

  for (const lead of leadTrendRows) {
    const key = lead.createdAt.toISOString().slice(0, 10)
    const entry = trendMap.get(key)
    if (entry) entry.leads += 1
  }

  for (const ticket of resolvedTicketsTrendRows) {
    const key = ticket.updatedAt.toISOString().slice(0, 10)
    const entry = trendMap.get(key)
    if (entry) entry.resolvedTickets += 1
  }

  const growthData = trendSeed.map((entry) => ({
    dateLabel: entry.dateLabel,
    fullDate: entry.fullDate,
    leads: entry.leads,
    resolvedTickets: entry.resolvedTickets,
  }))

  const activityFeed = [
    ...recentTickets.map((ticket) => ({
      id: `ticket-${ticket.id}`,
      kind: 'ticket' as const,
      title: `${ticket.organization.companyName} abrió un ticket ${ticket.priority}`,
      description: ticket.title,
      href: `/admin/tickets/${ticket.id}`,
      categoryLabel: 'Tickets',
      createdAt: ticket.createdAt.toISOString(),
    })),
    ...recentLeads.map((lead) => ({
      id: `lead-${lead.id}`,
      kind: isUpsellLead(lead) ? ('upsell' as const) : ('lead' as const),
      title: isUpsellLead(lead)
        ? `${lead.company ?? lead.name} solicitó módulo ${getUpsellModuleName(lead)}`
        : `Nuevo lead desde el formulario de contacto`,
      description: lead.company
        ? `${lead.company} · ${lead.email}`
        : `${lead.name} · ${lead.email}`,
      href: '/admin/leads',
      categoryLabel: 'Leads',
      createdAt: lead.createdAt.toISOString(),
    })),
    ...recentApprovals.map((approval) => ({
      id: `approval-${approval.id}`,
      kind: 'approval' as const,
      title: `${approval.organization?.companyName ?? 'Cliente'} aprobó una entrega`,
      description: approval.message,
      href: approval.actionUrl ?? '/admin/projects',
      categoryLabel: 'Proyectos',
      createdAt: approval.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <AdminDashboard
      userName={userName}
      currentDateLabel={currentDateLabel}
      primaryCurrency={primaryCurrency}
      mrr={mrr}
      arr={arr}
      activeSubscriptionsCount={activeSubscriptions.length}
      activeClients={activeSubscriptions.length}
      projectsInProgress={projectsInProgress}
      unresolvedTickets={unresolvedTickets}
      newLeadsThisWeek={newLeadsThisWeek}
      alerts={alerts}
      growthData={growthData}
      activityFeed={activityFeed}
    />
  )
}
