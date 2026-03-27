import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { TrendBadge } from '@/components/dashboard/TrendBadge'
import { Target, Users, DollarSign, TrendingUp } from 'lucide-react'

export const metadata = { title: 'Recuperación de Ventas | develOP Dashboard' }

const CARD =
  'rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.05]'
const SECTION = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6'

const STATS = [
  { label: 'Visitantes trackeados', value: '1.247', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10', trend: 12 },
  { label: 'Recuperados', value: '89', icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 19 },
  { label: 'Costo por recuperación', value: 'USD 12', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: -8, invertColors: true },
  { label: 'ROI de campaña', value: '340%', icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10', trend: 40 },
]

const FUNNEL = [
  { label: 'Visitantes únicos', value: 1247, pct: 100, color: 'bg-cyan-500/30', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  { label: 'Audiencia construida', value: 873, pct: 70, color: 'bg-blue-500/30', border: 'border-blue-500/30', text: 'text-blue-400' },
  { label: 'Impactados con ads', value: 561, pct: 45, color: 'bg-violet-500/30', border: 'border-violet-500/30', text: 'text-violet-400' },
  { label: 'Recuperados', value: 89, pct: 7, color: 'bg-emerald-500/30', border: 'border-emerald-500/30', text: 'text-emerald-400' },
]

const CAMPAIGNS = [
  { platform: 'Google Ads', type: 'Display Remarketing', spend: 'USD 320', roas: '4.2x', status: 'Activa' },
  { platform: 'Meta Ads', type: 'Retargeting Dinámico', spend: 'USD 280', roas: '3.8x', status: 'Activa' },
]

export default async function PixelRetargetingPage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('pixel-retargeting') ?? false
  if (!isUnlocked) return <LockedFeatureView featureId="pixel-retargeting" />

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
            <Target size={18} className="text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Recuperación de Ventas</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Activo
              </span>
            </div>
            <p className="text-sm text-zinc-400">Pixel + retargeting automático en Google y Meta</p>
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
                  <TrendBadge value={s.trend} invertColors={s.invertColors} />
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
            <h2 className="text-sm font-semibold text-zinc-200 mb-5">Embudo de recuperación</h2>
            <div className="flex flex-col gap-2 items-center">
              {FUNNEL.map((step) => (
                <div key={step.label} className="w-full flex flex-col items-center gap-1">
                  <div
                    className={`rounded-xl border ${step.border} ${step.color} flex items-center justify-between px-4 py-3 transition-all`}
                    style={{ width: `${Math.max(step.pct, 25)}%`, minWidth: '200px' }}
                  >
                    <span className={`text-xs font-semibold ${step.text}`}>{step.label}</span>
                    <span className={`text-sm font-bold ${step.text} tabular-nums`}>{step.value.toLocaleString('es-AR')}</span>
                  </div>
                  {step.pct < 100 && (
                    <div className="h-4 w-px bg-white/[0.08]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Campañas activas</h2>
            <div className="flex flex-col gap-3">
              {CAMPAIGNS.map((c) => (
                <div key={c.platform} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{c.platform}</p>
                      <p className="text-xs text-zinc-500">{c.type}</p>
                    </div>
                    <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] text-green-400">
                      {c.status}
                    </span>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Inversión</p>
                      <p className="text-sm font-bold text-zinc-300">{c.spend}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">ROAS</p>
                      <p className="text-sm font-bold text-emerald-400">{c.roas}</p>
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
