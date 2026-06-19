'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import type {
  LatencyHistoryResult,
  LatencyPoint,
} from '@/modules/chatbot/server/admin/getLatencyHistory'

interface LatencyChartProps {
  history: LatencyHistoryResult
}

// Hover del bloque SIN scale: recharts posiciona el tooltip con coordenadas del
// contenedor y un `transform: scale` lo desfasa del cursor. Solo ring + shadow.
// Variante local del lane — no se agrega export a src/lib/hover.ts (compartido).
const chartCardHoverCls =
  'transition duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:shadow-[0_12px_32px_-12px_rgba(255,255,255,0.12)] hover:ring-1 hover:ring-white/15 motion-reduce:transition-none motion-reduce:hover:shadow-none'

export function LatencyChart({ history }: LatencyChartProps) {
  const { status, data, totalSamples, minSamplesNeeded, hoursWithData, p50Overall, p95Overall } =
    history

  return (
    <div className={'rounded-[28px] border border-white/10 bg-white/[0.02] p-6 ' + chartCardHoverCls}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Velocidad del bot · últimas 24h
          </p>
          <p className="mt-1 text-base font-medium text-zinc-200">
            Cuánto tarda en responder (P50 y P95 por hora)
          </p>
          {status === 'ok' && (
            <p className="mt-1 text-xs text-zinc-500">
              {totalSamples} respuestas medidas en {hoursWithData}h ·{' '}
              <span className="text-zinc-300">P50 {formatMs(p50Overall)}</span> ·{' '}
              <span className="text-zinc-300">P95 {formatMs(p95Overall)}</span>
            </p>
          )}
        </div>
        <StatusBadge status={status} totalSamples={totalSamples} />
      </div>

      {status === 'ok' ? (
        <ChartBody data={data} />
      ) : (
        <EmptyState status={status} totalSamples={totalSamples} minSamplesNeeded={minSamplesNeeded} />
      )}
    </div>
  )
}

function ChartBody({ data }: { data: LatencyPoint[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="hour"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }}
            axisLine={false}
            tickLine={false}
            unit="ms"
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(9, 9, 11, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#e4e4e7',
              fontSize: '12px',
            }}
            formatter={(value) => [value === null || value === undefined ? '—' : `${value}ms`]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#a1a1aa', paddingTop: 10 }} iconType="line" />
          <Line
            type="monotone"
            dataKey="p50"
            name="P50 (típico)"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#06b6d4' }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="p95"
            name="P95 (peor caso)"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#f59e0b' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function EmptyState({
  status,
  totalSamples,
  minSamplesNeeded,
}: {
  status: 'insufficient' | 'empty'
  totalSamples: number
  minSamplesNeeded: number
}) {
  const isInsufficient = status === 'insufficient'

  return (
    <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-center">
      <p className="text-2xl">📊</p>
      <p className="text-sm font-medium text-zinc-300">
        {isInsufficient ? 'Datos insuficientes todavía' : 'Sin datos aún'}
      </p>
      <p className="max-w-sm text-xs text-zinc-500">
        {isInsufficient
          ? `Tenemos ${totalSamples} de ${minSamplesNeeded} respuestas necesarias. El gráfico aparece cuando haya más uso real del bot.`
          : 'El gráfico se llena automáticamente con cada conversación. Aún no hay respuestas medidas en las últimas 24h.'}
      </p>
    </div>
  )
}

function StatusBadge({
  status,
  totalSamples,
}: {
  status: 'ok' | 'insufficient' | 'empty'
  totalSamples: number
}) {
  if (status === 'ok') {
    return (
      <span className="shrink-0 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
        Datos reales
      </span>
    )
  }
  return (
    <span className="shrink-0 rounded-lg border border-zinc-400/20 bg-zinc-400/[0.06] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
      {status === 'empty' ? 'Sin datos' : `${totalSamples} muestras`}
    </span>
  )
}

function formatMs(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}
