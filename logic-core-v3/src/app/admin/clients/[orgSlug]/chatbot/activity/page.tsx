import { notFound } from 'next/navigation'
import { getBotByOrgSlug } from '@/modules/chatbot/index.server'
import { ActivityLog } from '@/modules/chatbot'

export default async function ChatbotActivityPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const data = await getBotByOrgSlug(orgSlug)
  if (!data) notFound()

  // ActivityLog acepta botSlug actualmente. Lo pasamos.
  return <ActivityLog slug={data.bot.slug} initialEvents={[]} />
}
