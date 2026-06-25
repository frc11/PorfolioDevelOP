import type { ReactNode } from 'react'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { getSearchConsoleData } from '@/lib/searchconsole'
import { ClicksImpressionsChart } from '@/components/dashboard/ClicksImpressionsChart'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { SeoAlertas } from '@/components/dashboard/SeoAlertas'
import { OportunidadesSEO } from '@/components/dashboard/OportunidadesSEO'
import { TrendBadge } from '@/components/dashboard/TrendBadge'
import { PreviewBanner } from '@/components/dashboard/PreviewBanner'
import { InsightsBlock } from '@/components/dashboard/results/InsightsBlock'
import { HoverCard } from '@/components/dashboard/results/_shared/HoverCard'
import { chartCardHoverCls } from '@/components/dashboard/results/_shared/chartHover'
import {
  ResultEmptyState,
  resultEmptyCtaCls,
  resultEmptyCtaSecondaryCls,
} from '@/components/dashboard/results/_shared/ResultEmptyState'
import { PageHeader } from '@/components/ui'
import { requestUpsellAction } from '@/lib/actions/upsell'
import { getSeoInsights } from '@/lib/ai/results-insights'
import type { SearchConsoleData } from '@/lib/searchconsole'
import {
  MousePointerClick,
  Eye,
  Percent,
  Hash,
  AlertTriangle,
  Search,
  TrendingUp,
  Zap,
} from 'lucide-react'

// ─── Metric card ──────────────────────────────────────────────────────────────

const METRIC_ACCENTS = {
  cyan: { icon: 'text-cyan-300', iconBg: 'bg-cyan-400/10' },
  violet: { icon: 'text-violet-300', iconBg: 'bg-violet-400/10' },
  emerald: { icon: 'text-emerald-300', iconBg: 'bg-emerald-400/10' },
  amber: { icon: 'text-amber-300', iconBg: 'bg-amber-400/10' },
} as const

interface MetricCardProps {
  label: string
  value: string
  tooltip: string
  icon: ReactNode
  accent: keyof typeof METRIC_ACCENTS
  hint?: string
  trend?: number
  invertColors?: boolean
}

