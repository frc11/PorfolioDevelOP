import { Lightbulb, MessageSquare, Check } from 'lucide-react'
import { TZ_AR } from '@/lib/tz-ar'
import {
  INSIGHT_CATEGORY_PRESENTATION,
  type InsightRow,
} from '@/modules/chatbot/lib/monthly-analysis'
import { CalibratingBlock } from './CalibratingBlock'

/**
 * P0.2 — "Lo que descubrimos este mes". Render de los descubrimientos del
 * análisis mensual en lenguaje de dueño: qué pasó, en cuántas conversaciones
 * se vio, y qué se puede hacer (el accionable en cyan = color de acción).
 */

const TONE_CHIP: Record<string, string> = {
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  rose: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  violet: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  sky: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
}

const DATE_FMT = new Intl.DateTimeFormat('es-AR', {
  timeZone: TZ_AR,
  day: 'numeric',
  month: 'short',
})

export function DiscoveriesSection({ insights }: { insights: InsightRow[] }) {
  return (
    <section aria-labelledby="descubrimientos-title">
      <h2 id="descubrimientos-title" className="mb-1 text-base font-semibold text-zinc-100">
        Lo que descubrimos este mes
      </h2>
      <p className="mb-4 text-xs text-zinc-500">
        develOP revisa las conversaciones de tu asistente y te cuenta qué encontró
      </p>

      {insights.length === 0 ? (
        <CalibratingBlock
          title="Tu primer análisis está en camino"
          description="Cada mes revisamos las conversaciones de tu asistente y publicamos acá lo que descubrimos: qué pregunta tu gente, dónde se enfrían las ventas y qué conviene ajustar."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {insights.map((insight) => {
            const presentation = INSIGHT_CATEGORY_PRESENTATION[insight.category]
            return (
              <article
                key={insight.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${TONE_CHIP[presentation.tone]}`}
                  >
                    {presentation.label}
                  </span>
                  {insight.status === 'APPLIED' && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                      <Check size={10} strokeWidth={1.5} aria-hidden />
                      Ya aplicado
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-zinc-600">
                    {DATE_FMT.format(insight.createdAt)}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-100">{insight.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                  {insight.description}
                </p>

                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-cyan-500/15 bg-cyan-500/[0.05] p-3">
                  <Lightbulb size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-cyan-400" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-400/80">
                      Qué podés hacer
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-zinc-300">
                      {insight.suggestedAction}
                    </p>
                  </div>
                </div>

                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-600">
                  <MessageSquare size={12} strokeWidth={1.5} aria-hidden />
                  Visto en {insight.evidenceCount}{' '}
                  {insight.evidenceCount === 1 ? 'conversación' : 'conversaciones'}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
