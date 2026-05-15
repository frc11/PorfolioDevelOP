import { notFound } from 'next/navigation'
import { getBotByOrgSlug, listLeadsByOrgSlug } from '@/modules/chatbot/index.server'
import { LeadsTable } from '@/modules/chatbot'

export default async function ChatbotLeadsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const data = await getBotByOrgSlug(orgSlug)
  if (!data) notFound()

  const leads = await listLeadsByOrgSlug(orgSlug, 100)
  return <LeadsTable leads={leads} />
}