function MetricCard({
  label,
  value,
  tooltip,
  icon,
  accent,
  hint,
  trend,
  invertColors,
}: MetricCardProps) {
  const a = METRIC_ACCENTS[accent]
  return (
    <HoverCard className="rounded-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5" title={tooltip}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs tracking-tight text-zinc-500">{label}</p>
          <div className={`rounded-md p-1.5 ${a.iconBg} ${a.icon}`}>{icon}</div>
        </div>

        <p className="mt-3 text-2xl font-medium tracking-tight tabular-nums text-zinc-100">
          {value}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {trend !== undefined && <TrendBadge value={trend} invertColors={invertColors} />}
          {hint && <p className="text-[10px] text-zinc-500">{hint}</p>}
        </div>

        <p className="mt-2 border-t border-white/[0.06] pt-2 text-[11px] leading-relaxed text-zinc-500">
          {tooltip}
        </p>
      </div>
    </HoverCard>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SeoPage({
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
    select: { siteUrl: true },
  })

  if (!client) redirect('/login')

  const activarSeo = async () => {
    'use server'
    await requestUpsellAction('seo-avanzado', 'SEO Avanzado')
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Resultados"
        title="SEO & Posicionamiento"
        description="Tu visibilidad en Google Search en los últimos 28 días"
        icon={Search}
      />

      {isDemo ? (
        <PreviewBanner context="seo" />
      ) : (
        <>
          {/* ── No site configured — empty state (upsell) ── */}
          {!client.siteUrl && (
            <FadeIn delay={0.1}>
              <ResultEmptyState
                icon={Search}
                title="Activá el posicionamiento avanzado"
                description="Monitoreá tu visibilidad en Google y optimizá tu presencia online con métricas de Search Console integradas."
              >
                {/* Acción FROZEN: dispara requestUpsellAction('seo-avanzado', …). Sólo se restyla el botón. */}
                <form action={activarSeo}>
                  <button type="submit" className={resultEmptyCtaCls}>
                    ACTIVAR AHORA
                  </button>
                </form>
                <a href="?demo=true" className={resultEmptyCtaSecondaryCls}>
                  VER DEMO VISUAL
                </a>
              </ResultEmptyState>
            </FadeIn>
          )}

          {/* ── Site configured ── */}
          {client.siteUrl && (
            <SeoContent organizationId={organizationId} siteUrl={client.siteUrl} />
          )}
        </>
      )}

      {/* ── Demo content — mock data via API fallback ── */}
      {isDemo && (
        <SeoContent
          organizationId={organizationId}
          siteUrl={client.siteUrl ?? 'https://demo.developseo.com'}
          hideBanner
        />
      )}
    </div>
  )
}

// ─── SeoContent ───────────────────────────────────────────────────────────────

async function SeoContent({
  organizationId,
  siteUrl,
  hideBanner,
}: {
  organizationId: string
  siteUrl: string
  hideBanner?: boolean
}) {
  const result = await getSearchConsoleData(siteUrl)

  if (!result.ok) {
    // D4 — NO exponer el detalle interno al cliente (CLAUDE.md: "never expose
    // internal error messages"). Se loguea server-side y se muestra un mensaje genérico.
    console.error('[SEO] getSearchConsoleData failed:', result.error)
    return (
      <FadeIn delay={0.1}>
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-5 py-4">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-300" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-amber-300">
              No se pudieron cargar los datos de SEO
            </p>
            <p className="mt-1 text-xs text-amber-300/70">
              Probá de nuevo en unos minutos. Si el problema persiste, hablá con tu equipo de develOP.
            </p>
          </div>
        </div>
      </FadeIn>
    )
  }

  const { data } = result
  const insights = data.isMockData
    ? []
    : await getSeoInsights({
        organizationId,
        totalImpressions: data.totalImpressions,
        totalClicks: data.totalClicks,
        averagePosition: data.avgPosition,
        topQueries: data.topQueries.map((query) => ({
          query: query.query,
          impressions: query.impressions,
          clicks: query.clicks,
          position: query.position,
        })),
        topPages: data.topPages.map((page) => ({
          url: page.page,
          impressions: page.impressions,
          clicks: page.clicks,
        })),
      })

  return (
    <div className="flex flex-col gap-6">
      {/* ── Demo banner ── */}
      {data.isMockData && !hideBanner && <PreviewBanner context="seo" />}

      {/* ── Alertas automáticas (máx 2) ── */}
      <FadeIn delay={0.08}>
        <SeoAlertas data={data} />
      </FadeIn>

      {/* ── 4 Metric cards ──
          FIXME(data-truth): los `trend` son deltas hardcodeados (no salen de Search
          Console). Se preservan tal cual por scope; pendiente sprint de datos. */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Clicks totales"
            value={data.totalClicks.toLocaleString('es-AR')}
            tooltip="Cuánta gente entró a tu sitio desde Google"
            icon={<MousePointerClick size={16} />}
            accent="cyan"
            trend={12.4}
          />
          <MetricCard
            label="Impresiones"
            value={data.totalImpressions.toLocaleString('es-AR')}
            tooltip="Cuántas veces apareciste en Google"
            icon={<Eye size={16} />}
            accent="violet"
            trend={7.1}
          />
          <MetricCard
            label="CTR promedio"
            value={`${data.avgCtr}%`}
            tooltip="% de gente que vio tu resultado y entró"
            icon={<Percent size={16} />}
            accent="emerald"
            trend={data.avgCtr >= 3 ? 1.2 : -1.4}
          />
          <MetricCard
            label="Posición promedio"
            value={data.avgPosition > 0 ? `#${data.avgPosition}` : '—'}
            tooltip="En qué lugar de Google aparecés (1 es el mejor)"
            icon={<Hash size={16} />}
            accent="amber"
            hint="menor es mejor"
            trend={data.avgPosition > 10 ? -3.1 : 2.8}
            invertColors
          />
        </div>
      </FadeIn>

      {/* ── Chart: Clicks e impresiones ── */}
      {data.dailyData.length > 0 && (
        <FadeIn delay={0.2}>
          <div className={'rounded-2xl border border-white/10 bg-white/[0.02] p-6 ' + chartCardHoverCls}>
            {/* Header */}
            <div className="mb-4 flex items-center gap-2.5">
              <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-1.5 text-cyan-300">
                <TrendingUp size={13} strokeWidth={1.5} />
              </div>
              <h2 className="text-sm font-medium text-zinc-200">Clicks e impresiones diarias</h2>
            </div>

            {/* Custom legend */}
            <div className="mb-5 flex items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 rounded-full bg-cyan-500" />
                <span className="text-[11px] text-zinc-400">Clicks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-cyan-400/40" />
                <span className="text-[11px] text-zinc-400">Impresiones</span>
              </div>
            </div>

            <ClicksImpressionsChart data={data.dailyData} />
          </div>
        </FadeIn>
      )}

      {/* ── Top queries + Top pages ── */}
      <FadeIn delay={0.3}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top 10 palabras clave */}
          {data.topQueries.length > 0 && (
            <TopQueriesTable queries={data.topQueries} />
          )}

          {/* Top 5 páginas */}
          {data.topPages.length > 0 && (
            <TopPagesCard pages={data.topPages} />
          )}
        </div>
      </FadeIn>

      {/* ── Oportunidades detectadas ── */}
      {data.topQueries.length > 0 && (
        <FadeIn delay={0.4}>
          <OportunidadesSEO data={data} />
        </FadeIn>
      )}

      {insights.length > 0 && (
        <FadeIn delay={0.45}>
          <InsightsBlock insights={insights} />
        </FadeIn>
      )}

      {/* ── Zero data notice ── */}
      {data.totalClicks === 0 && data.totalImpressions === 0 && (
        <FadeIn delay={0.4}>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-4">
            <p className="text-sm text-zinc-500">
              No se registraron clicks ni impresiones en los últimos 28 días. Puede deberse a que el sitio es reciente o a que Search Console aún está procesando los datos.
            </p>
          </div>
        </FadeIn>
      )}
    </div>
  )
}

// ─── TopQueriesTable ──────────────────────────────────────────────────────────

function PositionBadge({ pos }: { pos: number }) {
  if (pos <= 3) {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
        TOP 3
      </span>
    )
  }
  if (pos <= 10) {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300">
        CERCA
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-600/20 bg-zinc-700/30 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
      #{Math.round(pos)}
    </span>
  )
}

