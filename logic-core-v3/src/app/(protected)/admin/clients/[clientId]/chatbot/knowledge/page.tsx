import { notFound } from 'next/navigation'
import { getBotByOrgSlug } from '@/modules/chatbot/index.server'
import { KnowledgeBaseEditor } from '@/modules/chatbot/components/admin/KnowledgeBaseEditor'

export default async function ChatbotKnowledge({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const orgSlug = clientId
  const data = await getBotByOrgSlug(orgSlug)

  if (!data || !data.bot.knowledgeBase) notFound()

  return <KnowledgeBaseEditor botConfigId={data.bot.id} initialData={data.bot.knowledgeBase} orgSlug={orgSlug} />
}
