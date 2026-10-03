'use client'

import { BarChart2, BarChart3, Clock, Sparkles, Star, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { useId, useState } from 'react'

import { AnalyticsMetricCard } from '@/components/dashboard/AnalyticsMetricCard'
import { chartCardHoverCls } from '@/components/dashboard/results/_shared/chartHover'
import { HoverCard } from '@/components/dashboard/results/_shared/HoverCard'
import { ResultEmptyState } from '@/components/dashboard/results/_shared/ResultEmptyState'
import { SessionsChart } from '@/components/dashboard/SessionsChart'
import { Tabs, type ValueTabItem } from '@/components/ui/Tabs'

import { MarcoDelPanel } from '../../MarcoDelPanel'

/**
 * [NOCTURNO] B · FEATURE 7 — «Seguí tus resultados». Resultados del panel (`/dashboard/resultados/trafico`): las cuatro
 * métricas (`AnalyticsMetricCard` y `HoverCard`, IMPORTADOS), las sesiones de los últimos 30 días (`SessionsChart`,
 * IMPORTADO: el gráfico de recharts, con su tooltip al pasar) y las páginas más visitadas (COPIA de `TopPagesCard`, que
 * es local de la página de servidor). Las pestañas son las de `ResultadosTabs.tsx` (COPIA: allá son enlaces con
 * `usePathname`), con `Tabs` IMPORTADO en modo valor; las otras tres dicen qué muestran en el panel. Los números son del
 * negocio de ejemplo, redondos y con la etiqueta «Ejemplo» (allá salen de Google Analytics).
 */
type Pestana = 'trafico' | 'seo' | 'reputacion' | 'analisis'
const PESTANAS: readonly { readonly value: Pestana; readonly label: string; readonly icon: typeof BarChart3; readonly texto: string }[] = [
  { value: 'trafico', label: 'Trafico', icon: BarChart3, texto: '' },
  { value: 'seo', label: 'SEO', icon: TrendingUp, texto: 'En tu panel, cómo te encuentran en Google: las búsquedas que te traen visitas y en qué lugar aparecés.' },
  { value: 'reputacion', label: 'Reputación', icon: Star, texto: 'En tu panel, tus reseñas de Google y cómo vienen, con las respuestas que te sugerimos.' },
  { value: 'analisis', label: 'Análisis', icon: Sparkles, texto: 'En tu panel, un resumen escrito de lo que pasó en el mes y qué conviene hacer.' },
]

const METRICAS = { sesiones: 1200, usuarios: 860, rebote: 42, duracionS: 105 } as const
const PAGINAS: readonly { readonly page: string; readonly sessions: number }[] = [
  { page: '/', sessions: 520 },
  { page: '/productos', sessions: 310 },
  { page: '/envios', sessions: 180 },
  { page: '/contacto', sessions: 110 },
  { page: '/eventos', sessions: 80 },
]

/** Treinta días de sesiones de ejemplo: un ritmo de semana (menos el domingo) que crece de a poco. Siempre los mismos. */
function sesionesDiarias(ahora: number): { date: string; sessions: number }[] {
  return Array.from({ length: 30 }, (_, k) => {
    const dia = new Date(ahora - (29 - k) * 86_400_000)
    const semana = [0.55, 1, 1.05, 1.1, 1.08, 1.2, 0.85][dia.getDay()]
    return { date: dia.toISOString().slice(0, 10), sessions: Math.round((28 + k * 0.6) * semana) }
  })
}

export default function Resultados(): React.JSX.Element {
  const [ahora] = useState(() => Date.now())
  const [pestana, setPestana] = useState<Pestana>('trafico')
  const indicador = useId()
  const otra = PESTANAS.find((p) => p.value === pestana && p.value !== 'trafico')
  return (
    <MarcoDelPanel item="resultados">
      <div className="flex w-full flex-col gap-6">
        <Tabs layoutId={`resultados-${indicador}`} value={pestana} onValueChange={(v) => setPestana(v as Pestana)} items={PESTANAS.map<ValueTabItem>((p) => ({ value: p.value, label: p.label, icon: p.icon }))} />
        {otra !== undefined ? (
          <ResultEmptyState icon={otra.icon} title={otra.label} description={otra.texto} />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <HoverCard className="rounded-2xl">
                <AnalyticsMetricCard label="Sesiones totales" tooltip="Cuántas veces entraron a tu sitio en los últimos 30 días" displayValue={METRICAS.sesiones.toLocaleString('es-AR')} rawValue={METRICAS.sesiones} icon={<BarChart2 size={18} />} color="cyan" trend={{ value: 12 }} />
              </HoverCard>
              <HoverCard className="rounded-2xl">
                <AnalyticsMetricCard label="Usuarios activos" tooltip="Personas únicas que visitaron tu sitio este mes" displayValue={METRICAS.usuarios.toLocaleString('es-AR')} rawValue={METRICAS.usuarios} icon={<Users size={18} />} color="green" trend={{ value: 8 }} />
              </HoverCard>
              <HoverCard className="rounded-2xl">
                <AnalyticsMetricCard label="Tasa de rebote" tooltip="% de visitantes que se fueron sin hacer nada (menor es mejor)" displayValue={`${String(METRICAS.rebote)}%`} rawValue={METRICAS.rebote} suffix="%" icon={<TrendingDown size={18} />} color="red" trend={{ value: -3 }} invertColors />
              </HoverCard>
              <HoverCard className="rounded-2xl">
                <AnalyticsMetricCard label="Duración promedio" tooltip="Tiempo que pasa cada visitante en tu sitio por sesión" displayValue={`${String(Math.floor(METRICAS.duracionS / 60))}:${String(METRICAS.duracionS % 60).padStart(2, '0')}`} icon={<Clock size={18} />} color="violet" trend={{ value: 15, displayValue: '0:15' }} />
              </HoverCard>
            </div>
            <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-6 ${chartCardHoverCls}`}>
              <div className="mb-5 flex items-center gap-2.5">
                <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-1.5">
                  <TrendingUp size={13} className="text-cyan-300" aria-hidden />
                </div>
                <h2 className="text-sm font-medium text-zinc-200">Sesiones diarias — últimos 30 días</h2>
              </div>
              <SessionsChart data={sesionesDiarias(ahora)} />
            </div>
            <PaginasMasVisitadas pages={PAGINAS} />
          </div>
        )}
      </div>
    </MarcoDelPanel>
  )
}

/** Las páginas más visitadas (COPIA de `TopPagesCard`, local de `resultados/trafico/page.tsx`). */
function PaginasMasVisitadas({ pages }: { readonly pages: readonly { readonly page: string; readonly sessions: number }[] }): React.JSX.Element {
  const maximo = pages[0]?.sessions ?? 1
  return (
    <HoverCard className="rounded-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="rounded-md border border-cyan-400/20 bg-cyan-400/10 p-1.5">
            <BarChart2 size={13} className="text-cyan-300" aria-hidden />
          </div>
          <h2 className="text-sm font-medium text-zinc-200">Páginas más visitadas</h2>
        </div>
        <ul className="flex flex-col gap-1.5">
          {pages.map((p, k) => (
            <li key={p.page} className="group flex items-center gap-4 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-white/10 hover:bg-white/[0.03]">
              <span className="w-5 shrink-0 text-center text-[11px] tabular-nums text-zinc-500">{k + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-[13px] text-zinc-400 transition-colors group-hover:text-zinc-100">{p.page}</span>
                  <span className="shrink-0 text-xs tabular-nums text-zinc-300">{p.sessions.toLocaleString('es-AR')}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-cyan-400/70" style={{ width: `${String(Math.round((p.sessions / maximo) * 100))}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </HoverCard>
  )
}
