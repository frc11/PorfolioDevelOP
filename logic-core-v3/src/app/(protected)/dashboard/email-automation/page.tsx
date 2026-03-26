import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { CampaignRequestModal } from '@/components/dashboard/CampaignRequestModal'
import React from 'react'
import {
  Mail,
  MousePointerClick,
  TrendingUp,
  CheckCircle2,
  Zap,
  Pause,
  Play,
  Calendar,
  Users,
} from 'lucide-react'

export const metadata = { title: 'Email Automation | develOP Dashboard' }

// ─── Static mock data ──────────────────────────────────────────────────────────

type LucideIconComponent = React.ComponentType<{ size?: number; className?: string }>

const METRICS: {
  label: string
  sublabel: string
  value: string
  icon: LucideIconComponent
  color: string
  cardStyle: React.CSSProperties
  iconBg: string
}[] = [
  {
    label: 'Emails enviados',
    sublabel: 'este mes',
    value: '1.847',
    icon: Mail,
    color: 'text-cyan-400',
    cardStyle: { border: '1px solid rgba(6,182,212,0.2)', background: 'rgba(6,182,212,0.04)' },
    iconBg: 'bg-cyan-500/10',
  },
  {
    label: 'Tasa de apertura',
    sublabel: 'promedio',
    value: '34%',
    icon: TrendingUp,
    color: 'text-emerald-400',
    cardStyle: { border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.04)' },
    iconBg: 'bg-emerald-500/10',
  },
  {
    label: 'Tasa de click',
    sublabel: 'sobre aperturas',
    value: '8.2%',
    icon: MousePointerClick,
    color: 'text-violet-400',
    cardStyle: { border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.04)' },
    iconBg: 'bg-violet-500/10',
  },
  {
    label: 'Conversiones',
    sublabel: 'este mes',
    value: '23',
    icon: CheckCircle2,
    color: 'text-amber-400',
    cardStyle: { border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' },
    iconBg: 'bg-amber-500/10',
  },
]

const FLOWS: {
  name: string
  status: 'active' | 'paused'
  contacts: number
  description: string
}[] = [
  {
    name: 'Bienvenida al lead',
    status: 'active',
    contacts: 245,
    description: '5 emails · 14 días',
  },
  {
    name: 'Seguimiento post-consulta',
    status: 'active',
    contacts: 89,
    description: '3 emails · 7 días',
  },
  {
    name: 'Reactivación de clientes fríos',
    status: 'paused',
    contacts: 156,
    description: '4 emails · 21 días',
  },
]

const CAMPAIGNS: {
  name: string
  date: string
  sent: number
  open: number
  clicks: number
}[] = [
  { name: 'Newsletter Mayo — Novedades develOP', date: '22 may 2025', sent: 842, open: 38, clicks: 9 },
  { name: 'Oferta Black Friday — Servicios Web', date: '28 nov 2024', sent: 1105, open: 41, clicks: 12 },
  { name: 'Caso de éxito — E-commerce Martínez', date: '14 oct 2024', sent: 763, open: 29, clicks: 6 },
]

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5'

const GLASS: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(255,255,255,0.02)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EmailAutomationPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('email-automation') ?? false
  if (!isUnlocked) {
    return <LockedFeatureView featureId="email-automation" />
  }

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
              <Mail size={18} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Email Automation</h1>
              <p className="text-sm text-zinc-400">Secuencias automáticas y campañas de email</p>
            </div>
          </div>
          <CampaignRequestModal />
        </div>
      </FadeIn>

      {/* Metric cards */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {METRICS.map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.label}
                className="rounded-2xl p-5"
                style={m.cardStyle}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">{m.label}</p>
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.iconBg}`}>
                    <Icon size={14} className={m.color} />
                  </div>
                </div>
                <p className={`mt-3 text-2xl font-bold ${m.color}`}>{m.value}</p>
                <p className="mt-1 text-xs text-zinc-600">{m.sublabel}</p>
              </div>
            )
          })}
        </div>
      </FadeIn>

      {/* Active flows */}
      <FadeIn delay={0.2}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Flujos activos ({FLOWS.length})
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {FLOWS.map((flow) => {
              const isActive = flow.status === 'active'
              return (
                <div key={flow.name} className={CARD} style={GLASS}>
                  {/* Status badge */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        isActive
                          ? 'border-green-500/20 bg-green-500/10 text-green-400'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {isActive ? <Play size={10} /> : <Pause size={10} />}
                      {isActive ? 'Activo' : 'Pausado'}
                    </div>
                    <Zap size={14} className={isActive ? 'text-green-400/60' : 'text-zinc-600'} />
                  </div>

                  {/* Name */}
                  <p className="text-sm font-medium text-zinc-100 leading-snug">{flow.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-600">{flow.description}</p>

                  {/* Contacts */}
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-500">
                    <Users size={11} />
                    <span>{flow.contacts.toLocaleString('es-AR')} contactos</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </FadeIn>

      {/* Campaigns table */}
      <FadeIn delay={0.3}>
        <div className="rounded-2xl" style={GLASS}>
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-medium text-zinc-200">Últimas campañas</h2>
            <Calendar size={14} className="text-zinc-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="px-5 py-3 text-left text-xs font-medium text-zinc-600">Campaña</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-zinc-600">Fecha</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-zinc-600">Enviados</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-zinc-600">Apertura</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-zinc-600">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {CAMPAIGNS.map((c, i) => (
                  <tr
                    key={c.name}
                    className={`transition-colors hover:bg-white/[0.02] ${
                      i < CAMPAIGNS.length - 1 ? 'border-b border-white/[0.04]' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5 text-sm text-zinc-200">{c.name}</td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">{c.date}</td>
                    <td className="px-5 py-3.5 text-right text-sm font-medium text-zinc-300">
                      {c.sent.toLocaleString('es-AR')}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400">
                        <TrendingUp size={11} />
                        {c.open}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-medium text-violet-400">{c.clicks}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
