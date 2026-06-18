'use client'

import { type ReactNode } from 'react'
import { adminHoverCls } from '@/lib/hover'
import {
  MessageSquare,
  Users,
  Activity,
  Zap,
  Target,
  Gauge,
  BookOpen,
  Cpu,
  Globe,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import type { BotWithDetails, MonthlyUsage } from '../BotDetailClient'

interface Props {
  bot: BotWithDetails
  monthlyUsage: MonthlyUsage
}

// Las 7 secciones de la KnowledgeBase (mismas que el schema). Solo lectura de
// datos ya presentes en props — no hay query nueva.
const KB_SECTIONS = [
  'businessInfo',
  'servicesOrProducts',
  'faq',
  'policies',
  'salesGuidance',
  'toneExamples',
  'forbiddenStatements',
] as const

export function OverviewTab({ bot, monthlyUsage }: Props) {
  const totalTokens = (monthlyUsage?.tokensIn ?? 0) + (monthlyUsage?.tokensOut ?? 0)

  const conversionRate =
    bot._count.conversations > 0
      ? Math.round((bot._count.leads / bot._count.conversations) * 100)
      : 0

  const quotaUsed = monthlyUsage?.conversationsCount ?? 0
  const quotaPct =
    bot.monthlyQuota > 0 ? Math.min(100, (quotaUsed / bot.monthlyQuota) * 100) : 0

  const kbFilled = bot.knowledgeBase
    ? KB_SECTIONS.filter(
        section => (bot.knowledgeBase?.[section] ?? '').trim().length > 0,
      ).length
    : 0

  const firstDomain = bot.allowedDomains[0]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <HoverCard>
        <StatCard
          label="Conversaciones este mes"
          value={monthlyUsage?.conversationsCount ?? 0}
          color="cyan"
          icon={MessageSquare}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Conversaciones totales"
          value={bot._count.conversations}
          color="cyan"
          icon={MessageSquare}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Leads totales"
          value={bot._count.leads}
          color="emerald"
          icon={Users}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Tasa de conversión"
          value={`${conversionRate}%`}
          subtitle="leads / conversaciones"
          color="emerald"
          icon={Target}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Uso de cuota mensual"
          value={`${quotaUsed.toLocaleString('es-AR')} / ${bot.monthlyQuota.toLocaleString('es-AR')}`}
          subtitle="conversaciones del mes"
          color={quotaPct > 80 ? 'amber' : 'cyan'}
          icon={Gauge}
          progress={quotaPct}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Tokens este mes"
          value={totalTokens}
          format="compact"
          color="violet"
          icon={Zap}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Costo estimado"
          value={Number(monthlyUsage?.costUsd ?? 0)}
          format="currency"
          color="amber"
          icon={Activity}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Eventos registrados"
          value={bot._count.events}
          color="zinc"
          icon={Activity}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Knowledge Base"
          value={`${kbFilled}/7`}
          subtitle="secciones completas"
          color="violet"
          icon={BookOpen}
          progress={(kbFilled / 7) * 100}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Modelo LLM"
          value={bot.llmModel}
          subtitle={bot.llmProvider}
          color="zinc"
          icon={Cpu}
        />
      </HoverCard>

      <HoverCard>
        <StatCard
          label="Dominios autorizados"
          value={bot.allowedDomains.length}
          subtitle={firstDomain ?? 'Sin dominios'}
          color="zinc"
          icon={Globe}
        />
      </HoverCard>

      <HoverCard>
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
      </HoverCard>
    </div>
  )
}

function HoverCard({ children }: { children: ReactNode }) {
  return <div className={'grid rounded-2xl ' + adminHoverCls}>{children}</div>
}
