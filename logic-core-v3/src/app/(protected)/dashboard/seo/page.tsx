import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getSearchConsoleData } from '@/lib/searchconsole'
import { ClicksImpressionsChart } from '@/components/dashboard/ClicksImpressionsChart'
import { FadeIn } from '@/components/dashboard/FadeIn'
import {
  MousePointerClick,
  Eye,
  Percent,
  Hash,
  AlertTriangle,
  Search,
} from 'lucide-react'

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
  hint,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  borderColor: string
  bgColor: string
  hint?: string
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
      {hint && <p className="mt-1 text-[10px] text-zinc-600">{hint}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SeoPage() {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  if (!organizationId) redirect('/login')

  const client = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { siteUrl: true },
  })

  if (!client) redirect('/login')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn>
        <div>
          <h1 className="text-xl font-semibold text-white">SEO</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Datos de Search Console — últimos 28 días
          </p>
        </div>
      </FadeIn>

      {/* No site configured */}
      {!client.siteUrl && (
        <FadeIn delay={0.1}>
          <div
            className="flex flex-col items-center gap-4 rounded-xl py-16 text-center"
            style={CARD_STYLE}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/60">
              <Search size={22} className="text-zinc-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">
                Los datos de SEO aún no están configurados
              </p>
              <p className="mt-1 max-w-xs text-sm text-zinc-500">
                Contactanos para activar esta función y empezar a ver el rendimiento de tu sitio en Google.
              </p>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Site configured */}
      {client.siteUrl && <SeoContent siteUrl={client.siteUrl} />}
    </div>
  )
}

async function SeoContent({ siteUrl }: { siteUrl: string }) {
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
      {/* Summary cards */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            label="Clicks totales"
            value={data.totalClicks.toLocaleString('es-AR')}
            icon={MousePointerClick}
            color="text-cyan-400"
            borderColor="rgba(6,182,212,0.2)"
            bgColor="rgba(6,182,212,0.04)"
          />
          <MetricCard
            label="Impresiones"
            value={data.totalImpressions.toLocaleString('es-AR')}
            icon={Eye}
            color="text-blue-400"
            borderColor="rgba(59,130,246,0.2)"
            bgColor="rgba(59,130,246,0.04)"
          />
          <MetricCard
            label="CTR promedio"
            value={`${data.avgCtr}%`}
            icon={Percent}
            color="text-green-400"
            borderColor="rgba(34,197,94,0.2)"
            bgColor="rgba(34,197,94,0.04)"
            hint="Click-through rate"
          />
          <MetricCard
            label="Posición promedio"
            value={data.avgPosition > 0 ? `#${data.avgPosition}` : '—'}
            icon={Hash}
            color="text-amber-400"
            borderColor="rgba(245,158,11,0.2)"
            bgColor="rgba(245,158,11,0.04)"
            hint="Menor es mejor"
          />
        </div>
      </FadeIn>

      {/* Clicks + impressions chart */}
      {data.dailyData.length > 0 && (
        <FadeIn delay={0.2}>
          <div className="rounded-xl p-5" style={CARD_STYLE}>
            <h2 className="mb-1 text-sm font-medium text-zinc-300">
              Clicks e impresiones diarias
            </h2>
            <p className="mb-4 text-xs text-zinc-600">
              Barras grises: impresiones · Línea cyan: clicks
            </p>
            <ClicksImpressionsChart data={data.dailyData} />
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.3}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top queries */}
          {data.topQueries.length > 0 && (
            <div className="rounded-xl p-5" style={CARD_STYLE}>
              <h2 className="mb-4 text-sm font-medium text-zinc-300">
                Top 10 palabras clave
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th className="pb-2 text-left font-medium text-zinc-500">Consulta</th>
                      <th className="pb-2 text-right font-medium text-zinc-500">Clicks</th>
                      <th className="pb-2 text-right font-medium text-zinc-500">Impresiones</th>
                      <th className="pb-2 text-right font-medium text-zinc-500">CTR</th>
                      <th className="pb-2 text-right font-medium text-zinc-500">Pos.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topQueries.map((q, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        className="last:border-0"
                      >
                        <td className="py-2 pr-4 text-zinc-300 max-w-[160px] truncate">
                          {q.query}
                        </td>
                        <td className="py-2 text-right text-cyan-400">
                          {q.clicks.toLocaleString('es-AR')}
                        </td>
                        <td className="py-2 text-right text-zinc-400">
                          {q.impressions.toLocaleString('es-AR')}
                        </td>
                        <td className="py-2 text-right text-zinc-500">{q.ctr}%</td>
                        <td className="py-2 text-right text-zinc-500">#{q.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top pages */}
          {data.topPages.length > 0 && (
            <div className="rounded-xl p-5" style={CARD_STYLE}>
              <h2 className="mb-4 text-sm font-medium text-zinc-300">
                Top 5 páginas por clicks
              </h2>
              <ul className="flex flex-col gap-3">
                {data.topPages.map((page, i) => {
                  const maxClicks = data.topPages[0]?.clicks ?? 1
                  const pct = Math.round((page.clicks / maxClicks) * 100)

                  return (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-4 flex-shrink-0 text-right text-xs text-zinc-600">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span
                            className="truncate text-xs text-zinc-300"
                            title={page.page}
                          >
                            {page.page}
                          </span>
                          <span className="flex-shrink-0 text-xs text-cyan-400">
                            {page.clicks.toLocaleString('es-AR')}
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
          )}
        </div>
      </FadeIn>

      {/* Zero data notice */}
      {data.totalClicks === 0 && data.totalImpressions === 0 && (
        <FadeIn delay={0.4}>
          <div className="rounded-xl px-5 py-4" style={CARD_STYLE}>
            <p className="text-sm text-zinc-500">
              No se registraron clicks ni impresiones en los últimos 28 días. Esto puede deberse a que el sitio es muy reciente o a que Search Console aún está procesando los datos.
            </p>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
