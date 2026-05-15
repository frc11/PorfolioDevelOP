import { notFound } from 'next/navigation'
import {
  getBotByOrgSlug,
  listLeadsByOrgSlug,
  listConversationsByOrgSlug,
  getUsageByOrgSlug,
} from '@/modules/chatbot/index.server'
import { StatCard } from '@/modules/chatbot/components/admin/StatCard'

export default async function ChatbotOverview({
  params,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const [bot, leads, conversations, usage] = await Promise.all([
    getBotByOrgSlug(orgSlug),
    listLeadsByOrgSlug(orgSlug, 5),
    listConversationsByOrgSlug(orgSlug, 5),
    getUsageByOrgSlug(orgSlug),
  ])

  if (!bot) notFound()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conversaciones este mes"
          value={usage?.conversationsCount ?? 0}
          accent="cyan"
        />
        <StatCard
          label="Leads capturados"
          value={leads.length}
          accent="emerald"
        />
        <StatCard
          label="Tokens consumidos"
          value={(usage?.tokensIn ?? 0) + (usage?.tokensOut ?? 0)}
          format="compact"
          accent="violet"
        />
        <StatCard
          label="Costo estimado"
          value={Number(usage?.costUsd ?? 0)}
          format="currency"
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Leads recientes</h3>
          {leads.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin leads aún.</p>
          ) : (
            <ul className="space-y-2">
              {leads.slice(0, 5).map((lead) => (
                <li key={lead.id} className="text-sm text-zinc-400 flex justify-between">
                  <span>{lead.name}</span>
                  <span className="text-xs text-zinc-600">{lead.intent}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Conversaciones recientes</h3>
          {conversations.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin conversaciones aún.</p>
          ) : (
            <ul className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <li key={conv.id} className="text-sm text-zinc-400 flex justify-between">
                  <span className="truncate max-w-[200px]">{conv.sessionId}</span>
                  <span className="text-xs text-zinc-600">{conv._count.messages} msgs</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
