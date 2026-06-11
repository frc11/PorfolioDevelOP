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
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-12 text-center backdrop-blur-2xl sm:px-8 sm:py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.06] via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-2xl bg-cyan-500/10 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
            <Sparkles size={28} strokeWidth={1.5} />
          </div>
        </div>

        <p className="mt-6 text-base font-black tracking-tight text-white">
          El análisis mensual se activa con tu asistente virtual
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Cuando tu chatbot develOP esté funcionando, acá vas a ver lo que
          descubrimos cada mes: tendencias, temas de consulta y oportunidades.
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
            develOP lo deja listo por vos
          </div>
        </div>
      </div>
    </section>
  )
}
