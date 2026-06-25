import { MessageSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { ConversationSeries } from '@/modules/chatbot/lib/monthly-analysis'
import { MonthlyConversationsChart } from './MonthlyConversationsChart'
import { CalibratingBlock } from './CalibratingBlock'
import { chartCardHoverCls } from '../_shared/chartHover'

/**
 * P0.2 — "Cómo viene tu mes". Tendencia de personas atendidas, mes a mes,
 * usando EXCLUSIVAMENTE los agregados mensuales ya guardados (QuotaUsage).
 * Color con significado: verde = sube, ámbar = baja, zinc = igual.
 */
export function MonthTrendSection({ series }: { series: ConversationSeries }) {
  const { points, current, variation } = series

  return (
    <section aria-labelledby="tendencia-title">
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Tendencia</p>
      <h2 id="tendencia-title" className="mt-1 text-base font-medium text-zinc-200">
        Cómo viene tu mes
      </h2>
      <p className="mb-4 mt-1 text-xs text-zinc-500">
        Personas que tu asistente atendió, mes a mes
      </p>

      {!current ? (
        <CalibratingBlock
          icon={MessageSquare}
          title="Todavía no hay actividad para comparar"
          description="Cuando tu asistente empiece a atender consultas, acá vas a ver cómo evoluciona tu mes contra los anteriores."
        />
      ) : (
        <div
          className={
            'rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 ' + chartCardHoverCls
          }
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                {current.label} · personas atendidas
              </p>
              <p className="mt-1 text-3xl font-medium tabular-nums text-white">
                {current.count.toLocaleString('es-AR')}
              </p>
            </div>
            {variation && <VariationBadge variation={variation} />}
          </div>

          {points.length > 1 ? (
            <MonthlyConversationsChart points={points} />
          ) : (
            <p className="text-xs text-zinc-600">
              Este es tu primer mes con actividad — desde el próximo vas a ver la comparación acá.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

function VariationBadge({
  variation,
}: {
  variation: NonNullable<ConversationSeries['variation']>
}) {
  const styles =
    variation.direction === 'up'
      ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
      : variation.direction === 'down'
        ? 'border-amber-400/20 bg-amber-400/10 text-amber-300'
        : 'border-white/10 bg-white/[0.04] text-zinc-400'
  const Icon =
    variation.direction === 'up'
      ? TrendingUp
      : variation.direction === 'down'
        ? TrendingDown
        : Minus

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tabular-nums ${styles}`}
    >
      <Icon size={13} strokeWidth={1.5} aria-hidden />
      {variation.label}
    </span>
  )
}
