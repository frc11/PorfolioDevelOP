import { redirect } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { getClientChatbotSession, countHotNewLeadsForOrg } from '@/modules/chatbot/index.server'
import { ClientDashboardTabs } from '@/modules/chatbot/components/dashboard/ClientDashboardTabs'

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

  const hotLeadsCount = await getCachedHotLeadsCount(session.organization.id)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Mi Chatbot</p>
        <h1 className="text-2xl font-semibold text-zinc-100">{session.bot.botName}</h1>
        <p className="text-sm text-zinc-400 mt-1">
          {session.bot.isActive ? (
            <span className="text-emerald-400">● Activo</span>
          ) : (
            <span className="text-zinc-500">● Pausado</span>
          )}
        </p>
      </header>

      <ClientDashboardTabs hotLeadsCount={hotLeadsCount} />

      {children}
    </div>
  )
}
