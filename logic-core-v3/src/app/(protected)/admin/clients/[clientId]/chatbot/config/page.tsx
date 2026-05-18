import { notFound } from 'next/navigation'
import { getBotByOrgSlug } from '@/modules/chatbot/index.server'
import { BotConfigEditor } from '@/modules/chatbot/components/admin/BotConfigEditor'

export default async function ChatbotConfig({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const orgSlug = clientId
  const data = await getBotByOrgSlug(orgSlug)

  if (!data) notFound()

  return <BotConfigEditor initial={{
    ...data.bot as any,
    botConfigId: data.bot.id,
    quickReplies: (data.bot.quickReplies as any) || [],
    leadNotificationEmail: data.organization?.leadNotificationEmail || null,
    leadNotificationMode: data.organization?.leadNotificationMode || 'DISABLED',
  }} orgSlug={orgSlug} />
}
