'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { Bot, Activity, TrendingUp, Sparkles } from 'lucide-react'

// Hover replicado 1:1 del patrón ActivityLog (mismo que el HoverScaleCard local de
// clients), pero INLINE acá: el módulo es shared y no debe importar componentes del
// worktree de clients. scale + ring sutil, gateado por reduced-motion.
const HOVER_EASE = [0.25, 0.46, 0.45, 0.94] as const
const HOVER_RING =
  'hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:hover:shadow-none'

type ChatbotManagerBotConfig = {
  id: string
  botName: string
  slug: string
  llmModel: string
  isActive: boolean
  monthlyQuota: number
  quotaUsages?: Array<{
    tokensOut: number
    costUsd: unknown
    conversationsCount: number
  }>
  leads?: Array<{
    id: string
    name: string | null
    email: string | null
    phone: string | null
    intent: string | null
  }>
} | null

export function ChatbotManager({
  botConfig,
  organizationId,
  organizationSlug,
}: {
  botConfig: ChatbotManagerBotConfig
  organizationId: string
  organizationSlug?: string
}) {
  const reduce = Boolean(useReducedMotion())
  const clientPath = organizationSlug ?? organizationId

  if (!botConfig) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
        <Bot className="h-8 w-8 text-zinc-600 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-sm text-zinc-400 mb-1">
          Este cliente todavía no tiene chatbot configurado
        </p>
        <p className="text-xs text-zinc-600 mb-4">
          Creá uno para empezar a captar leads desde su sitio
        </p>
        <Link
          href={`/admin/clients/new?prefillOrgSlug=${clientPath}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400/15 px-5 py-2.5 text-sm text-cyan-300 hover:bg-cyan-400/25 transition-colors"
        >
          <Sparkles className="h-4 w-4" strokeWidth={1.5} />
          Configurar chatbot
        </Link>
      </div>
    )
  }

  const currentQuota = botConfig.quotaUsages?.[0] || { tokensOut: 0, costUsd: 0, conversationsCount: 0 }
  const maxTokens = botConfig.monthlyQuota * 1000
  const usagePercentage = Math.min((currentQuota.tokensOut / maxTokens) * 100, 100)

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        whileHover={reduce ? undefined : { scale: 1.015, transition: { duration: 0.2, ease: HOVER_EASE } }}
        className={`flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] ${HOVER_RING}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${botConfig.isActive ? 'bg-cyan-500/10 text-cyan-400' : 'bg-red-500/10 text-red-400'}`}>
            <Bot size={20} />
          </div>
          <div>
            <h4 className="font-medium text-zinc-200">{botConfig.botName}</h4>
            <span className="text-xs text-zinc-500">{botConfig.slug} • {botConfig.llmModel}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full border ${botConfig.isActive ? 'border-cyan-500/20 text-cyan-400 bg-cyan-500/10' : 'border-red-500/20 text-red-400 bg-red-500/10'}`}>
            {botConfig.isActive ? 'Activo' : 'Pausado'}
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={reduce ? undefined : { scale: 1.015, transition: { duration: 0.2, ease: HOVER_EASE } }}
          className={`p-4 rounded-xl border border-white/5 bg-white/[0.02] ${HOVER_RING}`}
        >
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <Activity size={14} className="text-cyan-400" />
            Consumo (Este mes)
          </div>
          <div className="text-xl font-semibold text-white mb-1">
            {currentQuota.tokensOut.toLocaleString('es-AR')} <span className="text-sm font-normal text-zinc-500">tokens</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
            <div
              className={`h-1.5 rounded-full ${usagePercentage > 80 ? 'bg-red-500' : 'bg-cyan-500'}`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 text-right">
            Límite: {maxTokens.toLocaleString('es-AR')}
          </div>
        </motion.div>

        <motion.div
          whileHover={reduce ? undefined : { scale: 1.015, transition: { duration: 0.2, ease: HOVER_EASE } }}
          className={`p-4 rounded-xl border border-white/5 bg-white/[0.02] ${HOVER_RING}`}
        >
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            Actividad reciente
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xl font-semibold text-white">
                {botConfig.leads?.length || 0}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Leads (últimos)</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-zinc-300">
                {currentQuota.conversationsCount}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Chats este mes</div>
            </div>
          </div>
        </motion.div>
      </div>

      {botConfig.leads && botConfig.leads.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Últimos Leads</h4>
          {botConfig.leads.map((lead) => (
            <div key={lead.id} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-white/[0.02]">
              <div className="flex flex-col">
                <span className="text-sm text-zinc-300 truncate">{lead.name || 'Anónimo'}</span>
                <span className="text-xs text-zinc-500">{lead.email || lead.phone || 'Sin contacto'}</span>
              </div>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase">{lead.intent || 'Info'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
