import { resolveOrgId } from '@/lib/preview'
import {
  checkClientHasChatbot,
  getClientChatbotSession,
  getUsageByOrgSlug,
  listLeadsByOrgSlug,
} from '@/modules/chatbot/index.server'
import { ChatbotUpsellLanding, ChatbotOverview } from '@/modules/chatbot'
import { redirect } from 'next/navigation'

export default async function ChatbotDashboardPage() {
  const orgId = await resolveOrgId()
  if (!orgId) redirect('/login')

  const hasActiveChatbot = await checkClientHasChatbot(orgId)

  if (!hasActiveChatbot) {
    return <ChatbotUpsellLanding />
  }

  const session = await getClientChatbotSession()
  if (!session) return <ChatbotUpsellLanding />

  const orgSlug = session.organization.slug
  const [usage, recentLeads] = await Promise.all([
    getUsageByOrgSlug(orgSlug),
    listLeadsByOrgSlug(orgSlug, 5),
  ])

  return <ChatbotOverview session={session} usage={usage} recentLeads={recentLeads} />
}
