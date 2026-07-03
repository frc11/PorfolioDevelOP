import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Sparkles, MessageCircle, Info } from 'lucide-react'
import { resolveOrgId } from '@/lib/preview'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'
import { getMonthlyAnalysisForOrg } from '@/modules/chatbot/index.server'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { PageHeader } from '@/components/ui'
import { AnalysisTeaser } from '@/components/dashboard/results/analysis/AnalysisTeaser'
import { DiscoveriesSection } from '@/components/dashboard/results/analysis/DiscoveriesSection'
import { MonthTrendSection } from '@/components/dashboard/results/analysis/MonthTrendSection'
import { CategoriesSection } from '@/components/dashboard/results/analysis/CategoriesSection'
import { DownloadMonthlyReportButton } from '@/components/dashboard/results/analysis/DownloadMonthlyReportButton'
import {
  ResultEmptyState,
  resultEmptyCtaCls,
} from '@/components/dashboard/results/_shared/ResultEmptyState'

export const dynamic = 'force-dynamic'

/**
 * P0.2 — "Análisis de tu negocio": tab de /dashboard/resultados que renderiza
 * los tres insumos ya existentes (descubrimientos del análisis mensual,
 * agregados de conversaciones por mes, categorías de consultas).
 *
 * Gate de plan: misma convención que P0.3 — decisión única vía
 * `planAllows(plan, 'insight')` (la dimensión existente que vende el análisis
 * con IA en Pro y Business). Starter ve un teaser de una línea, sin candado.
 */
export default async function AnalisisPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const plan = await getPlanForOrg(organizationId)
  const showAnalysis = planAllows(plan, 'insight')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Resultados"
        title="Análisis de tu negocio"
        description="Lo que develOP descubre cada mes con la actividad de tu asistente"
        icon={Sparkles}
        action={showAnalysis ? <DownloadMonthlyReportButton /> : undefined}
      />

      {!showAnalysis ? (
        <FadeIn delay={0.08}>
          <AnalysisTeaser />
        </FadeIn>
      ) : (
        <AnalysisContent organizationId={organizationId} />
      )}
    </div>
  )
}

async function AnalysisContent({ organizationId }: { organizationId: string }) {
  const data = await getMonthlyAnalysisForOrg(organizationId)

  if (!data.hasBot) {
    return (
      <FadeIn delay={0.08}>
        <NoBotState />
      </FadeIn>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <FadeIn delay={0.08}>
        <DiscoveriesSection insights={data.insights} />
      </FadeIn>
      <FadeIn delay={0.16}>
        <MonthTrendSection series={data.series} />
      </FadeIn>
      <FadeIn delay={0.24}>
        <CategoriesSection categories={data.categories} />
      </FadeIn>
    </div>
  )
}

function NoBotState() {
  return (
    <ResultEmptyState
      icon={Sparkles}
      title="El análisis mensual se activa con tu asistente virtual"
      description="Cuando tu chatbot develOP esté funcionando, acá vas a ver lo que descubrimos cada mes: tendencias, temas de consulta y oportunidades."
    >
      <Link href="/dashboard/messages?context=activacion" className={resultEmptyCtaCls}>
        <MessageCircle size={14} strokeWidth={1.5} />
        Hablar con mi equipo
      </Link>
      <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
        <Info size={13} strokeWidth={1.5} />
        develOP lo deja listo por vos
      </span>
    </ResultEmptyState>
  )
}
