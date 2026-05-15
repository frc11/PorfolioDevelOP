import { getClientChatbotSession } from '@/modules/chatbot/index.server'
import { listLeadsByOrgSlug } from '@/modules/chatbot/index.server'
import { ClientLeadsTable } from '@/modules/chatbot/components/dashboard/ClientLeadsTable'
import { redirect } from 'next/navigation'

export default async function ClientLeadsPage() {
  const session = await getClientChatbotSession()
  if (!session) redirect('/dashboard')

  const leads = await listLeadsByOrgSlug(session.organization.slug, 200)

  return <ClientLeadsTable leads={leads} />
}
