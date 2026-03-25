import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { getAnalyticsData } from '@/lib/analytics'
import { SessionsChart } from '@/components/dashboard/SessionsChart'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { ArrowDownRight, ArrowUpRight, Target, Users, MousePointerClick, Clock, LucideIcon, BarChart, AlertTriangle, BarChart2, TrendingDown } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

const CARD_STYLE = {
  border: '1px solid rgba(6,182,212,0.2)',
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon,
  color,
  borderColor,
  bgColor,
  trend,
}: any) {
  return (
    <div
      className="group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.04] cursor-default border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl"
    >
      <div className="flex items-center justify-between mb-8">
        <div className={`p-2.5 rounded-xl bg-black/40 border border-white/10 ${color} shadow-inner transition-transform group-hover:scale-110 duration-500`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-sm transition-all duration-500 group-hover:scale-105 ${
            trend.isPositive 
              ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' 
              : 'text-rose-300 bg-rose-500/10 border-rose-500/20'
          }`}>
            {trend.isPositive ? <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> : <ArrowDownRight size={14} className="group-hover:translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />}
            <span className="text-[11px] font-black tracking-tight leading-none">{trend.value}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-white/60 group-hover:text-white/80 transition-colors">
          {label}
        </p>
        <h3 className={`text-6xl font-black tracking-tighter ${color} drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
          {value}
        </h3>
      </div>
    </div>
  )
}

import { Suspense } from 'react'
import { AnalyticsSkeleton } from '@/components/dashboard/AnalyticsSkeleton'
import { DemoAnalytics } from '@/components/dashboard/DemoAnalytics'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
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
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Analíticas</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Métricas de los últimos 30 días
            </p>
          </div>
          {isDemo && (
            <div className="flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Preview Activo</span>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Demo Mode or Live Content */}
      {isDemo ? (
        <DemoAnalytics />
      ) : (
        <>
          {/* No property configured */}
          {!client.analyticsPropertyId && (
            <FadeIn delay={0.1}>
              <div
                className="flex flex-col items-center gap-6 rounded-2xl py-20 text-center border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0c0e12] border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <BarChart size={28} className="text-zinc-600 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <div className="mt-6">
                    <p className="text-base font-bold text-white tracking-tight">
                      Métricas no configuradas
                    </p>
                    <p className="mt-2 max-w-sm mx-auto text-sm text-zinc-500 font-medium leading-relaxed">
                      Activá el seguimiento profesional para visualizar el rendimiento real de tu ecosistema digital.
                    </p>
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button className="rounded-xl bg-cyan-500 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-black hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20">
                      Activar Ahora
                    </button>
                    <a 
                      href="?demo=true" 
                      className="rounded-xl bg-white/5 border border-white/10 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-zinc-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-md"
                    >
                      Ver Demo Visual
                    </a>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Property configured — fetch and render with Suspense */}
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

async function AnalyticsContent({ propertyId }: { propertyId: string }) {
  const result = await getAnalyticsData(propertyId)

  if (!result.ok) {
    return (
      <FadeIn delay={0.1}>
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 backdrop-blur-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
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

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Sesiones totales"
            value={data.sessions.toLocaleString('es-AR')}
            icon={<BarChart2 size={18} />}
            color="text-cyan-400"
            borderColor="rgba(6,182,212,0.2)"
            bgColor="rgba(6,182,212,0.04)"
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            label="Usuarios activos"
            value={data.activeUsers.toLocaleString('es-AR')}
            icon={<Users size={18} />}
            color="text-blue-400"
            borderColor="rgba(59,130,246,0.2)"
            bgColor="rgba(59,130,246,0.04)"
            trend={{ value: 8.3, isPositive: true }}
          />
          <MetricCard
            label="Tasa de rebote"
            value={`${data.bounceRate}%`}
            icon={<TrendingDown size={18} />}
            color="text-amber-400"
            borderColor="rgba(245,158,11,0.2)"
            bgColor="rgba(245,158,11,0.04)"
            trend={{ value: 2.1, isPositive: false }}
          />
          <MetricCard
            label="Duración promedio"
            value={formatDuration(data.avgSessionDurationSec)}
            icon={<Clock size={18} />}
            color="text-green-400"
            borderColor="rgba(34,197,94,0.2)"
            bgColor="rgba(34,197,94,0.04)"
            trend={{ value: 15.0, isPositive: true }}
          />
        </div>
      </FadeIn>

      {/* Sessions by day chart */}
      {data.dailySessions.length > 0 && (
        <FadeIn delay={0.2}>
          <div className="rounded-xl p-5" style={CARD_STYLE}>
            <h2 className="mb-4 text-sm font-medium text-zinc-300">
              Sesiones diarias — últimos 30 días
            </h2>
            <SessionsChart data={data.dailySessions} />
          </div>
        </FadeIn>
      )}

      {/* Top pages */}
      {data.topPages.length > 0 && (
        <FadeIn delay={0.3}>
          <div className="rounded-xl p-5" style={CARD_STYLE}>
            <h2 className="mb-4 text-sm font-medium text-zinc-300">
              Páginas más visitadas
            </h2>
            <ul className="flex flex-col gap-2">
              {data.topPages.map((page, i) => {
                const maxSessions = data.topPages[0]?.sessions ?? 1
                const pct = Math.round((page.sessions / maxSessions) * 100)

                return (
                  <li key={page.page} className="group flex items-center gap-4 rounded-xl p-2 transition-all duration-300 hover:bg-white/[0.03]">
                    <span className="w-5 flex-shrink-0 text-center font-mono text-[10px] font-bold text-zinc-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{page.page}</span>
                        <span className="flex-shrink-0 text-xs font-semibold text-cyan-400/80 group-hover:text-cyan-400">
                          {page.sessions.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                        <div
                          className="h-full rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500"
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
    </div>
  )
}
