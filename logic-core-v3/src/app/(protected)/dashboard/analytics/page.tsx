import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveOrgId } from '@/lib/preview'
import { getAnalyticsData } from '@/lib/analytics'
import { SessionsChart } from '@/components/dashboard/SessionsChart'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { BarChart2, Users, TrendingDown, Clock, AlertTriangle, BarChart } from 'lucide-react'

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
  icon: Icon,
  color,
  borderColor,
  bgColor,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  borderColor: string
  bgColor: string
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        border: `1px solid ${borderColor}`,
        background: bgColor,
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">{label}</p>
        <Icon size={16} className={color} />
      </div>
      <p className={`mt-3 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
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
        <div>
          <h1 className="text-xl font-semibold text-white">Analíticas</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Métricas de los últimos 30 días
          </p>
        </div>
      </FadeIn>

      {/* No property configured */}
      {!client.analyticsPropertyId && (
        <FadeIn delay={0.1}>
          <div
            className="flex flex-col items-center gap-4 rounded-xl py-16 text-center"
            style={CARD_STYLE}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/60">
              <BarChart size={22} className="text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">
                Las métricas de tu sitio aún no están configuradas
              </p>
              <p className="mt-1 max-w-xs text-sm text-zinc-500">
                Contactanos para activar esta función y empezar a ver el rendimiento de tu sitio.
              </p>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Property configured — fetch and render */}
      {client.analyticsPropertyId && (
        <AnalyticsContent propertyId={client.analyticsPropertyId} />
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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Sesiones totales"
            value={data.sessions.toLocaleString('es-AR')}
            icon={BarChart2}
            color="text-cyan-400"
            borderColor="rgba(6,182,212,0.2)"
            bgColor="rgba(6,182,212,0.04)"
          />
          <MetricCard
            label="Usuarios activos"
            value={data.activeUsers.toLocaleString('es-AR')}
            icon={Users}
            color="text-blue-400"
            borderColor="rgba(59,130,246,0.2)"
            bgColor="rgba(59,130,246,0.04)"
          />
          <MetricCard
            label="Tasa de rebote"
            value={`${data.bounceRate}%`}
            icon={TrendingDown}
            color="text-amber-400"
            borderColor="rgba(245,158,11,0.2)"
            bgColor="rgba(245,158,11,0.04)"
          />
          <MetricCard
            label="Duración promedio"
            value={formatDuration(data.avgSessionDurationSec)}
            icon={Clock}
            color="text-green-400"
            borderColor="rgba(34,197,94,0.2)"
            bgColor="rgba(34,197,94,0.04)"
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
                  <li key={page.page} className="flex items-center gap-3">
                    <span className="w-4 flex-shrink-0 text-right text-xs text-zinc-600">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-zinc-300">{page.page}</span>
                        <span className="flex-shrink-0 text-xs text-zinc-500">
                          {page.sessions.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-cyan-500"
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
