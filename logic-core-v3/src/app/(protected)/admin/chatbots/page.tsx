import { Suspense } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { listAllBots } from '@/modules/chatbot/server/admin/listAllBots'
import { getGlobalBotsOverviewStats } from '@/modules/chatbot/server/admin/getGlobalBotsOverviewStats'
import { BotsListClient } from './BotsListClient'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { Plus, Bot, Users, MessageSquare, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function ChatbotsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/login')
  }

  const [bots, stats] = await Promise.all([listAllBots(), getGlobalBotsOverviewStats()])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Operaciones</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Chatbots</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {stats.totalBots} bots configurados · {stats.activeBots} activos
          </p>
        </div>
        <Link href="/admin/chatbots/new">
          <Button icon={<Plus className="h-4 w-4" strokeWidth={1.5} />}>Nuevo chatbot</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Bots activos"
          value={stats.activeBots}
          subtitle={`de ${stats.totalBots} totales`}
          icon={Bot}
          accent="cyan"
        />
        <StatCard
          label="Bots pausados"
          value={stats.inactiveBots}
          subtitle="no responden"
          icon={Zap}
          accent={stats.inactiveBots > 0 ? 'amber' : 'zinc'}
        />
        <StatCard
          label="Conversaciones"
          value={stats.conversationsLast30d}
          subtitle="últimos 30 días"
          icon={MessageSquare}
          accent="violet"
        />
        <StatCard
          label="Leads capturados"
          value={stats.leadsLast30d}
          subtitle="últimos 30 días"
          icon={Users}
          accent="emerald"
        />
      </div>

      <Suspense fallback={<BotsListSkeleton />}>
        <BotsListClient bots={bots} />
      </Suspense>
    </div>
  )
}

function BotsListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 h-48 animate-pulse"
        />
      ))}
    </div>
  )
}
