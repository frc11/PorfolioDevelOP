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
import { requestUpsellAction } from '@/lib/actions/upsell'
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

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_STYLE = {
  border: '1px solid rgba(255,255,255,0.07)',
  background: 'rgba(255,255,255,0.025)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
} as const

// ─── Metric card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: string
  tooltip: string
  icon: ReactNode
  color: string
  borderColor: string
  bgColor: string
  hint?: string
  trend?: number
  invertColors?: boolean
}

function MetricCard({
  label,
  value,
  tooltip,
  icon,
  color,
  borderColor,
  bgColor,
  hint,
  trend,
  invertColors,
}: MetricCardProps) {
  return (
    <div
      className="group relative rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
      style={{ border: `1px solid ${borderColor}`, background: bgColor, backdropFilter: 'blur(8px)' }}
      title={tooltip}
    >
      {/* Subtle top glow line */}
      <div
        className="absolute inset-x-0 top-0 h-px rounded-full opacity-60"
        style={{ background: `linear-gradient(to right, transparent, ${borderColor.replace('0.2', '0.6')}, transparent)` }}
      />

      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-zinc-400">{label}</p>
        <span className={color}>{icon}</span>
      </div>

      <p className={`mt-3 text-2xl font-bold tabular-nums ${color}`}>{value}</p>

      <div className="mt-2.5 flex items-center gap-2">
        {trend !== undefined && (
          <TrendBadge value={trend} invertColors={invertColors} />
        )}
        {hint && <p className="text-[10px] text-zinc-600">{hint}</p>}
      </div>

      {/* Tooltip on hover */}
      <p className="mt-2 text-[11px] leading-relaxed text-zinc-600 group-hover:text-zinc-500 transition-colors">
        {tooltip}
      </p>
    </div>
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

  let isMockData = false
  if (client.siteUrl && !isDemo) {
    const probe = await getSearchConsoleData(client.siteUrl)
    if (probe.ok) isMockData = probe.data.isMockData
  }

  const activarSeo = requestUpsellAction.bind(null, 'seo-avanzado', 'SEO Avanzado')

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <FadeIn>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <TrendingUp size={18} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-white">SEO</h1>
              {(isMockData || isDemo) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">
                    Preview Activo
                  </span>
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-zinc-500">
              Datos de Search Console — últimos 28 días
            </p>
          </div>
        </div>
      </FadeIn>

      {isDemo ? (
        // ── Demo mode ──
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
      ) : (
        <>
          {/* ── No site configured — empty state ── */}
          {!client.siteUrl && (
            <FadeIn delay={0.1}>
              <div className="flex flex-col items-center gap-6 rounded-2xl py-24 text-center border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10 flex flex-col items-center gap-5">
                  {/* Icon with glow ring */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0c0e12] border border-white/10 shadow-inner group-hover:border-cyan-500/25 transition-colors duration-500">
                      <Search size={28} className="text-zinc-600 group-hover:text-cyan-500 transition-colors duration-500" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-2">
                    <p className="text-base font-bold text-white tracking-tight">
                      Activá el posicionamiento avanzado
                    </p>
                    <p className="max-w-sm mx-auto text-sm text-zinc-500 font-medium leading-relaxed">
                      Monitoreá tu visibilidad en Google y optimizá tu presencia online con métricas de Search Console integradas.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <form action={activarSeo}>
                      <button
                        type="submit"
                        className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-cyan-400 active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                      >
                        ACTIVAR AHORA
                      </button>
                    </form>
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

          {/* ── Site configured ── */}
          {client.siteUrl && <SeoContent siteUrl={client.siteUrl} />}
        </>
      )}

      {/* ── Demo content — mock data via API fallback ── */}
      {isDemo && <SeoContent siteUrl={client.siteUrl ?? 'https://demo.developseo.com'} hideBanner />}
    </div>
  )
}

// ─── SeoContent ───────────────────────────────────────────────────────────────

async function SeoContent({ siteUrl, hideBanner }: { siteUrl: string; hideBanner?: boolean }) {
  const result = await getSearchConsoleData(siteUrl)

  if (!result.ok) {
    return (
      <FadeIn delay={0.1}>
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 backdrop-blur-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-300">
              No se pudieron cargar los datos de SEO
            </p>
            <p className="mt-1 text-xs text-amber-400/70">{result.error}</p>
          </div>
        </div>
      </FadeIn>
    )
  }

  const { data } = result

  return (
    <div className="flex flex-col gap-6">
      {/* ── Demo banner ── */}
      {data.isMockData && !hideBanner && (
        <FadeIn delay={0.05}>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle size={15} className="flex-shrink-0 text-yellow-400" />
              <p className="text-sm text-yellow-400/90 truncate">
                Estás viendo datos de demostración. Conectá tu Search Console real para ver tu rendimiento actual.
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

      {/* ── Alertas automáticas (máx 2) ── */}
      <FadeIn delay={0.08}>
        <SeoAlertas data={data} />
      </FadeIn>

      {/* ── 4 Metric cards ── */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Clicks totales"
            value={data.totalClicks.toLocaleString('es-AR')}
            tooltip="Cuánta gente entró a tu sitio desde Google"
            icon={<MousePointerClick size={16} />}
            color="text-cyan-400"
            borderColor="rgba(6,182,212,0.2)"
            bgColor="rgba(6,182,212,0.04)"
            trend={12.4}
          />
          <MetricCard
            label="Impresiones"
            value={data.totalImpressions.toLocaleString('es-AR')}
            tooltip="Cuántas veces apareciste en Google"
            icon={<Eye size={16} />}
            color="text-violet-400"
            borderColor="rgba(139,92,246,0.2)"
            bgColor="rgba(139,92,246,0.04)"
            trend={7.1}
          />
          <MetricCard
            label="CTR promedio"
            value={`${data.avgCtr}%`}
            tooltip="% de gente que vio tu resultado y entró"
            icon={<Percent size={16} />}
            color="text-emerald-400"
            borderColor="rgba(34,197,94,0.2)"
            bgColor="rgba(34,197,94,0.04)"
            trend={data.avgCtr >= 3 ? 1.2 : -1.4}
          />
          <MetricCard
            label="Posición promedio"
            value={data.avgPosition > 0 ? `#${data.avgPosition}` : '—'}
            tooltip="En qué lugar de Google aparecés (1 es el mejor)"
            icon={<Hash size={16} />}
            color="text-amber-400"
            borderColor="rgba(245,158,11,0.2)"
            bgColor="rgba(245,158,11,0.04)"
            hint="menor es mejor"
            trend={data.avgPosition > 10 ? -3.1 : 2.8}
            invertColors
          />
        </div>
      </FadeIn>

      {/* ── Chart: Clicks e impresiones ── */}
      {data.dailyData.length > 0 && (
        <FadeIn delay={0.2}>
          <div className="rounded-2xl p-6" style={CARD_STYLE}>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <TrendingUp size={13} className="text-cyan-400" />
              </div>
              <h2 className="text-sm font-semibold text-zinc-300">
                Clicks e impresiones diarias
              </h2>
            </div>

            {/* Custom legend */}
            <div className="flex items-center gap-5 mb-5">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 rounded-full bg-cyan-500" />
                <span className="text-[11px] text-zinc-400">Clicks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-zinc-600" />
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

      {/* ── Zero data notice ── */}
      {data.totalClicks === 0 && data.totalImpressions === 0 && (
        <FadeIn delay={0.4}>
          <div className="rounded-xl px-5 py-4" style={CARD_STYLE}>
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
      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-400">
        TOP 3
      </span>
    )
  }
  if (pos <= 10) {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-400">
        CERCA
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-700/50 bg-zinc-700/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-zinc-600">
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
    <div className="rounded-2xl p-5" style={CARD_STYLE}>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <Search size={13} className="text-cyan-400" />
        </div>
        <h2 className="text-sm font-semibold text-zinc-300">Top 10 palabras clave</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr
              className="sticky top-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <th className="pb-2.5 text-left font-semibold text-zinc-500 pr-4">Consulta</th>
              <th className="pb-2.5 text-right font-semibold text-zinc-500">Clicks</th>
              <th className="pb-2.5 text-right font-semibold text-zinc-500 px-3">Impr.</th>
              <th className="pb-2.5 text-right font-semibold text-zinc-500 px-2">CTR</th>
              <th className="pb-2.5 text-right font-semibold text-zinc-500 pl-2">Pos.</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((q, i) => (
              <tr
                key={i}
                className="group transition-colors hover:bg-white/[0.02] last:border-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <td className="py-2.5 pr-4 text-zinc-300 max-w-[140px]">
                  <span className="block truncate" title={q.query}>
                    {q.query}
                  </span>
                </td>
                <td className="py-2.5 text-right font-semibold tabular-nums text-cyan-400">
                  {q.clicks.toLocaleString('es-AR')}
                </td>
                <td className="py-2.5 text-right tabular-nums text-zinc-500 px-3">
                  {q.impressions.toLocaleString('es-AR')}
                </td>
                <td className="py-2.5 text-right tabular-nums text-zinc-500 px-2">
                  {q.ctr}%
                </td>
                <td className="py-2.5 text-right pl-2">
                  <PositionBadge pos={q.position} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── TopPagesCard ─────────────────────────────────────────────────────────────

function TopPagesCard({ pages }: { pages: SearchConsoleData['topPages'] }) {
  const maxClicks = pages[0]?.clicks ?? 1

  return (
    <div className="rounded-2xl p-5" style={CARD_STYLE}>
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <Zap size={13} className="text-cyan-400" />
        </div>
        <h2 className="text-sm font-semibold text-zinc-300">Top 5 páginas por clicks</h2>
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
              <span className="w-4 flex-shrink-0 text-right font-mono text-[10px] font-black text-zinc-700 group-hover:text-zinc-500 transition-colors">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span
                    className="truncate text-xs text-zinc-400 group-hover:text-white transition-colors"
                    title={page.page}
                  >
                    {displayUrl}
                  </span>
                  <span className="flex-shrink-0 text-xs font-bold tabular-nums text-cyan-400/70 group-hover:text-cyan-400 transition-colors">
                    {page.clicks.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500/80 to-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.35)] transition-all duration-700"
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
