import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Info, MessageCircle, Star } from 'lucide-react'
import { GBPMetricsCard } from '@/components/dashboard/results/GBPMetricsCard'
import { getGBPMetrics } from '@/lib/integrations/google-business-profile'
import type { GBPLocationMetrics } from '@/lib/integrations/google-business-profile'
import { resolveOrgId } from '@/lib/preview'
import { PageHeader } from '@/components/ui'
import {
  ResultEmptyState,
  resultEmptyCtaCls,
} from '@/components/dashboard/results/_shared/ResultEmptyState'

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
      <PageHeader
        eyebrow="Resultados"
        title="Reputación Online"
        description="Tu perfil de Google Business: rating, reseñas y actividad"
        icon={Star}
      />

      {metrics ? <GBPMetricsCard metrics={metrics} /> : <ReputationEmptyState />}
    </div>
  )
}

function ReputationEmptyState() {
  return (
    <ResultEmptyState
      icon={Star}
      title="Reputación en Google pendiente de conexión"
      description="Cuando tu equipo de develOP conecte Google Business Profile, vas a ver acá rating, reseñas recientes y datos del perfil."
    >
      <Link href="/dashboard/messages?context=activacion" className={resultEmptyCtaCls}>
        <MessageCircle size={14} strokeWidth={1.5} />
        Hablar con mi equipo
      </Link>
      <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
        <Info size={13} strokeWidth={1.5} />
        Setup manual por ahora
      </span>
    </ResultEmptyState>
  )
}
