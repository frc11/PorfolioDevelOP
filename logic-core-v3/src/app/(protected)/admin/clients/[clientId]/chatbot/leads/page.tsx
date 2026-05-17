import { notFound } from 'next/navigation'
import { listLeadsByOrgSlug } from '@/modules/chatbot/index.server'
import { LeadsTable } from '@/modules/chatbot/components/dashboards/LeadsTable'

export default async function ChatbotLeads({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const orgSlug = clientId
  const leads = await listLeadsByOrgSlug(orgSlug, 100)

  if (!leads) notFound()

  return <LeadsTable leads={leads} />
}
