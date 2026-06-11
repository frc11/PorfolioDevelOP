import { redirect } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { Bot } from 'lucide-react'
import { getClientChatbotSession, countHotNewLeadsForOrg } from '@/modules/chatbot/index.server'
import { ClientDashboardTabs } from '@/modules/chatbot/components/dashboard/ClientDashboardTabs'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { PageHeader } from '@/components/ui'

// B5.7 — comparte cache-key con el layout padre (`dashboard-hot-leads-count`)
// para que el badge del sidebar y el dot de la tab "Leads" usen la misma
// fuente sin doble query.
function getCachedHotLeadsCount(orgId: string) {
  return unstable_cache(
    async () => countHotNewLeadsForOrg(orgId),
    ['dashboard-hot-leads-count', orgId],
    { revalidate: 30, tags: [`hot-leads-count:${orgId}`] }
  )()
}

export default async function ChatbotDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getClientChatbotSession()

  if (!session) {
    redirect('/dashboard')
  }

  const [hotLeadsCount, plan] = await Promise.all([
    getCachedHotLeadsCount(session.organization.id),
    getPlanForOrg(session.organization.id),
  ])

  // P0.3 — El dot rosa "X calientes" es una señal de clasificación. Si el plan
  // no incluye priorización, no se muestra (mismo gate que los chips de la lista).
  const visibleHotLeadsCount = planAllows(plan, 'leadScoring') ? hotLeadsCount : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Mi Chatbot"
        title={session.bot.botName}
        description={
          session.bot.isActive
            ? 'Activo · respondiendo a tus visitantes'
            : 'Pausado · no responde hasta que lo reactives'
        }
        icon={Bot}
      />

      <ClientDashboardTabs hotLeadsCount={visibleHotLeadsCount} />

      {children}
    </div>
  )
}
