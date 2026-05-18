import Link from 'next/link'
import { Activity, ArrowRight, BookOpen, Bot, MessageSquare, Settings, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { StatCard } from '@/components/ui'
import { ChatbotManager } from '@/components/admin/managers/ChatbotManager'

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
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
        <Bot className="mx-auto mb-4 h-12 w-12 text-zinc-600" strokeWidth={1.5} />
        <p className="mb-2 text-base font-medium text-zinc-300">
          Este cliente todavia no tiene chatbot
        </p>
        <p className="mb-6 text-sm text-zinc-500">
          Configura un bot personalizado para empezar a capturar leads.
        </p>
        <Link
          href={`/admin/clients/new?prefillOrgSlug=${org.slug}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400/15 px-5 py-2.5 text-sm text-cyan-300 hover:bg-cyan-400/25"
        >
          Configurar chatbot
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Bot"
          value={org.botConfig.botName}
          subtitle={org.botConfig.isActive ? 'Activo' : 'Pausado'}
          color={org.botConfig.isActive ? 'emerald' : 'zinc'}
        />
        <StatCard
          label="Conversaciones"
          value={org.botConfig._count.conversations}
          color="cyan"
        />
        <StatCard
          label="Leads"
          value={org.botConfig._count.leads}
          color="violet"
        />
        <StatCard
          label="Quota mensual"
          value={`${org.botConfig.monthlyQuota.toLocaleString('es-AR')} conv`}
          color="zinc"
        />
      </div>

      <ChatbotManager botConfig={org.botConfig} organizationId={org.id} organizationSlug={org.slug} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <QuickActionCard
          href={`/admin/clients/${org.slug}/chatbot/overview`}
          icon={Bot}
          title="Overview completo"
          description="Metricas y datos del bot"
        />
        <QuickActionCard
          href={`/admin/clients/${org.slug}/chatbot/config`}
          icon={Settings}
          title="Configurar bot"
          description="Identidad, apariencia, comportamiento"
          accent="cyan"
        />
        <QuickActionCard
          href={`/admin/clients/${org.slug}/chatbot/knowledge`}
          icon={BookOpen}
          title="Knowledge Base"
          description="Editar lo que sabe el bot"
        />
        <QuickActionCard
          href={`/admin/clients/${org.slug}/chatbot/conversations`}
          icon={MessageSquare}
          title="Conversaciones"
          description="Historial completo"
        />
        <QuickActionCard
          href={`/admin/clients/${org.slug}/chatbot/leads`}
          icon={Users}
          title="Leads"
          description="Oportunidades capturadas"
        />
        <QuickActionCard
          href={`/admin/clients/${org.slug}/chatbot/activity`}
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
    <Link
      href={href}
      className={`group rounded-2xl border bg-white/[0.02] p-5 transition-colors hover:bg-white/[0.04] ${
        accent === 'cyan' ? 'border-cyan-400/20' : 'border-white/10'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <Icon
          className={`h-5 w-5 ${accent === 'cyan' ? 'text-cyan-400' : 'text-zinc-400'}`}
          strokeWidth={1.5}
        />
        <ArrowRight
          className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-cyan-400"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="mb-1 text-sm font-medium text-zinc-200">{title}</h3>
      <p className="text-xs text-zinc-500">{description}</p>
    </Link>
  )
}
