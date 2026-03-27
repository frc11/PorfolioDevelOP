import { prisma } from '@/lib/prisma'
import { AdminSettingsConsole } from '@/components/admin/AdminSettingsConsole'
import { DEFAULT_AGENCY_SETTINGS } from '@/lib/agency-settings'
import { estimateLastLoginAt } from '@/lib/client-health'
import { PREMIUM_FEATURE_CATALOG, PREMIUM_FEATURE_DEFAULTS } from '@/lib/premium-features'

function maskValue(value: string | undefined) {
  if (!value) return null
  return `••••••••${value.slice(-4)}`
}

export default async function SettingsPage() {
  const [settings, pricingFromDb, teamMembers] = await Promise.all([
    prisma.agencySettings.findFirst({ orderBy: { updatedAt: 'desc' } }),
    prisma.modulePricing.findMany(),
    prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        sessions: {
          orderBy: { expires: 'desc' },
          take: 1,
          select: { expires: true },
        },
      },
    }),
  ])

  const pricingMap = new Map(pricingFromDb.map((item) => [item.featureKey, item]))

  return (
    <AdminSettingsConsole
      agencyName={settings?.agencyName ?? DEFAULT_AGENCY_SETTINGS.agencyName}
      initialSettings={{
        contactEmail: settings?.contactEmail ?? DEFAULT_AGENCY_SETTINGS.contactEmail,
        contactWhatsapp: settings?.contactWhatsapp ?? DEFAULT_AGENCY_SETTINGS.contactWhatsapp,
        websiteUrl: settings?.websiteUrl ?? DEFAULT_AGENCY_SETTINGS.websiteUrl,
        alertWebhookUrl: settings?.alertWebhookUrl ?? DEFAULT_AGENCY_SETTINGS.alertWebhookUrl,
        alertOnTickets: settings?.alertOnTickets ?? DEFAULT_AGENCY_SETTINGS.alertOnTickets,
        alertOnLeads: settings?.alertOnLeads ?? DEFAULT_AGENCY_SETTINGS.alertOnLeads,
        alertOnChurn: settings?.alertOnChurn ?? DEFAULT_AGENCY_SETTINGS.alertOnChurn,
        alertOnExpiringSubscriptions:
          settings?.alertOnExpiringSubscriptions ?? DEFAULT_AGENCY_SETTINGS.alertOnExpiringSubscriptions,
        alertOnClientMessages:
          settings?.alertOnClientMessages ?? DEFAULT_AGENCY_SETTINGS.alertOnClientMessages,
      }}
      integrations={{
        n8n: {
          apiUrl: {
            configured: Boolean(process.env.N8N_API_URL),
            value: process.env.N8N_API_URL ?? '',
            maskedValue: null,
          },
          apiKey: {
            configured: Boolean(process.env.N8N_API_KEY),
            value: '',
            maskedValue: maskValue(process.env.N8N_API_KEY),
          },
          webhook: {
            configured: Boolean(process.env.N8N_CONTACT_WEBHOOK_URL),
            value: process.env.N8N_CONTACT_WEBHOOK_URL ?? '',
            maskedValue: null,
          },
        },
        google: {
          key: {
            configured: Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
            value: '',
            maskedValue: maskValue(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
          },
          docsUrl: 'https://cloud.google.com/iam/docs/keys-create-delete',
        },
        anthropic: {
          key: {
            configured: Boolean(process.env.ANTHROPIC_API_KEY),
            value: '',
            maskedValue: maskValue(process.env.ANTHROPIC_API_KEY),
          },
          model: 'claude-3-5-haiku-20241022',
          estimatedUsage: 'USD 184 estimados',
        },
      }}
      modulePricing={PREMIUM_FEATURE_CATALOG.map((feature) => {
        const pricing = pricingMap.get(feature.key)
        const defaults = PREMIUM_FEATURE_DEFAULTS[feature.key]
        return {
          featureKey: feature.key,
          name: pricing?.name ?? feature.label,
          description: feature.shortDescription,
          price: pricing?.price ?? defaults.price,
          type: pricing?.type ?? defaults.type,
          active: pricing?.active ?? true,
        }
      })}
      teamMembers={teamMembers.map((member) => {
        const lastAccess = estimateLastLoginAt(member.sessions[0]?.expires)

        return {
          id: member.id,
          name: member.name ?? 'Sin nombre',
          email: member.email,
          createdAtLabel: new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(member.createdAt),
          lastAccessLabel: lastAccess
            ? new Intl.DateTimeFormat('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(lastAccess)
            : 'Sin acceso aún',
        }
      })}
    />
  )
}
