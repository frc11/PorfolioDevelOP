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

  // Prisma.Decimal no es serializable a través del límite server→client (RSC).
  // costUsd es el único Decimal de QuotaUsage; lo convertimos a number acá,
  // en el boundary, antes de pasarlo al client component. El resto de los
  // campos (Int/Boolean/DateTime) ya serializan bien.
  //
  // Number() (no .toNumber()): getUsageByOrgSlug pasa por unstable_cache, que
  // serializa el valor cacheado → en un cache HIT costUsd ya no es una instancia
  // Prisma.Decimal (no tiene .toNumber()) sino number/string. Number() es robusto
  // a las tres formas (Decimal | number | string).
  const usageSerialized = usage ? { ...usage, costUsd: Number(usage.costUsd) } : null

  return (
    <ChatbotOverview
      session={session}
      usage={usageSerialized}
      recentLeads={recentLeads}
      recentHandoffs={recentHandoffs}
    />
  )
}
