'use client'

import { KnowledgeBaseEditor } from '@/modules/chatbot/components/admin/KnowledgeBaseEditor'
import type { BotWithDetails } from '../BotDetailClient'

interface Props {
  bot: BotWithDetails
}

export function KnowledgeTab({ bot }: Props) {
  const initialData = {
    businessInfo: bot.knowledgeBase?.businessInfo ?? '',
    servicesOrProducts: bot.knowledgeBase?.servicesOrProducts ?? '',
    faq: bot.knowledgeBase?.faq ?? '',
    policies: bot.knowledgeBase?.policies ?? '',
    salesGuidance: bot.knowledgeBase?.salesGuidance ?? '',
    toneExamples: bot.knowledgeBase?.toneExamples ?? '',
    forbiddenStatements: bot.knowledgeBase?.forbiddenStatements ?? '',
  }

  return (
    <KnowledgeBaseEditor
      botConfigId={bot.id}
      initialData={initialData}
      orgSlug={bot.organization.slug}
      botName={bot.botName}
      tone={bot.tone ?? undefined}
      companyName={bot.organization.companyName}
    />
  )
}
