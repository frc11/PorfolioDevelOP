import { notFound } from 'next/navigation'
import { getBotByOrgSlug } from '@/modules/chatbot/index.server'
import { BotConfigEditor } from '@/modules/chatbot'

export default async function ChatbotConfigPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const data = await getBotByOrgSlug(orgSlug)
  if (!data) notFound()

  return <BotConfigEditor initial={{ ...data.bot, botConfigId: data.bot.id } as any} orgSlug={orgSlug} />
}
