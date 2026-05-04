import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Info, MessageCircle, Star } from 'lucide-react'
import { GBPMetricsCard } from '@/components/dashboard/results/GBPMetricsCard'
import { getGBPMetrics } from '@/lib/integrations/google-business-profile'
import type { GBPLocationMetrics } from '@/lib/integrations/google-business-profile'
import { resolveOrgId } from '@/lib/preview'

export default async function ReputacionPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  let metrics: GBPLocationMetrics | null = null
  try {
    metrics = await getGBPMetrics(organizationId)
  } catch (err) {
    console.error('[GBP] Reputation page failed:', err)
  }

  return (
    <div className="flex flex-col gap-6">
      {metrics ? <GBPMetricsCard metrics={metrics} /> : <ReputationEmptyState />}
    </div>
  )
}

function ReputationEmptyState() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-12 text-center backdrop-blur-2xl sm:px-8 sm:py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.06] via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-2xl bg-cyan-500/10 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            <Star size={28} strokeWidth={1.5} />
          </div>
        </div>

        <p className="mt-6 text-base font-black tracking-tight text-white">
          Reputación en Google pendiente de conexión
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Cuando tu equipo de develOP conecte Google Business Profile, vas a ver acá
          rating, reseñas recientes y datos del perfil.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/messages?context=activacion"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-500/20"
          >
            <MessageCircle size={14} strokeWidth={1.5} />
            Hablar con mi equipo
          </Link>
          <div className="inline-flex items-center gap-2 text-xs text-zinc-600">
            <Info size={13} strokeWidth={1.5} />
            Setup manual por ahora
          </div>
        </div>
      </div>
    </section>
  )
}
