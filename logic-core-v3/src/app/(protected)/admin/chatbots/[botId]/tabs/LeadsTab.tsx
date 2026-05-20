'use client'

import { LeadsTable } from '@/modules/chatbot/components/dashboards/LeadsTable'
import type { LeadItem } from '../BotDetailClient'

interface Props {
  leads: LeadItem[]
}

export function LeadsTab({ leads }: Props) {
  const mapped = leads.map(l => ({
    id: l.id,
    name: l.name ?? '',
    email: l.email,
    phone: l.phone,
    intent: l.intent ?? '',
    message: l.message ?? '',
    status: l.status,
    capturedAt: l.capturedAt,
    conversation: l.conversation,
  }))

  return <LeadsTable leads={mapped} />
}
