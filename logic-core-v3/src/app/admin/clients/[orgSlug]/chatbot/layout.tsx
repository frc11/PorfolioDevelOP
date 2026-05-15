import { notFound } from 'next/navigation'
import { getBotByOrgSlug } from '@/modules/chatbot/index.server'
import { ClientChatbotTabs } from '@/modules/chatbot/components/admin/ClientChatbotTabs'

export default async function ChatbotLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const data = await getBotByOrgSlug(orgSlug)

  if (!data) notFound()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            Cliente / Chatbot
          </p>
          <h1 className="text-2xl font-semibold text-zinc-100">
            {data.organization.companyName}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Bot: <span className="text-cyan-400">{data.bot.botName}</span> ·
            Status: <span className={data.bot.isActive ? 'text-emerald-400' : 'text-zinc-500'}>
              {data.bot.isActive ? 'Activo' : 'Pausado'}
            </span>
          </p>
        </div>
      </header>

      <ClientChatbotTabs orgSlug={orgSlug} />

      <div>{children}</div>
    </div>
  )
}
