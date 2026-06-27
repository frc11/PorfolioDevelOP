import { Lightbulb, MessageSquare, Check } from 'lucide-react'
import { TZ_AR } from '@/lib/tz-ar'
import {
  INSIGHT_CATEGORY_PRESENTATION,
  type InsightRow,
} from '@/modules/chatbot/lib/monthly-analysis'
import { CalibratingBlock } from './CalibratingBlock'
import { HoverCard } from '../_shared/HoverCard'

/**
 * P0.2 — "Lo que descubrimos este mes". Render de los descubrimientos del
 * análisis mensual en lenguaje de dueño: qué pasó, en cuántas conversaciones
 * se vio, y qué se puede hacer (el accionable en cyan = color de acción).
 */

const TONE_CHIP: Record<string, string> = {
  amber: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  rose: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
  cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
  violet: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
  sky: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
}

const DATE_FMT = new Intl.DateTimeFormat('es-AR', {
  timeZone: TZ_AR,
  day: 'numeric',
  month: 'short',
})

export function DiscoveriesSection({ insights }: { insights: InsightRow[] }) {
  return (
    <section aria-labelledby="descubrimientos-title">
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Análisis mensual</p>
      <h2 id="descubrimientos-title" className="mt-1 text-base font-medium text-zinc-200">
        Lo que descubrimos este mes
      </h2>
      <p className="mb-4 mt-1 text-xs text-zinc-500">
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
              <HoverCard key={insight.id} className="rounded-2xl">
                <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${TONE_CHIP[presentation.tone]}`}
                    >
                      {presentation.label}
                    </span>
                    {insight.status === 'APPLIED' && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-300">
                        <Check size={10} strokeWidth={1.5} aria-hidden />
                        Ya aplicado
                      </span>
                    )}
                    <span className="ml-auto text-[11px] text-zinc-500">
                      {DATE_FMT.format(insight.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-zinc-100">{insight.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {insight.description}
                  </p>

                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] p-3">
                    <Lightbulb
                      size={15}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-cyan-400"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-400/80">
                        Qué podés hacer
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-zinc-300">
                        {insight.suggestedAction}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
                    <MessageSquare size={12} strokeWidth={1.5} aria-hidden />
                    Visto en {insight.evidenceCount}{' '}
                    {insight.evidenceCount === 1 ? 'conversación' : 'conversaciones'}
                  </p>
                </article>
              </HoverCard>
            )
          })}
        </div>
      )}
    </section>
  )
}
