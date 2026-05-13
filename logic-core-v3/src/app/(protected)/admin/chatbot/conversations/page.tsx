import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { listConversationsForBot, getMonthlyUsageForBot } from '@/modules/chatbot/server/admin/queries'
import { ConversationsTable } from '@/modules/chatbot/components/dashboards/ConversationsTable'

export default async function AdminConversationsPage() {
  const session = await auth()

  if (session?.user?.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  const bot = await prisma.botConfig.findUnique({ where: { slug: 'develop' } })
  if (!bot) return <div className="p-8 text-red-400">Bot no encontrado.</div>

  const [conversations, usage] = await Promise.all([
    listConversationsForBot(bot.id),
    getMonthlyUsageForBot(bot.id),
  ])

  return (
    <div className="min-h-screen text-white flex flex-col gap-8">
      <h1 className="text-2xl font-light">Conversaciones del chatbot</h1>

      {/* Usage card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Conversaciones este mes" value={`${usage?.conversationsCount ?? 0} / ${bot.monthlyQuota}`} />
        <Card label="Mensajes (recientes)" value={String(conversations.reduce((acc, c) => acc + c._count.messages, 0))} />
        <Card label="Tokens consumidos" value={`${((usage?.tokensIn ?? 0) + (usage?.tokensOut ?? 0)).toLocaleString()}`} />
        <Card label="Costo del mes" value={`$${Number(usage?.costUsd ?? 0).toFixed(2)}`} />
      </div>

      <ConversationsTable conversations={conversations as never} />
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">{label}</div>
      <div className="text-2xl font-light text-white">{value}</div>
    </div>
  )
}
