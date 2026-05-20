import { resolveOrgId } from '@/lib/preview'
import {
  checkClientHasChatbot,
  getClientChatbotSession,
  getUsageByOrgSlug,
  listLeadsByOrgSlug,
  listRecentHandoffsByOrgSlug,
} from '@/modules/chatbot/index.server'
import { ChatbotUpsellLanding, ChatbotOverview } from '@/modules/chatbot'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

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
  const [usage, recentLeads, recentHandoffs] = await Promise.all([
    getUsageByOrgSlug(orgSlug),
    listLeadsByOrgSlug(orgSlug, 5),
    listRecentHandoffsByOrgSlug(orgSlug, 10),
  ])

  return <ChatbotOverview session={session} usage={usage} recentLeads={recentLeads} recentHandoffs={recentHandoffs} />
}
