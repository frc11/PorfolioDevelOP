import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { getAnalyticsData, type AnalyticsData } from '@/lib/analytics'
import { SessionsChart } from '@/components/dashboard/SessionsChart'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { AnalyticsSkeleton } from '@/components/dashboard/AnalyticsSkeleton'
import { AnalyticsAlertas } from '@/components/dashboard/AnalyticsAlertas'
import { AnalyticsMetricCard } from '@/components/dashboard/AnalyticsMetricCard'
import { AnalyticsPeriodSelector } from '@/components/dashboard/AnalyticsPeriodSelector'
import {
  BarChart2,
  Users,
  TrendingDown,
  Clock,
  AlertTriangle,
  BarChart,
  Lightbulb,
  TrendingUp,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function generateInsights(data: AnalyticsData): string[] {
  const insights: string[] = []

  // Top page traffic share
  if (data.topPages.length > 0 && data.sessions > 0) {
    const top = data.topPages[0]
    const pct = Math.round((top.sessions / data.sessions) * 100)
    if (pct >= 20) {
      insights.push(`Tu página ${top.page} concentra el ${pct}% del tráfico total`)
    }
  }

  // Best days of week
  if (data.dailySessions.length >= 7) {
    const dowTotals = new Array<number>(7).fill(0)
    const dowCounts = new Array<number>(7).fill(0)
    for (const d of data.dailySessions) {
      const dow = new Date(d.date + 'T00:00:00').getDay()
      dowTotals[dow] += d.sessions
      dowCounts[dow]++
    }
    const dowAvg = dowTotals.map((t, i) => (dowCounts[i] > 0 ? t / dowCounts[i] : 0))
    const sorted = dowAvg
      .map((avg, i) => ({ i, avg }))
      .sort((a, b) => b.avg - a.avg)
    const DAYS = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados']
    if (sorted[0].avg > 0 && sorted.length >= 2) {
      insights.push(
        `${capitalize(DAYS[sorted[0].i])} y ${DAYS[sorted[1].i]} son tus días de mayor tráfico`
      )
    }
  }

  // Session duration
  const dur = data.avgSessionDurationSec
  if (dur > 0) {
    const label = formatDuration(dur)
    if (dur >= 120) {
      insights.push(`La duración promedio de ${label} indica buen engagement`)
    } else {
      insights.push(`La duración promedio de ${label} tiene margen de mejora con mejor contenido`)
    }
  }

  return insights.slice(0, 3)
}

const CARD_STYLE = {
  border: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.025)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    select: { analyticsPropertyId: true },
  })

  if (!client) redirect('/login')

  return (
    <div className="flex flex-col gap-6">

      {/* ── Demo mode or live content ── */}
      {isDemo && (
        <FadeIn delay={0.05}>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle size={15} className="flex-shrink-0 text-yellow-400" />
              <p className="text-sm text-yellow-400/90 truncate">Estás viendo datos de demostración.</p>
            </div>
            <a
              href="/dashboard/messages"
              className="flex-shrink-0 text-xs font-semibold text-yellow-400 underline underline-offset-2 hover:text-yellow-300 transition-colors"
            >
              Activar métricas reales
            </a>
          </div>
        </FadeIn>
      )}

      {/* ── Demo content ── */}
      {isDemo && (
        <Suspense fallback={<AnalyticsSkeleton />}>
          <AnalyticsContent propertyId="properties/123456789" hideBanner />
        </Suspense>
      )}

      {!isDemo && (
        <>
          {/* ── No property configured — empty state ── */}
          {!client.analyticsPropertyId && (
            <FadeIn delay={0.1}>
              <div className="flex flex-col items-center gap-6 rounded-2xl py-24 text-center border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10 flex flex-col items-center gap-5">
                  {/* Icon with glow ring */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0c0e12] border border-white/10 shadow-inner group-hover:border-cyan-500/25 transition-colors duration-500">
                      <BarChart size={28} className="text-zinc-600 group-hover:text-cyan-500 transition-colors duration-500" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-2">
                    <p className="text-base font-bold text-white tracking-tight">
                      Activá el seguimiento profesional
                    </p>
                    <p className="max-w-sm mx-auto text-sm text-zinc-500 font-medium leading-relaxed">
                      Visualizá el rendimiento real de tu ecosistema digital con métricas de Google Analytics integradas.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-cyan-400 active:scale-95 transition-all shadow-lg shadow-cyan-500/20">
                      ACTIVAR AHORA
                    </button>
                    <a
                      href="?demo=true"
                      className="rounded-xl bg-white/[0.04] border border-white/[0.08] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:bg-white/[0.08] hover:text-white active:scale-95 transition-all backdrop-blur-md"
                    >
                      VER DEMO VISUAL
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* ── Property configured — fetch with Suspense ── */}
          {client.analyticsPropertyId && (
            <Suspense fallback={<AnalyticsSkeleton />}>
              <AnalyticsContent propertyId={client.analyticsPropertyId} />
            </Suspense>
          )}
        </>
      )}
    </div>
  )
}

