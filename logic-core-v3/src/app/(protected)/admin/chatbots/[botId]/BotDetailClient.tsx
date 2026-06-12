'use client'

import { useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, Play, Pause, Code, Copy, Check, Bot, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Prisma } from '@prisma/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useIsClient } from '@/lib/use-is-client'
import { ActivationModal } from '@/modules/chatbot/components/admin/activation/ActivationModal'
import { runPreflightChecks, type PreflightCheck } from '@/modules/chatbot/server/admin/preflightChecks'
import { toggleBotActiveAction } from './actions'
import { OverviewTab } from './tabs/OverviewTab'
import { ConfigTab } from './tabs/ConfigTab'
import { KnowledgeTab } from './tabs/KnowledgeTab'
import { ActivityTab } from './tabs/ActivityTab'
import { LeadsTab } from './tabs/LeadsTab'
import { ConversationsTab } from './tabs/ConversationsTab'
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

export type ConversationItem = {
  id: string
  sessionId: string
  currentPath: string | null
  messageCount: number
  tokensIn: number
  tokensOut: number
  estimatedCostUsd: number
  leadCaptured: boolean
  startedAt: string | null
  lastMessageAt: string | null
  lead: { id: string; name: string; intent: string | null } | null
  _count: { messages: number }
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'config', label: 'Configuración' },
  { id: 'knowledge', label: 'Knowledge Base' },
  { id: 'activity', label: 'Actividad' },
  { id: 'leads', label: 'Leads' },
  { id: 'conversations', label: 'Conversaciones' },
  { id: 'install', label: 'Instalación' },
  { id: 'integrations', label: 'Integraciones' },
]

interface Props {
  bot: BotWithDetails
  initialTab: TabId
  initialEvents: MappedEvent[]
  monthlyUsage: MonthlyUsage
  leads: LeadItem[]
  conversations: ConversationItem[]
  integrationsTab: React.ReactNode
}

export function BotDetailClient({ bot, initialTab, initialEvents, monthlyUsage, leads, conversations, integrationsTab }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)
  const [isActive, setIsActive] = useState(bot.isActive)
  const [togglePending, startToggle] = useTransition()
  const [showPauseConfirm, setShowPauseConfirm] = useState(false)
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [activationChecks, setActivationChecks] = useState<PreflightCheck[]>([])
  const [activating, setActivating] = useState(false)
  const mounted = useIsClient()

  function changeTab(tab: TabId) {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  function handleToggleActive() {
    if (isActive) {
      setShowPauseConfirm(true)
    } else {
      startToggle(async () => {
        try {
          const checks = await runPreflightChecks(bot.id)
          setActivationChecks(checks)
          setShowActivationModal(true)
        } catch (error) {
          toast.error(`No se pudieron correr los checks: ${String(error)}`)
        }
      })
    }
  }

  function handleConfirmPause() {
    setShowPauseConfirm(false)
    startToggle(async () => {
      const result = await toggleBotActiveAction(bot.id, false)
      if (result.ok) {
        setIsActive(false)
        toast.success('Bot pausado')
      } else {
        toast.error(result.error)
      }
    })
  }

  async function handleConfirmActivation(): Promise<void> {
    setActivating(true)
    const result = await toggleBotActiveAction(bot.id, true)
    setActivating(false)
    if (result.ok) {
      setIsActive(true)
      setShowActivationModal(false)
      toast.success('Bot activado')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
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
            <Button
              variant="ghost"
              size="sm"
              icon={<Code className="h-3 w-3" strokeWidth={1.5} />}
              onClick={() => setShowTestModal(true)}
            >
              Test endpoint
            </Button>
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
          {activeTab === 'conversations' && (
            <ConversationsTab conversations={conversations} totalCount={bot._count.conversations} />
          )}
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
          {activeTab === 'integrations' && integrationsTab}
        </motion.div>
      </AnimatePresence>
    </div>

    <ActivationModal
      open={showActivationModal}
      onClose={() => setShowActivationModal(false)}
      onConfirm={handleConfirmActivation}
      checks={activationChecks}
      loading={activating}
      botName={bot.botName}
      botSlug={bot.slug}
    />

    {mounted && createPortal(
      <AnimatePresence>
        {showPauseConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setShowPauseConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-950 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">Pausar bot</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    El bot dejará de responder en producción. Podés reactivarlo en cualquier momento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPauseConfirm(false)}
                  className="shrink-0 rounded-xl p-1.5 hover:bg-white/[0.05]"
                >
                  <X className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                </button>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPauseConfirm(false)}
                  disabled={togglePending}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.08] disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPause}
                  disabled={togglePending}
                  className="rounded-2xl bg-red-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                >
                  {togglePending ? 'Pausando...' : 'Pausar bot'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    )}
    {mounted && createPortal(
      <AnimatePresence>
        {showTestModal && (
          <TestEndpointModal
            slug={bot.slug}
            allowedDomains={bot.allowedDomains}
            onClose={() => setShowTestModal(false)}
          />
        )}
      </AnimatePresence>,
      document.body,
    )}
    </>
  )
}

function TestEndpointModal({
  slug,
  allowedDomains,
  onClose,
}: {
  slug: string
  allowedDomains: string[]
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const domain = allowedDomains[0]
  const urlBase = domain ? `https://${domain}` : 'https://[your-domain]'
  const curlExample = [
    `curl -X POST ${urlBase}/api/chatbot/${slug}/chat \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -H "Origin: ${urlBase}" \\`,
    `  -d '{`,
    `  "messages": [{ "role": "user", "content": "Hola" }],`,
    `  "sessionId": "test-session-001"`,
    `}'`,
  ].join('\n')

  function handleCopy() {
    void navigator.clipboard.writeText(curlExample).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Test endpoint</h2>
            <p className="mt-1 text-sm text-zinc-400">Endpoint REST — solo acepta POST</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 rounded-xl p-1.5 hover:bg-white/[0.05]"
          >
            <X className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-xs text-zinc-500">Endpoint</p>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 font-mono text-sm">
            <span className="shrink-0 text-xs font-medium text-violet-400">POST</span>
            <span className="truncate text-zinc-300">/api/chatbot/{slug}/chat</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-xs text-zinc-500">Headers requeridos</p>
          <div className="space-y-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 font-mono text-xs">
            <div>
              <span className="text-zinc-500">Content-Type: </span>
              <span className="text-zinc-300">application/json</span>
            </div>
            <div>
              <span className="text-zinc-500">Origin: </span>
              <span className="text-zinc-300">{urlBase}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <p className="min-w-0 text-xs text-zinc-500">
              Campos opcionales:{' '}
              <span className="font-mono">currentPath</span>,{' '}
              <span className="font-mono">referrer</span>
              {!domain && (
                <span className="ml-2 text-amber-400">
                  · reemplazá [your-domain] por un dominio permitido del bot
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:bg-white/[0.08]"
            >
              {copied ? (
                <Check className="h-3 w-3 text-cyan-400" strokeWidth={1.5} />
              ) : (
                <Copy className="h-3 w-3" strokeWidth={1.5} />
              )}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 font-mono text-xs leading-relaxed text-zinc-300">
            {curlExample}
          </pre>
        </div>
      </motion.div>
    </motion.div>
  )
}
