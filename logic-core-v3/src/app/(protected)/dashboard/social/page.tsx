import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { TrendBadge } from '@/components/dashboard/TrendBadge'
import { Share2, Eye, Heart, Clock, CheckCircle2, XCircle } from 'lucide-react'

export const metadata = { title: 'Social Media Hub | develOP Dashboard' }

const CARD =
  'rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.05]'
const SECTION = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6'

const STATS = [
  { label: 'Posts publicados', value: '24', icon: Share2, color: 'text-pink-400', bg: 'bg-pink-500/10', trend: 20 },
  { label: 'Alcance total', value: '12.4K', icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-500/10', trend: 31 },
  { label: 'Engagement promedio', value: '4.2%', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10', trend: 10 },
  { label: 'Pendientes de aprobación', value: '3', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: 0 },
]

const QUEUE = [
  {
    title: 'Promoción de fin de mes — 20% OFF',
    network: 'Instagram + Facebook',
    date: 'Programado para Mañana 10:00',
    type: 'Imagen',
  },
  {
    title: 'Caso de éxito: Cliente satisfecho',
    network: 'Instagram',
    date: 'Programado para Jue 14:00',
    type: 'Carrusel',
  },
  {
    title: 'Tip de la semana: Cómo ahorrar tiempo',
    network: 'Facebook + Google Business',
    date: 'Programado para Vie 09:00',
    type: 'Texto',
  },
]

const NETWORKS = [
  { name: 'Instagram', metric: '2.3K seguidores', change: '+124 este mes', positive: true, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { name: 'Facebook', metric: '1.1K me gusta', change: '+47 este mes', positive: true, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { name: 'Google Business', metric: '847 vistas', change: '+203 este mes', positive: true, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
]

export default async function SocialMediaHubPage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('social-media-hub') ?? false
  if (!isUnlocked) return <LockedFeatureView featureId="social-media-hub" />

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20">
            <Share2 size={18} className="text-pink-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Social Media & Content Hub</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Activo
              </span>
            </div>
            <p className="text-sm text-zinc-400">Aprobá contenido y publicamos en todas tus redes</p>
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

      <FadeIn delay={0.2}>
        <div className={SECTION}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">Cola de contenido — Pendientes de aprobación</h2>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] text-amber-400 font-semibold">
              3 pendientes
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {QUEUE.map((q) => (
              <div key={q.title} className="flex items-center gap-4 rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 mb-0.5">{q.title}</p>
                  <p className="text-xs text-zinc-500">{q.network} · {q.date} · {q.type}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    <CheckCircle2 size={11} />
                    Aprobar
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-white/[0.06]"
                  >
                    <XCircle size={11} />
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className={SECTION}>
          <h2 className="text-sm font-semibold text-zinc-200 mb-4">Métricas por red</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {NETWORKS.map((n) => (
              <div key={n.name} className={`rounded-xl border ${n.border} ${n.bg} p-4`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${n.color} mb-2`}>{n.name}</p>
                <p className="text-xl font-bold text-white mb-0.5">{n.metric}</p>
                <p className="text-xs text-emerald-400">{n.change}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
