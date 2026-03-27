import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { LockedFeatureView } from '@/components/dashboard/LockedFeatureView'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { TrendBadge } from '@/components/dashboard/TrendBadge'
import { Search, TrendingUp, Users, Trophy, FileText } from 'lucide-react'

export const metadata = { title: 'Dominio de Búsqueda Local | develOP Dashboard' }

const CARD =
  'rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.05]'
const SECTION = 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6'

const STATS = [
  { label: 'Posición promedio', value: '4.2', icon: Search, color: 'text-cyan-400', bg: 'bg-cyan-500/10', trend: -9, invertColors: true },
  { label: 'Keywords en top 3', value: '8', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: 3 },
  { label: 'Tráfico orgánico mensual', value: '1.2K', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 22 },
  { label: 'Competidores superados', value: '3', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10', trend: 1 },
]

const COMPETITORS = [
  { name: 'Competidor A', position: 1, traffic: '2.1K', keywords: 12, superado: false },
  { name: 'Competidor B', position: 3, traffic: '980', keywords: 7, superado: true },
  { name: 'Competidor C', position: 6, traffic: '540', keywords: 4, superado: true },
]

const CONTENT_PLAN = [
  { title: 'Guía definitiva para [tu rubro] en [tu ciudad]', status: 'En redacción', due: '28 Mar' },
  { title: 'Preguntas frecuentes: lo que nadie te dice sobre [servicio]', status: 'Planificado', due: '5 Abr' },
  { title: 'Comparativa: ¿por qué elegir [tu empresa]?', status: 'Planificado', due: '12 Abr' },
  { title: 'Caso de éxito: cómo ayudamos a [cliente tipo]', status: 'Pendiente brief', due: '19 Abr' },
]

export default async function SEOAvanzadoPage() {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { unlockedFeatures: true },
  })

  const isUnlocked = user?.unlockedFeatures?.includes('seo-avanzado') ?? false
  if (!isUnlocked) return <LockedFeatureView featureId="seo-avanzado" />

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Search size={18} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">Dominio de Búsqueda Local</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Activo
              </span>
            </div>
            <p className="text-sm text-zinc-400">Posicionamiento orgánico y contenido SEO estratégico</p>
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
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Comparativa vs competencia local</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    <th className="text-left text-[10px] text-zinc-500 uppercase tracking-wider pb-3 font-semibold">Competidor</th>
                    <th className="text-center text-[10px] text-zinc-500 uppercase tracking-wider pb-3 font-semibold">Posición</th>
                    <th className="text-center text-[10px] text-zinc-500 uppercase tracking-wider pb-3 font-semibold">Tráfico</th>
                    <th className="text-center text-[10px] text-zinc-500 uppercase tracking-wider pb-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {COMPETITORS.map((c) => (
                    <tr key={c.name}>
                      <td className="py-3 text-zinc-300 font-medium">{c.name}</td>
                      <td className="py-3 text-center text-zinc-400">#{c.position}</td>
                      <td className="py-3 text-center text-zinc-400">{c.traffic}/mes</td>
                      <td className="py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] border ${
                          c.superado
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {c.superado ? 'Superado' : 'Por superar'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className={SECTION}>
            <h2 className="text-sm font-semibold text-zinc-200 mb-4">Plan de contenido — Abril</h2>
            <div className="flex flex-col gap-3">
              {CONTENT_PLAN.map((a) => (
                <div key={a.title} className="flex items-start gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 mt-0.5">
                    <FileText size={11} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-200 leading-snug mb-1">{a.title}</p>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] border ${
                        a.status === 'En redacción'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : a.status === 'Planificado'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                      }`}>
                        {a.status}
                      </span>
                      <span className="text-[10px] text-zinc-600">{a.due}</span>
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
