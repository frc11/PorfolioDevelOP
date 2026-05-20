import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getBotByOrgSlug,
  listLeadsByOrgSlug,
  listConversationsByOrgSlug,
  getUsageByOrgSlug,
} from '@/modules/chatbot/index.server'
import { StatCard } from '@/components/ui'

export default async function ChatbotOverview({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const orgSlug = clientId

  // Paralelizar queries
  const [bot, leads, conversations, usage] = await Promise.all([
    getBotByOrgSlug(orgSlug),
    listLeadsByOrgSlug(orgSlug, 5),
    listConversationsByOrgSlug(orgSlug, 5),
    getUsageByOrgSlug(orgSlug),
  ])

  if (!bot) notFound()

  return (
    <div className="space-y-6">
      {bot.bot?.id && (
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-3">
          <p className="text-xs text-cyan-300">
            💡 Esta vista se va a deprecar. Ahora gestionás chatbots desde{' '}
            <Link href={`/admin/chatbots/${bot.bot.id}`} className="underline underline-offset-2">
              /admin/chatbots/[bot]
            </Link>
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conversaciones este mes"
          value={usage?.conversationsCount ?? 0}
          color="cyan"
        />
        <StatCard
          label="Leads capturados"
          value={leads.length}
          color="emerald"
        />
        <StatCard
          label="Tokens consumidos"
          value={(usage?.tokensIn ?? 0) + (usage?.tokensOut ?? 0)}
          format="compact"
          color="violet"
        />
        <StatCard
          label="Costo estimado"
          value={Number(usage?.costUsd ?? 0)}
          format="currency"
          color="amber"
        />
      </div>
    </div>
  )
}
