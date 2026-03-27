import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { TrendBadge } from '@/components/dashboard/TrendBadge'
import { Star, Send, TrendingUp, CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Motor de Reseñas | develOP Dashboard' }

const CARD =
  'rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.05]'
const SECTION = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6'

const STATS = [
  { label: 'Reseñas este mes', value: '23', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10', trend: 35 },
  { label: 'Rating promedio', value: '4.8 ★', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 4 },
  { label: 'Solicitudes enviadas', value: '67', icon: Send, color: 'text-cyan-400', bg: 'bg-cyan-500/10', trend: 22 },
  { label: 'Tasa de conversión', value: '34%', icon: CheckCircle2, color: 'text-violet-400', bg: 'bg-violet-500/10', trend: 4 },
]

const REVIEWS = [
  {
    name: 'Diego Hernández',
    rating: 5,
    text: 'Excelente atención desde el primer contacto. El equipo es muy profesional y los resultados superaron mis expectativas. 100% recomendable.',
    date: 'Hace 2 días',
  },
  {
    name: 'Patricia Vega',
    rating: 5,
    text: 'Muy conformes con el trabajo realizado. Cumplieron en tiempo y forma, y el soporte post-entrega es impecable. Sin dudas volvemos a trabajar juntos.',
    date: 'Hace 5 días',
  },
  {
    name: 'Ignacio Morales',
    rating: 5,
    text: 'La mejor decisión que tomamos fue contactarlos. Transformaron por completo nuestra presencia digital. Los números hablan solos.',
    date: 'Hace 1 semana',
  },
]

const RATING_HISTORY = [
  { month: 'Oct', value: 3.4 },
  { month: 'Nov', value: 3.8 },
  { month: 'Dic', value: 4.1 },
  { month: 'Ene', value: 4.4 },
  { month: 'Feb', value: 4.6 },
  { month: 'Mar', value: 4.8 },
]

export default async function MotorReseniasPage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('motor-resenias') ?? false
  if (!isUnlocked) return <LockedFeatureView featureId="motor-resenias" />

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Star size={18} className="text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Motor de Reseñas Automático</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Activo
              </span>
            </div>
            <p className="text-sm text-zinc-400">Solicitudes automáticas post-venta vía WhatsApp</p>
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
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Últimas reseñas</h2>
            <div className="flex flex-col gap-3">
              {REVIEWS.map((r) => (
                <div key={r.name} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
                        {r.name[0]}
                      </div>
                      <p className="text-sm font-medium text-zinc-200">{r.name}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{r.text}</p>
                  <p className="text-[10px] text-zinc-600 mt-2">{r.date}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-5">Evolución del rating</h2>
            <div className="flex items-end gap-2 h-32">
              {RATING_HISTORY.map((r) => {
                const heightPct = (r.value / 5) * 100
                return (
                  <div key={r.month} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] text-yellow-400 font-bold tabular-nums">{r.value}</span>
                    <div className="w-full flex items-end" style={{ height: '80px' }}>
                      <div
                        className="w-full rounded-t-lg bg-yellow-500/20 border border-yellow-500/30 transition-all"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-600">{r.month}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 flex items-center gap-3">
              <TrendingUp size={14} className="text-yellow-400 shrink-0" />
              <p className="text-xs text-yellow-300">
                <strong>+1.4 puntos</strong> en 6 meses de trabajo continuo
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
