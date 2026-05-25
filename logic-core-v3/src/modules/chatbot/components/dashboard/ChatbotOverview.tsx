'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { MessageSquare, Users, DollarSign, Zap, ArrowRight, PhoneForwarded } from 'lucide-react'
import { BusinessStatCard } from './BusinessStatCard'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import {
  toBusinessMetrics,
  formatCurrency,
  formatConversationCount,
  formatResponseTime,
  generateBusinessSummary,
} from '@/modules/chatbot/lib/business-metrics'
import type { BotConfig, Organization, QuotaUsage, ChatbotLead } from '@prisma/client'
import type { HandoffEvent } from '@/modules/chatbot/index.server'

interface ChatbotOverviewProps {
  session: {
    user: { name?: string | null }
    organization: Organization & { botConfig: BotConfig | null }
    bot: BotConfig
  }
  usage: QuotaUsage | null
  recentLeads: ChatbotLead[]
  recentHandoffs: HandoffEvent[]
}

export function ChatbotOverview({ session, usage, recentLeads, recentHandoffs }: ChatbotOverviewProps) {
  const reduced = useReducedMotion()
  const metrics = toBusinessMetrics({
    monthlyConversations: usage?.conversationsCount ?? 0,
    capturedLeads: recentLeads.length,
    leadValueUSD: 50,
    successRate: 0.97,
  })
  const summary = generateBusinessSummary(metrics)

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-zinc-950 p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/15 p-2.5">
            <Zap className="h-5 w-5 text-cyan-300" strokeWidth={1.5} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.24em] text-cyan-400">
            Tu chatbot este mes
          </span>
        </div>

        <h2 className="text-xl font-semibold text-zinc-100 sm:text-2xl">{summary}</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {session.bot.botName} está atendiendo consultas las 24 horas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BusinessStatCard
          label="Oportunidades"
          value={metrics.leads}
          description={
            metrics.leads > 0
              ? 'Personas listas para comprar'
              : 'Cuando capturen, aparecen acá'
          }
          icon={Users}
          accent="violet"
          context="este mes"
        />

        <BusinessStatCard
          label="Valor estimado"
          value={formatCurrency(metrics.estimatedValue)}
          description={
            metrics.estimatedValue > 0
              ? 'En oportunidades capturadas'
              : 'Crece con cada lead capturado'
          }
          icon={DollarSign}
          accent="emerald"
          context="este mes"
        />

        <BusinessStatCard
          label="Personas atendidas"
          value={formatConversationCount(metrics.conversations)}
          icon={MessageSquare}
          accent="cyan"
          context="este mes"
        />

        <BusinessStatCard
          label="Disponibilidad"
          value="24/7"
          description={`Responde en ~${formatResponseTime(metrics.avgResponseSeconds)}`}
          icon={Zap}
          accent="amber"
        />
      </div>

      {/* Leads recientes */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Leads recientes
          </h3>
          {recentLeads.length > 0 && (
            <Link
              href="/dashboard/chatbot/leads"
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
            >
              Ver todos
              <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          )}
        </div>

        {recentLeads.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">
            Sin leads todavía. Cuando alguien deje sus datos, aparecerá acá.
          </p>
        ) : (
          <motion.ul
            className="space-y-3"
            variants={reduced ? undefined : staggerContainer}
            initial={reduced ? undefined : 'hidden'}
            animate={reduced ? undefined : 'visible'}
          >
            {recentLeads.map((lead) => (
              <motion.li
                key={lead.id}
                variants={reduced ? undefined : staggerItem}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {lead.name ?? 'Sin nombre'}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {lead.intent ?? '—'} ·{' '}
                    {new Date(lead.capturedAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <Link
                  href="/dashboard/chatbot/leads"
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Ver →
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      {/* Derivaciones recientes */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center gap-2">
          <PhoneForwarded className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
          <h3 className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Derivaciones a WhatsApp
          </h3>
        </div>

        {recentHandoffs.length === 0 ? (
          <p className="py-4 text-center text-sm text-zinc-500">
            Sin derivaciones todavía. Cuando el bot derive a alguien, aparece acá.
          </p>
        ) : (
          <ul className="space-y-3">
            {recentHandoffs.map((h) => (
              <li
                key={h.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {h.visitorName ?? 'Visitante anónimo'}
                  </p>
                  {h.reason && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{h.reason}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-zinc-600">
                  {new Date(h.createdAt).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
