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
import { LoadingState } from '@/components/ui/LoadingState'
import {
  AlertTriangle,
  BarChart,
  BarChart2,
  Clock,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'

const CARD_STYLE = {
  border: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.025)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
} as const

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
    <div className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] py-24 text-center shadow-2xl backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 scale-150 rounded-2xl bg-cyan-500/10 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0c0e12] shadow-inner transition-colors duration-500 group-hover:border-cyan-500/25">
            <BarChart
              size={28}
              className="text-zinc-600 transition-colors duration-500 group-hover:text-cyan-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-base font-bold tracking-tight text-white">
            Activá el seguimiento profesional
          </p>
          <p className="mx-auto max-w-sm text-sm font-medium leading-relaxed text-zinc-500">
            Visualizá el rendimiento real de tu ecosistema digital con métricas de Google
            Analytics integradas.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400 active:scale-95">
            ACTIVAR AHORA
          </button>
          <a
            href="?demo=true"
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-400 backdrop-blur-md transition-all hover:bg-white/[0.08] hover:text-white active:scale-95"
          >
            VER DEMO VISUAL
          </a>
        </div>
      </div>
    </div>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsMetricCard
          label="Sesiones totales"
          tooltip="Cuántas veces entraron a tu sitio en los últimos 30 días"
          displayValue={data.sessions.toLocaleString('es-AR')}
          rawValue={data.sessions}
          icon={<BarChart2 size={18} />}
          color="cyan"
          trend={{ value: 12.3 }}
          delay={0.1}
        />
        <AnalyticsMetricCard
          label="Usuarios activos"
          tooltip="Personas únicas que visitaron tu sitio este mes"
          displayValue={data.activeUsers.toLocaleString('es-AR')}
          rawValue={data.activeUsers}
          icon={<Users size={18} />}
          color="green"
          trend={{ value: 8.1 }}
          delay={0.15}
        />
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
          delay={0.2}
        />
        <AnalyticsMetricCard
          label="Duración promedio"
          tooltip="Tiempo que pasa cada visitante en tu sitio por sesión"
          displayValue={formatDuration(data.avgSessionDurationSec)}
          icon={<Clock size={18} />}
          color="violet"
          trend={{ value: 23, displayValue: '0:23' }}
          delay={0.25}
        />
      </div>

      {data.dailySessions.length > 0 && (
        <FadeIn delay={0.3}>
          <div className="rounded-2xl p-6" style={CARD_STYLE}>
            <div className="mb-5 flex items-center gap-2.5">
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-1.5">
                <TrendingUp size={13} className="text-cyan-400" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-300">
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
    <div className="rounded-2xl p-6" style={CARD_STYLE}>
      <div className="mb-5 flex items-center gap-2.5">
        <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-1.5">
          <BarChart2 size={13} className="text-cyan-400" />
        </div>
        <h2 className="text-sm font-semibold text-zinc-300">Páginas más visitadas</h2>
      </div>

      <ul className="flex flex-col gap-1.5">
        {pages.map((page, index) => {
          const pct = Math.round((page.sessions / maxSessions) * 100)

          return (
            <li
              key={page.page}
              className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-300 hover:border-white/[0.04] hover:bg-white/[0.03]"
            >
              <span className="w-5 shrink-0 text-center font-mono text-[10px] font-black text-zinc-700 transition-colors group-hover:text-zinc-500">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-[13px] font-medium text-zinc-400 transition-colors group-hover:text-white">
                    {page.page}
                  </span>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-cyan-400/70 transition-colors group-hover:text-cyan-400">
                    {page.sessions.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function sumSessions(days: Array<{ sessions: number }>): number {
  return days.reduce((sum, day) => sum + day.sessions, 0)
}