function TopQueriesTable({
  queries,
}: {
  queries: SearchConsoleData['topQueries']
}) {
  // Sorted by clicks desc (default from API, defensive sort)
  const sorted = [...queries].sort((a, b) => b.clicks - a.clicks)

  return (
    <HoverCard className="rounded-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        {/* Section header */}
        <div className="mb-4 flex items-center gap-2.5">
          <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-1.5 text-cyan-300">
            <Search size={13} strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-medium text-zinc-200">Top 10 palabras clave</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="sticky top-0 border-b border-white/10">
                <th className="pb-2.5 pr-4 text-left font-medium text-zinc-500">Consulta</th>
                <th className="pb-2.5 text-right font-medium text-zinc-500">Clicks</th>
                <th className="px-3 pb-2.5 text-right font-medium text-zinc-500">Impr.</th>
                <th className="px-2 pb-2.5 text-right font-medium text-zinc-500">CTR</th>
                <th className="pb-2.5 pl-2 text-right font-medium text-zinc-500">Pos.</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((q, i) => (
                <tr
                  key={i}
                  className="group border-b border-white/[0.06] transition-colors last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="max-w-[140px] py-2.5 pr-4 text-zinc-300">
                    <span className="block truncate" title={q.query}>
                      {q.query}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-medium tabular-nums text-zinc-100">
                    {q.clicks.toLocaleString('es-AR')}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-zinc-500">
                    {q.impressions.toLocaleString('es-AR')}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-zinc-500">{q.ctr}%</td>
                  <td className="py-2.5 pl-2 text-right">
                    <PositionBadge pos={q.position} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </HoverCard>
  )
}

// ─── TopPagesCard ─────────────────────────────────────────────────────────────

function TopPagesCard({ pages }: { pages: SearchConsoleData['topPages'] }) {
  const maxClicks = pages[0]?.clicks ?? 1

  return (
    <HoverCard className="rounded-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        {/* Section header */}
        <div className="mb-4 flex items-center gap-2.5">
          <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-1.5 text-cyan-300">
            <Zap size={13} strokeWidth={1.5} />
          </div>
          <h2 className="text-sm font-medium text-zinc-200">Top 5 páginas por clicks</h2>
        </div>

        <ul className="flex flex-col gap-3">
          {pages.map((page, i) => {
            const pct = Math.round((page.clicks / maxClicks) * 100)
            // Strip protocol + domain for display
            let displayUrl = page.page
            try {
              const url = new URL(page.page)
              displayUrl = url.pathname === '/' ? url.hostname : url.pathname
            } catch {
              // keep as-is
            }

            return (
              <li key={i} className="group flex items-center gap-3">
                <span className="w-4 flex-shrink-0 text-right text-[11px] tabular-nums text-zinc-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span
                      className="truncate text-xs text-zinc-400 transition-colors group-hover:text-zinc-100"
                      title={page.page}
                    >
                      {displayUrl}
                    </span>
                    <span className="flex-shrink-0 text-xs tabular-nums text-zinc-300">
                      {page.clicks.toLocaleString('es-AR')}
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
