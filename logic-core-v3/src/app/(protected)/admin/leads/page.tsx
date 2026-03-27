import { LeadsCRM, type CRMLead } from '@/components/admin/LeadsCRM'
import { prisma } from '@/lib/prisma'
import { PREMIUM_FEATURE_KEYS, PREMIUM_FEATURE_LABELS } from '@/lib/premium-features'
import type { LeadStatus } from '@/lib/actions/leads'

const SERVICE_LABELS: Record<string, string> = {
  web: 'Desarrollo Web',
  software: 'Software a medida',
  automation: 'Automatización',
  automatizacion: 'Automatización',
  ai: 'IA',
  ia: 'IA',
  other: 'Otro',
}

function isUpsellLead(lead: { service: string | null; message: string }) {
  return (
    lead.message.startsWith('Solicitud de módulo premium:') ||
    (lead.service !== null && PREMIUM_FEATURE_KEYS.includes(lead.service as (typeof PREMIUM_FEATURE_KEYS)[number]))
  )
}

function upsellModuleName(lead: { service: string | null; message: string }) {
  const match = lead.message.match(/^Solicitud de módulo premium:\s*(.+)$/)
  if (match) return match[1]

  if (lead.service && PREMIUM_FEATURE_KEYS.includes(lead.service as (typeof PREMIUM_FEATURE_KEYS)[number])) {
    return PREMIUM_FEATURE_LABELS[lead.service as keyof typeof PREMIUM_FEATURE_LABELS]
  }

  return lead.service ?? 'Módulo premium'
}

function buildConvertHref(lead: {
  company: string | null
  name: string
  email: string
  phone: string | null
}) {
  const params = new URLSearchParams({
    company: lead.company ?? lead.name,
    name: lead.name,
    email: lead.email,
  })

  if (lead.phone) {
    params.set('phone', lead.phone)
  }

  return `/admin/clients/new?${params.toString()}`
}

export default async function LeadsPage() {
  const leads = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const serializedLeads: CRMLead[] = leads.map((lead) => {
    const type = isUpsellLead(lead) ? 'upsell' : 'external'
    const normalizedStatus = (lead.leadStatus ?? (lead.read ? 'CONTACTADO' : 'NUEVO')) as LeadStatus

    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      service: lead.service,
      message: lead.message,
      createdAt: lead.createdAt.toISOString(),
      read: lead.read,
      leadStatus: normalizedStatus,
      leadNotes: lead.leadNotes,
      type,
      typeLabel: type === 'upsell' ? 'Intento de upsell' : 'Contacto externo',
      serviceLabel: type === 'upsell'
        ? upsellModuleName(lead)
        : (lead.service ? SERVICE_LABELS[lead.service] ?? lead.service : 'Sin especificar'),
      convertHref: type === 'external' ? buildConvertHref(lead) : null,
    }
  })

  return <LeadsCRM initialLeads={serializedLeads} />
}
