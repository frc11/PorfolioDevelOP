import Link from 'next/link'
import { Activity, ArrowRight, BookOpen, Bot, MessageSquare, Settings, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card, StatCard } from '@/components/ui'
import { HoverScaleCard } from '@/app/(protected)/admin/clients/_components/HoverScaleCard'
import { ChatbotManager } from '@/components/admin/managers/ChatbotManager'
import { QuickActionMotion } from '../QuickActionMotion'

interface ChatbotTabProps {
  clientId: string
}

export async function ChatbotTab({ clientId }: ChatbotTabProps) {
  const org = await prisma.organization.findUnique({
    where: { id: clientId },
    include: {
      botConfig: {
        include: {
          quotaUsages: {
            where: {
              year: new Date().getFullYear(),
              month: new Date().getMonth() + 1,
            },
          },
          leads: {
            orderBy: { capturedAt: 'desc' },
            take: 5,
          },
          _count: {
            select: { conversations: true, leads: true },
          },
        },
      },
    },
  })

  if (!org) return null

  if (!org.botConfig) {
    return (
      <Card variant="dashed" padding="xl" className="text-center">
        <Bot className="mx-auto mb-4 h-12 w-12 text-zinc-600" strokeWidth={1.5} />
        <p className="mb-2 text-base font-medium text-zinc-300">
          Este cliente todavia no tiene chatbot
        </p>
        <p className="mb-6 text-sm text-zinc-500">
          Configura un bot personalizado para empezar a capturar leads.
        </p>
        <Link
          href={`/admin/chatbots/new?organizationId=${clientId}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400/15 px-5 py-2.5 text-sm text-cyan-300 hover:bg-cyan-400/25"
        >
          Configurar chatbot
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </Card>
    )
  }

  // El "Volver" del detalle del bot regresa a esta ficha de cliente (cross-section).
  const botId = org.botConfig.id
  const botHref = (tab: string) =>
    `/admin/chatbots/${botId}?tab=${tab}&from=${encodeURIComponent(`/admin/clients/${clientId}`)}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HoverScaleCard className="h-full">
          <StatCard
            label="Bot"
            value={org.botConfig.botName}
            subtitle={org.botConfig.isActive ? 'Activo' : 'Pausado'}
            color={org.botConfig.isActive ? 'emerald' : 'zinc'}
            className="h-full"
          />
        </HoverScaleCard>
        <HoverScaleCard className="h-full">
          <StatCard
            label="Conversaciones (total)"
            value={org.botConfig._count.conversations}
            color="cyan"
            className="h-full"
          />
        </HoverScaleCard>
        <HoverScaleCard className="h-full">
          <StatCard
            label="Leads (total)"
            value={org.botConfig._count.leads}
            color="violet"
            className="h-full"
          />
        </HoverScaleCard>
        <HoverScaleCard className="h-full">
          <StatCard
            label="Quota mensual"
            value={`${org.botConfig.monthlyQuota.toLocaleString('es-AR')} conv`}
            color="zinc"
            className="h-full"
          />
        </HoverScaleCard>
      </div>

      <ChatbotManager
        botConfig={{
          id: org.botConfig.id,
          botName: org.botConfig.botName,
          slug: org.botConfig.slug,
          llmModel: org.botConfig.llmModel,
          isActive: org.botConfig.isActive,
          monthlyQuota: org.botConfig.monthlyQuota,
          quotaUsages: org.botConfig.quotaUsages.map((q) => ({
            tokensOut: q.tokensOut,
            costUsd: Number(q.costUsd),
            conversationsCount: q.conversationsCount,
          })),
          leads: org.botConfig.leads.map((l) => ({
            id: l.id,
            name: l.name,
            email: l.email,
            phone: l.phone,
            intent: l.intent,
          })),
        }}
        organizationId={org.id}
        organizationSlug={org.slug}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          href={botHref('overview')}
          icon={Bot}
          title="Overview completo"
          description="Metricas y datos del bot"
        />
        <QuickActionCard
          href={botHref('config')}
          icon={Settings}
          title="Configurar bot"
          description="Identidad, apariencia, comportamiento"
          accent="cyan"
        />
        <QuickActionCard
          href={botHref('knowledge')}
          icon={BookOpen}
          title="Knowledge Base"
          description="Editar lo que sabe el bot"
        />
        <QuickActionCard
          href={botHref('conversations')}
          icon={MessageSquare}
          title="Conversaciones"
          description="Historial completo"
        />
        <QuickActionCard
          href={botHref('leads')}
          icon={Users}
          title="Leads"
          description="Oportunidades capturadas"
        />
        <QuickActionCard
          href={botHref('activity')}
          icon={Activity}
          title="Activity log"
          description="Eventos en tiempo real"
        />
      </div>
    </div>
  )
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  accent,
}: {
  href: string
  icon: typeof Bot
  title: string
  description: string
  accent?: 'cyan'
}) {
  return (
    <QuickActionMotion>
      <Link
        href={href}
        className="group block h-full"
      >
        <Card
          variant="interactive"
          className={accent === 'cyan' ? 'h-full border-cyan-400/20 hover:border-cyan-400/30' : 'h-full hover:border-white/20'}
        >
          <div className="mb-3 flex items-start">
            <Icon
              className={`h-5 w-5 ${accent === 'cyan' ? 'text-cyan-400' : 'text-zinc-400'}`}
              strokeWidth={1.5}
            />
          </div>
          <h3 className="mb-1 text-sm font-medium text-zinc-200">{title}</h3>
          <p className="text-xs text-zinc-500">{description}</p>
        </Card>
      </Link>
    </QuickActionMotion>
  )
}
