import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { getAnalyticsData } from '@/lib/analytics'
import { getTrafficInsights } from '@/lib/ai/results-insights'
import { getPageSpeedReport } from '@/lib/integrations/pagespeed'
import { AnalyticsAlertas } from '@/components/dashboard/AnalyticsAlertas'
import { AnalyticsMetricCard } from '@/components/dashboard/AnalyticsMetricCard'
import { AnalyticsSkeleton } from '@/components/dashboard/AnalyticsSkeleton'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { PreviewBanner } from '@/components/dashboard/PreviewBanner'
import { SessionsChart } from '@/components/dashboard/SessionsChart'
import { InsightsBlock } from '@/components/dashboard/results/InsightsBlock'
import { PageSpeedCard } from '@/components/dashboard/results/PageSpeedCard'
import { HoverCard } from '@/components/dashboard/results/_shared/HoverCard'
import { chartCardHoverCls } from '@/components/dashboard/results/_shared/chartHover'
import {
  ResultEmptyState,
  resultEmptyCtaCls,
  resultEmptyCtaSecondaryCls,
} from '@/components/dashboard/results/_shared/ResultEmptyState'
import { LoadingState, PageHeader } from '@/components/ui'
import {
  AlertTriangle,
  BarChart,
  BarChart2,
  Clock,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}m ${rest}s`
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>
}) {
  const { demo } = await searchParams
  const isDemo = demo === 'true'
  const organizationId = await resolveOrgId()

  if (!organizationId) redirect('/login')

  const client = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { analyticsPropertyId: true, siteUrl: true },
  })

  if (!client) redirect('/login')

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Resultados"
        title="Tráfico & Analytics"
        description="Rendimiento de tu sitio en los últimos 30 días"
        icon={TrendingUp}
      />

      {isDemo && <PreviewBanner context="analytics" />}

      {isDemo && (
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsContent
            organizationId={organizationId}
            propertyId="properties/123456789"
            hideBanner
          />
        </Suspense>
      )}

      {!isDemo && (
        <>
          {!client.analyticsPropertyId && (
            <FadeIn delay={0.1}>
              <AnalyticsEmptyState />
            </FadeIn>
          )}

          {client.analyticsPropertyId && (
            <Suspense fallback={<AnalyticsSkeleton />}>
              <AnalyticsContent
                organizationId={organizationId}
                propertyId={client.analyticsPropertyId}
              />
            </Suspense>
          )}
        </>
      )}

      <Suspense fallback={<LoadingState variant="skeleton-card" />}>
        <PageSpeedSection siteUrl={client.siteUrl} />
      </Suspense>
    </div>
  )
}

function AnalyticsEmptyState() {
  return (
    <ResultEmptyState
      icon={BarChart}
      title="Activá el seguimiento profesional"
      description="Visualizá el rendimiento real de tu ecosistema digital con métricas de Google Analytics integradas."
    >
      {/* FIXME(data-truth): "ACTIVAR AHORA" no tiene handler (CTA muerto). Se
          preserva tal cual por scope — no se cablea ni se cambia su comportamiento. */}
      <button type="button" className={resultEmptyCtaCls}>
        ACTIVAR AHORA
      </button>
      <a href="?demo=true" className={resultEmptyCtaSecondaryCls}>
        VER DEMO VISUAL
      </a>
    </ResultEmptyState>
  )
}

async function PageSpeedSection({ siteUrl }: { siteUrl: string | null }) {
  if (!siteUrl) return null

  const [mobile, desktop] = await Promise.all([
    getPageSpeedReport(siteUrl, 'mobile'),
    getPageSpeedReport(siteUrl, 'desktop'),
  ])

  if (!mobile && !desktop) return null

  return <PageSpeedCard mobile={mobile} desktop={desktop} />
}

async function AnalyticsContent({
  organizationId,
  propertyId,
  hideBanner,
}: {
  organizationId: string
  propertyId: string
  hideBanner?: boolean
}) {
  const result = await getAnalyticsData(propertyId)

  if (!result.ok) {
    return (
      <FadeIn delay={0.1}>
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 backdrop-blur-sm">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              No se pudieron cargar las métricas
            </p>
            <p className="mt-1 text-xs text-amber-400/70">{result.error}</p>
          </div>
        </div>
      </FadeIn>
    )
  }

  const { data } = result
  const insights = data.isMockData
    ? []
    : await getTrafficInsights({
        organizationId,
        totalVisits: data.sessions,
        visitsThisWeek: sumSessions(data.dailySessions.slice(-7)),
        visitsLastWeek: sumSessions(data.dailySessions.slice(-14, -7)),
        topPages: data.topPages.map((page) => ({
          path: page.page,
          visits: page.sessions,
          percentage: data.sessions > 0 ? (page.sessions / data.sessions) * 100 : 0,
        })),
        topSources: data.topSources.map((source) => ({
          source: source.source,
          visits: source.sessions,
        })),
        bounceRate: data.bounceRate,
        avgSessionDuration: data.avgSessionDurationSec,
      })

  return (
    <div className="flex flex-col gap-6">
      {data.isMockData && !hideBanner && <PreviewBanner context="analytics" />}

      <FadeIn delay={0.08}>
        <AnalyticsAlertas data={data} />
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HoverCard className="rounded-2xl">
            <AnalyticsMetricCard
              label="Sesiones totales"
              tooltip="Cuántas veces entraron a tu sitio en los últimos 30 días"
              displayValue={data.sessions.toLocaleString('es-AR')}
              rawValue={data.sessions}
              icon={<BarChart2 size={18} />}
              color="cyan"
              trend={{ value: 12.3 }}
            />
          </HoverCard>
          <HoverCard className="rounded-2xl">
            <AnalyticsMetricCard
              label="Usuarios activos"
              tooltip="Personas únicas que visitaron tu sitio este mes"
              displayValue={data.activeUsers.toLocaleString('es-AR')}
              rawValue={data.activeUsers}
              icon={<Users size={18} />}
              color="green"
              trend={{ value: 8.1 }}
            />
          </HoverCard>
          <HoverCard className="rounded-2xl">
            <AnalyticsMetricCard
              label="Tasa de rebote"
              tooltip="% de visitantes que se fueron sin hacer nada (menor es mejor)"
              displayValue={`${data.bounceRate}%`}
              rawValue={data.bounceRate}
              suffix="%"
              icon={<TrendingDown size={18} />}
              color="red"
              trend={{ value: -2.4 }}
              invertColors
            />
          </HoverCard>
          <HoverCard className="rounded-2xl">
            <AnalyticsMetricCard
              label="Duración promedio"
              tooltip="Tiempo que pasa cada visitante en tu sitio por sesión"
              displayValue={formatDuration(data.avgSessionDurationSec)}
              icon={<Clock size={18} />}
              color="violet"
              trend={{ value: 23, displayValue: '0:23' }}
            />
          </HoverCard>
        </div>
      </FadeIn>

      {data.dailySessions.length > 0 && (
        <FadeIn delay={0.3}>
          <div className={'rounded-2xl border border-white/10 bg-white/[0.02] p-6 ' + chartCardHoverCls}>
            <div className="mb-5 flex items-center gap-2.5">
              <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-1.5">
                <TrendingUp size={13} className="text-cyan-300" />
              </div>
              <h2 className="text-sm font-medium text-zinc-200">
                Sesiones diarias — últimos 30 días
              </h2>
            </div>
            <SessionsChart data={data.dailySessions} />
          </div>
        </FadeIn>
      )}

      {data.topPages.length > 0 && (
        <FadeIn delay={0.38}>
          <TopPagesCard pages={data.topPages} />
        </FadeIn>
      )}

      {insights.length > 0 && (
        <FadeIn delay={0.45}>
          <InsightsBlock insights={insights} />
        </FadeIn>
      )}
    </div>
  )
}

function TopPagesCard({
  pages,
}: {
  pages: Array<{ page: string; sessions: number }>
}) {
  const maxSessions = pages[0]?.sessions ?? 1

  return (
    <HoverCard className="rounded-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-1.5">
            <BarChart2 size={13} className="text-cyan-300" />
          </div>
          <h2 className="text-sm font-medium text-zinc-200">Páginas más visitadas</h2>
        </div>

        <ul className="flex flex-col gap-1.5">
          {pages.map((page, index) => {
            const pct = Math.round((page.sessions / maxSessions) * 100)

            return (
              <li
                key={page.page}
                className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-white/10 hover:bg-white/[0.03]"
              >
                <span className="w-5 shrink-0 text-center text-[11px] tabular-nums text-zinc-500">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="truncate text-[13px] text-zinc-400 transition-colors group-hover:text-zinc-100">
                      {page.page}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-zinc-300">
                      {page.sessions.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-cyan-400/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </HoverCard>
  )
}

function sumSessions(days: Array<{ sessions: number }>): number {
  return days.reduce((sum, day) => sum + day.sessions, 0)
}
