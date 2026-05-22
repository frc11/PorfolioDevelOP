'use client'

import { MessageSquare, Users, Activity, Zap } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import type { BotWithDetails, MonthlyUsage } from '../BotDetailClient'

interface Props {
  bot: BotWithDetails
  monthlyUsage: MonthlyUsage
}

export function OverviewTab({ bot, monthlyUsage }: Props) {
  const totalTokens = (monthlyUsage?.tokensIn ?? 0) + (monthlyUsage?.tokensOut ?? 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conversaciones este mes"
          value={monthlyUsage?.conversationsCount ?? 0}
          color="cyan"
          icon={MessageSquare}
        />
        <StatCard
          label="Leads totales"
          value={bot._count.leads}
          color="emerald"
          icon={Users}
        />
        <StatCard
          label="Tokens este mes"
          value={totalTokens}
          format="compact"
          color="violet"
          icon={Zap}
        />
        <StatCard
          label="Costo estimado"
          value={Number(monthlyUsage?.costUsd ?? 0)}
          format="currency"
          color="amber"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Conversaciones totales"
          value={bot._count.conversations}
          color="zinc"
        />
        <StatCard
          label="Eventos registrados"
          value={bot._count.events}
          color="zinc"
        />
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-3">Detalles</p>
          <p className="text-sm text-zinc-300 font-mono mb-1">/{bot.slug}</p>
          <p className="text-xs text-zinc-500 capitalize">{bot.industry ?? 'Sin industria'}</p>
          <p className="text-xs text-zinc-600 mt-3">
            Creado {new Date(bot.createdAt).toLocaleDateString('es-AR')}
          </p>
          <p className="text-xs text-zinc-700">
            Actualizado {new Date(bot.updatedAt).toLocaleDateString('es-AR')}
          </p>
        </div>
      </div>
    </div>
  )
}
