'use client'

import { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
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

// Hover estilo dashboard del cliente (replicado, sin importar archivos del
// dashboard): el lift de 1px lo da el motion wrapper; el cambio de fondo/borde,
// estas clases sobre la card.
const cardHover =
  'h-full transition-colors duration-200 hover:bg-white/[0.04] hover:border-white/20 motion-reduce:transition-none'

export function OverviewTab({ bot, monthlyUsage }: Props) {
  const reduce = Boolean(useReducedMotion())

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
      <MetricCard reduce={reduce}>
        <StatCard
          label="Conversaciones este mes"
          value={monthlyUsage?.conversationsCount ?? 0}
          color="cyan"
          icon={MessageSquare}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Conversaciones totales"
          value={bot._count.conversations}
          color="cyan"
          icon={MessageSquare}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Leads totales"
          value={bot._count.leads}
          color="emerald"
          icon={Users}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Tasa de conversión"
          value={`${conversionRate}%`}
          subtitle="leads / conversaciones"
          color="emerald"
          icon={Target}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Uso de cuota mensual"
          value={`${quotaUsed.toLocaleString('es-AR')} / ${bot.monthlyQuota.toLocaleString('es-AR')}`}
          subtitle="conversaciones del mes"
          color={quotaPct > 80 ? 'amber' : 'cyan'}
          icon={Gauge}
          progress={quotaPct}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Tokens este mes"
          value={totalTokens}
          format="compact"
          color="violet"
          icon={Zap}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Costo estimado"
          value={Number(monthlyUsage?.costUsd ?? 0)}
          format="currency"
          color="amber"
          icon={Activity}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Eventos registrados"
          value={bot._count.events}
          color="zinc"
          icon={Activity}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Knowledge Base"
          value={`${kbFilled}/7`}
          subtitle="secciones completas"
          color="violet"
          icon={BookOpen}
          progress={(kbFilled / 7) * 100}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Modelo LLM"
          value={bot.llmModel}
          subtitle={bot.llmProvider}
          color="zinc"
          icon={Cpu}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <StatCard
          label="Dominios autorizados"
          value={bot.allowedDomains.length}
          subtitle={firstDomain ?? 'Sin dominios'}
          color="zinc"
          icon={Globe}
          className={cardHover}
        />
      </MetricCard>

      <MetricCard reduce={reduce}>
        <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-5 ${cardHover}`}>
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
      </MetricCard>
    </div>
  )
}

function MetricCard({ reduce, children }: { reduce: boolean; children: ReactNode }) {
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -1 }}
      transition={{ duration: 0.15 }}
      className="relative h-full"
    >
      {children}
    </motion.div>
  )
}
