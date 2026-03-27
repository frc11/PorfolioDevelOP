import { SubscriptionStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type AlertEvent = {
  type:
    | 'TICKET_URGENT'
    | 'LEAD_UPSELL'
    | 'LEAD_EXTERNAL'
    | 'CLIENT_INACTIVE'
    | 'SUBSCRIPTION_EXPIRING'
    | 'MESSAGE_NEW'
  clientName: string
  detail: string
  priority?: string
  link?: string
}

type AlertToggleKey =
  | 'alertOnTickets'
  | 'alertOnLeads'
  | 'alertOnChurn'
  | 'alertOnExpiringSubscriptions'
  | 'alertOnClientMessages'

const EVENT_CONFIG: Record<AlertEvent['type'], { label: string; toggle: AlertToggleKey }> = {
  TICKET_URGENT: { label: 'Ticket urgente', toggle: 'alertOnTickets' },
  LEAD_UPSELL: { label: 'Lead de upsell', toggle: 'alertOnLeads' },
  LEAD_EXTERNAL: { label: 'Lead externo', toggle: 'alertOnLeads' },
  CLIENT_INACTIVE: { label: 'Cliente inactivo', toggle: 'alertOnChurn' },
  SUBSCRIPTION_EXPIRING: {
    label: 'Suscripción por vencer',
    toggle: 'alertOnExpiringSubscriptions',
  },
  MESSAGE_NEW: { label: 'Nuevo mensaje de cliente', toggle: 'alertOnClientMessages' },
}

type InactiveOrganization = {
  id: string
  companyName: string
  createdAt: Date
  messages: Array<{ createdAt: Date }>
  tickets: Array<{ updatedAt: Date }>
  invoices: Array<{ updatedAt: Date }>
  clientAssets: Array<{ updatedAt: Date }>
  brandProfile: { updatedAt: Date } | null
  subscription: { updatedAt: Date; status: SubscriptionStatus } | null
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

function toAbsoluteLink(link: string | undefined) {
  if (!link) return null
  if (/^https?:\/\//i.test(link)) return link
  return `${getBaseUrl()}${link.startsWith('/') ? link : `/${link}`}`
}

function formatAlertMessage(event: AlertEvent) {
  const lines = [
    '🔔 develOP Alert',
    '━━━━━━━━━━━━━━',
    `📌 ${EVENT_CONFIG[event.type].label}`,
    `🏢 Cliente: ${event.clientName}`,
    `💬 ${event.detail}`,
  ]

  if (event.priority?.trim()) {
    lines.push(`⚡ Prioridad: ${event.priority.trim()}`)
  }

  const absoluteLink = toAbsoluteLink(event.link)
  if (absoluteLink) {
    lines.push(`🔗 ${absoluteLink}`)
  }

  return lines.join('\n')
}

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

function getLastActivityDate(organization: InactiveOrganization) {
  const candidates: Date[] = [organization.createdAt]

  for (const date of [
    organization.messages[0]?.createdAt,
    organization.tickets[0]?.updatedAt,
    organization.invoices[0]?.updatedAt,
    organization.clientAssets[0]?.updatedAt,
    organization.brandProfile?.updatedAt,
    organization.subscription?.updatedAt,
  ]) {
    if (date) candidates.push(date)
  }

  return new Date(Math.max(...candidates.map((value) => value.getTime())))
}

export async function sendAgencyAlert(event: AlertEvent): Promise<void> {
  try {
    const settings = await prisma.agencySettings.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        alertWebhookUrl: true,
        alertOnTickets: true,
        alertOnLeads: true,
        alertOnChurn: true,
        alertOnExpiringSubscriptions: true,
        alertOnClientMessages: true,
      },
    })

    if (!settings) return

    const webhookUrl = settings?.alertWebhookUrl?.trim()
    if (!webhookUrl) return

    const toggleKey = EVENT_CONFIG[event.type].toggle
    if (!settings[toggleKey]) return

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: formatAlertMessage(event) }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      console.error(
        `[alerts] Webhook respondió ${response.status} ${response.statusText} para ${event.type}.`
      )
    }
  } catch (error) {
    console.error(`[alerts] No se pudo enviar la alerta ${event.type}:`, error)
  }
}

export async function sendTestAgencyAlert(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const settings = await prisma.agencySettings.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { alertWebhookUrl: true },
    })

    if (!settings?.alertWebhookUrl?.trim()) {
      return { success: false, error: 'Configurá una URL de webhook primero.' }
    }

    const response = await fetch(settings.alertWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: formatAlertMessage({
          type: 'TICKET_URGENT',
          clientName: 'Cliente de prueba',
          detail: 'Mensaje de prueba enviado desde Configuración.',
          priority: 'HIGH',
          link: '/admin/settings',
        }),
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    })

    if (!response.ok) {
      return {
        success: false,
        error: `El webhook respondió ${response.status} ${response.statusText}.`,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No se pudo enviar la alerta de prueba.',
    }
  }
}

export async function runPeriodicAgencyAlerts(): Promise<{
  inactiveClients: number
  expiringSubscriptions: number
}> {
  const now = new Date()
  const today = startOfDay(now)
  const inactiveThreshold = addDays(today, -30)
  const upcomingRenewalLimit = addDays(today, 7)

  const [organizations, subscriptions] = await Promise.all([
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
    prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        renewalDate: {
          gte: today,
          lte: upcomingRenewalLimit,
        },
      },
      orderBy: { renewalDate: 'asc' },
      select: {
        planName: true,
        renewalDate: true,
        organization: {
          select: {
            id: true,
            companyName: true,
          },
        },
      },
    }),
  ])

  const inactiveOrganizations = organizations
    .filter((organization) => organization.subscription?.status === 'ACTIVE')
    .map((organization) => ({
      id: organization.id,
      companyName: organization.companyName,
      lastActivity: getLastActivityDate(organization),
    }))
    .filter((organization) => organization.lastActivity < inactiveThreshold)

  await Promise.all([
    ...inactiveOrganizations.map((organization) =>
      sendAgencyAlert({
        type: 'CLIENT_INACTIVE',
        clientName: organization.companyName,
        detail: `Último movimiento registrado el ${organization.lastActivity.toLocaleDateString('es-AR')}.`,
        link: `/admin/clients/${organization.id}`,
      })
    ),
    ...subscriptions
      .filter((subscription) => subscription.renewalDate)
      .map((subscription) =>
        sendAgencyAlert({
          type: 'SUBSCRIPTION_EXPIRING',
          clientName: subscription.organization.companyName,
          detail: `El plan ${subscription.planName} vence el ${subscription.renewalDate?.toLocaleDateString('es-AR')}.`,
          link: `/admin/clients/${subscription.organization.id}`,
        })
      ),
  ])

  return {
    inactiveClients: inactiveOrganizations.length,
    expiringSubscriptions: subscriptions.length,
  }
}
