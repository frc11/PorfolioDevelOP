import { redirect } from 'next/navigation'
import { getClientChatbotSession } from '@/modules/chatbot/index.server'
import { ClientDashboardTabs } from '@/modules/chatbot/components/dashboard/ClientDashboardTabs'

export default async function ChatbotDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getClientChatbotSession()

  if (!session) {
    redirect('/dashboard')
  }

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

      <ClientDashboardTabs />

      {children}
    </div>
  )
}
