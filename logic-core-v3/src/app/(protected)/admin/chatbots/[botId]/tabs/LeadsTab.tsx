'use client'

import { LeadsTable } from '@/modules/chatbot/components/dashboards/LeadsTable'
import { ConvertChatbotLeadButton } from './ConvertChatbotLeadButton'
import type { LeadItem } from '../BotDetailClient'

interface Props {
  leads: LeadItem[]
  slug: string
}

export function LeadsTab({ leads, slug }: Props) {
  const mapped = leads.map(l => ({
    id: l.id,
    name: l.name ?? '',
    email: l.email,
    phone: l.phone,
    intent: l.intent ?? '',
    message: l.message ?? '',
    status: l.status,
    capturedAt: l.capturedAt,
    convertedToOsLeadId: l.convertedToOsLeadId,
    conversation: l.conversation,
  }))

  // Convertir a Lead CRM solo para el bot propio de develOP (criterio decidido)
  // y solo en admin (este wrapper solo se monta en el detalle admin).
  const canConvert = slug === 'develop'

  return (
    <LeadsTable
      leads={mapped}
      renderRowAction={
        canConvert
          ? lead => (
              <ConvertChatbotLeadButton
                leadId={lead.id}
                convertedToOsLeadId={lead.convertedToOsLeadId ?? null}
              />
            )
          : undefined
      }
    />
  )
}
