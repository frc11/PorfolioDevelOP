import { notFound } from 'next/navigation'
import { getBotByOrgSlug } from '@/modules/chatbot/index.server'
import { KnowledgeBaseEditor } from '@/modules/chatbot'

export default async function ChatbotKnowledgePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const data = await getBotByOrgSlug(orgSlug)
  if (!data?.bot.knowledgeBase) notFound()

  return (
    <KnowledgeBaseEditor
      botConfigId={data.bot.id}
      initialData={data.bot.knowledgeBase}
      orgSlug={orgSlug}
    />
  )
}