// ─── AnalyticsContent (server async) ─────────────────────────────────────────

async function AnalyticsContent({ propertyId, hideBanner }: { propertyId: string; hideBanner?: boolean }) {
  const result = await getAnalyticsData(propertyId)

  if (!result.ok) {
    return (
      <FadeIn delay={0.1}>
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 backdrop-blur-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">No se pudieron cargar las métricas</p>
            <p className="mt-1 text-xs text-amber-400/70">{result.error}</p>
          </div>
        </div>
      </FadeIn>
    )
  }

  const { data } = result
  const insights = generateInsights(data)

  return (
    <div className="flex flex-col gap-6">
      {/* ── Demo data banner ── */}
      {data.isMockData && !hideBanner && (
        <FadeIn delay={0.05}>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle size={15} className="flex-shrink-0 text-yellow-400" />
              <p className="text-sm text-yellow-400/90 truncate">
                Estás viendo datos de demostración.
              </p>
            </div>
            <a
              href="/dashboard/messages"
              className="flex-shrink-0 text-xs font-semibold text-yellow-400 underline underline-offset-2 hover:text-yellow-300 transition-colors"
            >
              Activar métricas reales
            </a>
          </div>
        </FadeIn>
      )}

      {/* ── Alertas automáticas ── */}
      <FadeIn delay={0.08}>
        <AnalyticsAlertas data={data} />
      </FadeIn>

      {/* ── Metric cards ── */}
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

      {/* ── Sessions chart ── */}
      {data.dailySessions.length > 0 && (
        <FadeIn delay={0.3}>
          <div className="rounded-2xl p-6" style={CARD_STYLE}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
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

      {/* ── Top pages ── */}
      {data.topPages.length > 0 && (
        <FadeIn delay={0.38}>
          <div className="rounded-2xl p-6" style={CARD_STYLE}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <BarChart2 size={13} className="text-cyan-400" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-300">Páginas más visitadas</h2>
            </div>
            <ul className="flex flex-col gap-1.5">
              {data.topPages.map((page, i) => {
                const maxSessions = data.topPages[0]?.sessions ?? 1
                const pct = Math.round((page.sessions / maxSessions) * 100)

                return (
                  <li
                    key={page.page}
                    className="group flex items-center gap-4 rounded-xl px-3 py-2.5 transition-all duration-300 hover:bg-white/[0.03] hover:border-white/[0.04] border border-transparent"
                  >
                    {/* Position */}
                    <span className="w-5 flex-shrink-0 text-center font-mono text-[10px] font-black text-zinc-700 group-hover:text-zinc-500 transition-colors">
                      {i + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="truncate text-[13px] font-medium text-zinc-400 group-hover:text-white transition-colors">
                          {page.page}
                        </span>
                        <span className="flex-shrink-0 text-xs font-bold tabular-nums text-cyan-400/70 group-hover:text-cyan-400 transition-colors">
                          {page.sessions.toLocaleString('es-AR')}
                        </span>
                      </div>
                      {/* Progress bar */}
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
        </FadeIn>
      )}

      {/* ── Auto insights ── */}
      {insights.length > 0 && (
        <FadeIn delay={0.45}>
          <div className="rounded-2xl p-6" style={CARD_STYLE}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Lightbulb size={13} className="text-cyan-400" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-300">Insights automáticos</h2>
            </div>
            <ul className="flex flex-col gap-3">
              {insights.map((insight, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
                >
                  <span className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <span className="text-[9px] font-black text-cyan-400">{i + 1}</span>
                  </span>
                  <p className="text-sm text-zinc-400 leading-relaxed">{insight}</p>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
