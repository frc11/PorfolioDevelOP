import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { TrendBadge } from '@/components/dashboard/TrendBadge'
import { Mail, Eye, MousePointerClick, TrendingUp, Zap } from 'lucide-react'

export const metadata = { title: 'Email Nurturing | develOP Dashboard' }

const CARD =
  'rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.05]'
const SECTION = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6'

const STATS = [
  { label: 'Emails enviados', value: '1.847', icon: Mail, color: 'text-violet-400', bg: 'bg-violet-500/10', trend: 24 },
  { label: 'Tasa de apertura', value: '34%', icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/10', trend: 4 },
  { label: 'Tasa de click', value: '8.2%', icon: MousePointerClick, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: 12 },
  { label: 'Conversiones', value: '23', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 28 },
]

const FLOWS = [
  {
    name: 'Secuencia de bienvenida',
    steps: 5,
    contacts: 312,
    status: 'Activa',
    description: 'Lead nuevo → 5 emails en 15 días con valor + oferta final',
  },
  {
    name: 'Carrito abandonado',
    steps: 3,
    contacts: 87,
    status: 'Activa',
    description: 'Visitó precio → no compró → recordatorio a las 2h, 24h y 72h',
  },
  {
    name: 'Re-engagement 90 días',
    steps: 4,
    contacts: 145,
    status: 'Activa',
    description: 'Contacto frío → secuencia de reactivación con caso de éxito',
  },
]

const CAMPAIGNS = [
  { name: 'Newsletter Marzo', sent: 847, opens: '38%', clicks: '9.1%', conversions: 11 },
  { name: 'Oferta Flash 48h', sent: 623, opens: '41%', clicks: '12.4%', conversions: 8 },
  { name: 'Caso de éxito: Cliente X', sent: 377, opens: '29%', clicks: '5.8%', conversions: 4 },
]

export default async function EmailNurturingPage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('email-nurturing') ?? false
  if (!isUnlocked) return <LockedFeatureView featureId="email-nurturing" />

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Mail size={18} className="text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Email Marketing & Nurturing</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Activo
              </span>
            </div>
            <p className="text-sm text-zinc-400">Secuencias automáticas que convierten leads en clientes</p>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={CARD}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} border border-white/[0.06] mb-3`}>
                  <Icon size={14} className={s.color} />
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <TrendBadge value={s.trend} />
                </div>
                <p className="text-xs text-zinc-500 leading-snug">{s.label}</p>
              </div>
            )
          })}
        </div>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-4">
        <FadeIn delay={0.2}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Flujos activos</h2>
            <div className="flex flex-col gap-3">
              {FLOWS.map((f) => (
                <div key={f.name} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <Zap size={11} className="text-violet-400" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-200">{f.name}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] text-green-400">
                      {f.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3 leading-snug">{f.description}</p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Pasos</p>
                      <p className="text-sm font-bold text-zinc-300">{f.steps}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Contactos</p>
                      <p className="text-sm font-bold text-zinc-300">{f.contacts}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Últimas campañas</h2>
            <div className="flex flex-col gap-3">
              {CAMPAIGNS.map((c) => (
                <div key={c.name} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-zinc-200 mb-3">{c.name}</p>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Enviados</p>
                      <p className="text-sm font-bold text-zinc-300">{c.sent}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Apertura</p>
                      <p className="text-sm font-bold text-cyan-400">{c.opens}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Clicks</p>
                      <p className="text-sm font-bold text-blue-400">{c.clicks}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Conv.</p>
                      <p className="text-sm font-bold text-emerald-400">{c.conversions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
