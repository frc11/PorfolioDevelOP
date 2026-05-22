'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, Play, Pause, ExternalLink, Bot } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Prisma } from '@prisma/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { toggleBotActiveAction } from './actions'
import { OverviewTab } from './tabs/OverviewTab'
import { ConfigTab } from './tabs/ConfigTab'
import { KnowledgeTab } from './tabs/KnowledgeTab'
import { ActivityTab } from './tabs/ActivityTab'
import { LeadsTab } from './tabs/LeadsTab'
import { InstallTab } from './tabs/InstallTab'

import { VALID_TABS, type TabId } from './tabs'
export { VALID_TABS, type TabId }

export type BotWithDetails = Prisma.BotConfigGetPayload<{
  include: {
    organization: {
      select: {
        id: true
        companyName: true
        slug: true
        leadNotificationEmail: true
        leadNotificationMode: true
      }
    }
    knowledgeBase: true
    _count: { select: { conversations: true; leads: true; events: true } }
  }
}>

export interface MappedEvent {
  id: string
  type: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  createdAt: string
  conversationSession: string | null
  conversationPath: string | null
  metadata: Record<string, unknown> | null
}

export type MonthlyUsage = {
  conversationsCount: number
  tokensIn: number
  tokensOut: number
  costUsd: number
} | null

export type LeadItem = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  intent: string | null
  message: string | null
  status: string
  capturedAt: Date
  conversation: { sessionId: string; currentPath: string | null } | null
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'config', label: 'Configuración' },
  { id: 'knowledge', label: 'Knowledge Base' },
  { id: 'activity', label: 'Actividad' },
  { id: 'leads', label: 'Leads' },
  { id: 'install', label: 'Instalación' },
]

interface Props {
  bot: BotWithDetails
  initialTab: TabId
  initialEvents: MappedEvent[]
  monthlyUsage: MonthlyUsage
  leads: LeadItem[]
}

export function BotDetailClient({ bot, initialTab, initialEvents, monthlyUsage, leads }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [isActive, setIsActive] = useState(bot.isActive)
  const [togglePending, startToggle] = useTransition()

  function changeTab(tab: TabId) {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  function handleToggleActive() {
    startToggle(async () => {
      const result = await toggleBotActiveAction(bot.id, !isActive)
      if (result.ok) {
        setIsActive(prev => !prev)
        toast.success(isActive ? 'Bot pausado' : 'Bot activado')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/chatbots"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 mb-3"
        >
          <ChevronLeft className="h-3 w-3" strokeWidth={1.5} />
          Volver a chatbots
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${bot.accentColor}20` }}
            >
              <Bot className="h-6 w-6" strokeWidth={1.5} style={{ color: bot.accentColor }} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                {bot.organization.companyName}
              </p>
              <h1 className="text-2xl font-semibold text-zinc-100">{bot.botName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-zinc-500">/{bot.slug}</span>
                <Badge variant={isActive ? 'success' : 'warning'}>
                  {isActive ? '● Activo' : '○ Pausado'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={isActive ? 'secondary' : 'primary'}
              icon={
                isActive ? (
                  <Pause className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Play className="h-4 w-4" strokeWidth={1.5} />
                )
              }
              onClick={handleToggleActive}
              disabled={togglePending}
            >
              {isActive ? 'Pausar bot' : 'Activar bot'}
            </Button>
            <Link href={`/api/chatbot/${bot.slug}/chat`} target="_blank">
              <Button
                variant="ghost"
                size="sm"
                icon={<ExternalLink className="h-3 w-3" strokeWidth={1.5} />}
              >
                Test endpoint
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b border-white/10">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => changeTab(tab.id)}
              className={`relative px-4 py-3 text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'text-cyan-300' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab bot={bot} monthlyUsage={monthlyUsage} />}
          {activeTab === 'config' && <ConfigTab bot={bot} />}
          {activeTab === 'knowledge' && <KnowledgeTab bot={bot} />}
          {activeTab === 'activity' && (
            <ActivityTab slug={bot.slug} initialEvents={initialEvents} />
          )}
          {activeTab === 'leads' && <LeadsTab leads={leads} />}
          {activeTab === 'install' && (
            <InstallTab
              bot={{
                slug: bot.slug,
                botName: bot.botName,
                isActive,
                allowedDomains: bot.allowedDomains,
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
