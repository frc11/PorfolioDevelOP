import type { ChatbotLead } from '@prisma/client'

/**
 * B5.8 / EV.5 — Payload que se manda a n8n cuando se captura un lead.
 *
 * v2.0 (EV.5): SUPERSET estricto de v1.0. Todos los campos v1 se conservan
 * con el mismo nombre, tipo y semántica. Se AGREGAN: `_version` bumpeado a
 * "2.0", `verticalPack` (clave del pack del bot), y `signalsV2` (señales del
 * pack con puntos — desde `ChatbotLead.signals` EV.2). Un workflow n8n que hoy
 * lee el payload v1 sigue funcionando sin tocar nada.
 *
 * NO incluye:
 *  - scoreSignals raw (jerga interna de scoring B5.4).
 *  - internalNotes (notas privadas del dueño).
 *  - notificationSent / notificationSentAt (estado interno de emails).
 *  - updatedAt (estado interno).
 */
const PAYLOAD_VERSION = '2.0' as const

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
  /** Señales legacy — 4 booleanos v1, intactos para retro-compatibilidad. */
  signals: {
    requestedAppointment: boolean
    mentionedFinancing: boolean
    mentionedTradeIn: boolean
    askedSpecificModel: boolean
  }
  channel: string | null
  /** EV.5 v2 — clave del pack vertical del bot que capturó el lead. */
  verticalPack: string
  /**
   * EV.5 v2 — señales del pack con puntos, desde ChatbotLead.signals (EV.2).
   * null para leads capturados antes de EV.3 (dual-write no aplicado aún).
   */
  signalsV2: Record<string, { value: boolean; points: number }> | null
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
  | 'signals' // EV.5 — Json? desde EV.2; null en leads legacy pre-EV.3
>

interface OrgInput {
  id: string
  slug: string
}

export function buildLeadPayload(
  lead: LeadInput,
  org: OrgInput,
  verticalPack = 'base',
): LeadWebhookPayload {
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
    // Señales legacy — mismo shape que v1 (retro-compatible).
    signals: {
      requestedAppointment: lead.requestedAppointment,
      mentionedFinancing: lead.mentionedFinancing,
      mentionedTradeIn: lead.mentionedTradeIn,
      askedSpecificModel: lead.askedSpecificModel,
    },
    channel: lead.channel,
    // EV.5 v2 additions.
    verticalPack,
    // ChatbotLead.signals es JsonValue. En runtime es el output de buildSignalsSnapshot:
    // Record<string, {value: boolean; points: number}>. Cast necesario al cruzar
    // el boundary de Prisma Json → tipo de dominio.
    signalsV2: lead.signals as unknown as Record<string, { value: boolean; points: number }> | null,
  }
}
