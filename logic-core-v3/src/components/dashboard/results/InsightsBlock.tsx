import { AlertCircle, Info, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react'
import type { ResultInsight } from '@/lib/ai/results-insights'
import { HoverCard } from './_shared/HoverCard'

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
    text: 'text-emerald-300',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/10',
  },
  neutral: {
    icon: Info,
    text: 'text-zinc-400',
    border: 'border-white/10',
    bg: 'bg-white/[0.02]',
  },
  attention: {
    icon: AlertCircle,
    text: 'text-amber-300',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/10',
  },
}

export function InsightsBlock({ insights }: InsightsBlockProps) {
  if (insights.length === 0) return null

  return (
    <HoverCard className="rounded-2xl">
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
            <Sparkles size={16} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Insights automáticos
            </p>
            <p className="mt-1 text-xs text-zinc-500">
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
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tone.border} bg-black/20`}
                  >
                    <Icon size={15} className={tone.text} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug text-zinc-100">
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
    </HoverCard>
  )
}
