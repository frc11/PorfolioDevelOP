import type { ChatbotLead } from '@prisma/client'

/**
 * B5.8 — Payload que se manda a n8n cuando se captura un lead.
 *
 * Solo campos legibles y útiles para que el cliente arme su flujo en n8n.
 * NO incluye:
 *  - scoreSignals raw (jerga interna, lógica nuestra de scoring B5.4).
 *  - internalNotes (notas privadas del dueño en su dashboard).
 *  - notificationSent / notificationSentAt (estado interno de emails).
 *  - updatedAt (estado interno).
 *
 * Versionado: el payload lleva `_version`. Si más adelante cambiamos el shape
 * (ej. dividimos `contact` en sub-objetos, agregamos `appointment` estructurado),
 * lo hacemos bumpeando la versión para no romper los flujos n8n del cliente.
 */
const PAYLOAD_VERSION = '1.0' as const

export interface LeadWebhookPayload {
  _version: typeof PAYLOAD_VERSION
  leadId: string
  capturedAt: string // ISO 8601 UTC
  organization: {
    id: string
    slug: string
  }
  contact: {
    name: string | null
    email: string | null
    phone: string | null
  }
  intent: string | null
  message: string | null
  classification: ChatbotLead['classification']
  category: ChatbotLead['category']
  signals: {
    requestedAppointment: boolean
    mentionedFinancing: boolean
    mentionedTradeIn: boolean
    askedSpecificModel: boolean
  }
  channel: string | null
}

type LeadInput = Pick<
  ChatbotLead,
  | 'id'
  | 'name'
  | 'email'
  | 'phone'
  | 'intent'
  | 'message'
  | 'classification'
  | 'category'
  | 'requestedAppointment'
  | 'mentionedFinancing'
  | 'mentionedTradeIn'
  | 'askedSpecificModel'
  | 'channel'
  | 'capturedAt'
>

interface OrgInput {
  id: string
  slug: string
}

export function buildLeadPayload(lead: LeadInput, org: OrgInput): LeadWebhookPayload {
  return {
    _version: PAYLOAD_VERSION,
    leadId: lead.id,
    capturedAt: lead.capturedAt.toISOString(),
    organization: {
      id: org.id,
      slug: org.slug,
    },
    contact: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    },
    intent: lead.intent,
    message: lead.message,
    classification: lead.classification,
    category: lead.category,
    signals: {
      requestedAppointment: lead.requestedAppointment,
      mentionedFinancing: lead.mentionedFinancing,
      mentionedTradeIn: lead.mentionedTradeIn,
      askedSpecificModel: lead.askedSpecificModel,
    },
    channel: lead.channel,
  }
}
