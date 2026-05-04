import { AlertCircle, Info, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react'
import type { ResultInsight } from '@/lib/ai/results-insights'

type InsightsBlockProps = {
  insights: ResultInsight[]
}

type Tone = {
  icon: LucideIcon
  text: string
  border: string
  bg: string
}

const TONES: Record<ResultInsight['type'], Tone> = {
  positive: {
    icon: TrendingUp,
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/[0.06]',
  },
  neutral: {
    icon: Info,
    text: 'text-zinc-400',
    border: 'border-white/[0.07]',
    bg: 'bg-white/[0.025]',
  },
  attention: {
    icon: AlertCircle,
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/[0.06]',
  },
}

export function InsightsBlock({ insights }: InsightsBlockProps) {
  if (insights.length === 0) return null

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-2xl sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
          <Sparkles size={16} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-200">
            Insights automáticos
          </h2>
          <p className="mt-1 text-[11px] text-zinc-600">
            Lectura ejecutiva generada con tus datos reales
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {insights.slice(0, 3).map((insight) => {
          const tone = TONES[insight.type]
          const Icon = tone.icon

          return (
            <article
              key={`${insight.type}-${insight.title}`}
              className={`rounded-xl border ${tone.border} ${tone.bg} px-4 py-4`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone.border} bg-zinc-950/20`}
                >
                  <Icon size={15} className={tone.text} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-snug text-zinc-100">
                    {insight.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    {insight.description}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
