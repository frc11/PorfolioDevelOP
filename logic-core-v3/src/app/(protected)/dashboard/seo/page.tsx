import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getSearchConsoleData } from '@/lib/searchconsole'
import { ClicksImpressionsChart } from '@/components/dashboard/ClicksImpressionsChart'
import {
  TrendingUp,
  MousePointerClick,
  Eye,
  Percent,
  Hash,
  AlertTriangle,
  Search,
} from 'lucide-react'

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  border,
  hint,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
  hint?: string
}) {
  return (
    <div className={`rounded-lg border ${border} ${bg} p-5`}>
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
  const clientId = session?.user?.clientId
  if (!clientId) redirect('/login')

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { siteUrl: true },
  })

  if (!client) redirect('/login')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">SEO</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Datos de Search Console — últimos 28 días
        </p>
      </div>

      {/* No site configured */}
      {!client.siteUrl && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
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
      )}

      {/* Site configured */}
      {client.siteUrl && <SeoContent siteUrl={client.siteUrl} />}
    </div>
  )
}

// Isolated async component — API errors don't crash the page shell
async function SeoContent({ siteUrl }: { siteUrl: string }) {
  const result = await getSearchConsoleData(siteUrl)

  if (!result.ok) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-amber-400" />
        <div>
          <p className="text-sm font-medium text-amber-300">
            No se pudieron cargar los datos de SEO
          </p>
          <p className="mt-1 text-xs text-amber-400/70">{result.error}</p>
        </div>
      </div>
    )
  }

  const { data } = result

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Clicks totales"
          value={data.totalClicks.toLocaleString('es-AR')}
          icon={MousePointerClick}
          color="text-cyan-400"
          bg="bg-cyan-500/10"
          border="border-cyan-500/20"
        />
        <MetricCard
          label="Impresiones"
          value={data.totalImpressions.toLocaleString('es-AR')}
          icon={Eye}
          color="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />
        <MetricCard
          label="CTR promedio"
          value={`${data.avgCtr}%`}
          icon={Percent}
          color="text-green-400"
          bg="bg-green-500/10"
          border="border-green-500/20"
          hint="Click-through rate"
        />
        <MetricCard
          label="Posición promedio"
          value={data.avgPosition > 0 ? `#${data.avgPosition}` : '—'}
          icon={Hash}
          color="text-amber-400"
          bg="bg-amber-500/10"
          border="border-amber-500/20"
          hint="Menor es mejor"
        />
      </div>

      {/* Clicks + impressions chart */}
      {data.dailyData.length > 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-1 text-sm font-medium text-zinc-300">
            Clicks e impresiones diarias
          </h2>
          <p className="mb-4 text-xs text-zinc-600">
            Barras grises: impresiones · Línea cyan: clicks
          </p>
          <ClicksImpressionsChart data={data.dailyData} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top queries */}
        {data.topQueries.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">
              Top 10 palabras clave
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
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
                      className="border-b border-zinc-800/50 last:border-0"
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
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
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
                      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-cyan-600"
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

      {/* Zero data notice */}
      {data.totalClicks === 0 && data.totalImpressions === 0 && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4">
          <p className="text-sm text-zinc-500">
            No se registraron clicks ni impresiones en los últimos 28 días. Esto puede deberse a que el sitio es muy reciente o a que Search Console aún está procesando los datos.
          </p>
        </div>
      )}
    </div>
  )
}
