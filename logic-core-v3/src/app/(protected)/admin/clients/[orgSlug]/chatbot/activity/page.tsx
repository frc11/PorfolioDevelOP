import { notFound } from 'next/navigation'
import { getBotByOrgSlug } from '@/modules/chatbot/index.server'
import { ActivityLog } from '@/modules/chatbot/components/admin/ActivityLog'

export default async function ChatbotActivity({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const data = await getBotByOrgSlug(orgSlug)

  if (!data) notFound()

  return <ActivityLog slug={data.bot.slug} initialEvents={[]} />
}
