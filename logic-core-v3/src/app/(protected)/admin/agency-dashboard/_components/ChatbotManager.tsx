'use client'

import Link from 'next/link'
import { Bot, Activity, TrendingUp, Settings, BookOpen, ArrowRight, Sparkles } from 'lucide-react'

import type { ClientData } from './CommandCenterClient'

export function ChatbotManager({ botConfig, organizationId, slug }: { botConfig: ClientData['botConfig'], organizationId: string, slug: string }) {
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
          href={`/admin/clients/new?prefillOrgSlug=${slug}`}
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
      <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <Activity size={14} className="text-cyan-400" />
            Consumo (Este mes)
          </div>
          <div className="text-xl font-semibold text-white mb-1">
            {currentQuota.tokensOut.toLocaleString()} <span className="text-sm font-normal text-zinc-500">tokens</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2">
            <div 
              className={`h-1.5 rounded-full ${usagePercentage > 80 ? 'bg-red-500' : 'bg-cyan-500'}`} 
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 mt-1 text-right">
            Límite: {maxTokens.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
            <TrendingUp size={14} className="text-emerald-400" />
            Leads & Conversaciones
          </div>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xl font-semibold text-white">
                {botConfig.leads?.length || 0}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Leads</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-zinc-300">
                {currentQuota.conversationsCount}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Chats</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/admin/clients/${slug}/chatbot/config`}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-2.5 text-sm text-cyan-300 hover:bg-cyan-400/[0.12] transition-colors"
        >
          <Settings className="h-4 w-4" strokeWidth={1.5} />
          Configurar bot
        </Link>
        <Link
          href={`/admin/clients/${slug}/chatbot/knowledge`}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.05] transition-colors"
        >
          <BookOpen className="h-4 w-4" strokeWidth={1.5} />
          Editar conocimiento
        </Link>
        <Link
          href={`/admin/clients/${slug}/chatbot/overview`}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.05] transition-colors ml-auto"
        >
          Ver detalle completo
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>

      {botConfig.leads && botConfig.leads.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Últimos Leads</h4>
          {botConfig.leads.map((lead: any) => (
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
