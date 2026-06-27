import {
  AlertCircle,
  Info,
  Monitor,
  Smartphone,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { CoreWebVital, PageSpeedReport } from '@/lib/integrations/pagespeed'
import { HoverCard } from './_shared/HoverCard'

type PageSpeedCardProps = {
  mobile: PageSpeedReport | null
  desktop: PageSpeedReport | null
}

type Tone = 'emerald' | 'amber' | 'rose' | 'zinc'

const SCORE_TONES: Record<Tone, { text: string; border: string; bg: string; iconBg: string }> = {
  emerald: {
    text: 'text-emerald-300',
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/10',
    iconBg: 'bg-emerald-400/10',
  },
  amber: {
    text: 'text-amber-300',
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/10',
    iconBg: 'bg-amber-400/10',
  },
  rose: {
    text: 'text-rose-300',
    border: 'border-rose-400/20',
    bg: 'bg-rose-400/10',
    iconBg: 'bg-rose-400/10',
  },
  zinc: {
    text: 'text-zinc-400',
    border: 'border-white/10',
    bg: 'bg-white/[0.02]',
    iconBg: 'bg-white/[0.04]',
  },
}

function getScoreTone(score: number | null): Tone {
  if (score === null) return 'zinc'
  if (score >= 90) return 'emerald'
  if (score >= 50) return 'amber'
  return 'rose'
}

function getRatingTone(rating: CoreWebVital['rating']): Tone {
  if (rating === 'good') return 'emerald'
  if (rating === 'needs-improvement') return 'amber'
  return 'rose'
}

function formatDate(date: Date) {
  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatVitalValue(vital: CoreWebVital) {
  if (vital.unit === 'score') return vital.value.toLocaleString('es-AR')
  if (vital.unit === 'ms') return `${vital.value.toLocaleString('es-AR')} ms`
  return vital.value.toLocaleString('es-AR')
}

function ScorePanel({
  report,
  label,
  Icon,
}: {
  report: PageSpeedReport | null
  label: string
  Icon: LucideIcon
}) {
  const score = report?.performanceScore ?? null
  const tone = SCORE_TONES[getScoreTone(score)]

  return (
    <div className={`rounded-xl border ${tone.border} ${tone.bg} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
          <p className={`mt-2 text-3xl font-medium tabular-nums ${tone.text}`}>{score ?? '--'}</p>
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-md border ${tone.border} ${tone.iconBg}`}
        >
          <Icon size={18} className={tone.text} strokeWidth={1.5} />
        </div>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Performance score</p>
    </div>
  )
}

function VitalChip({ vital }: { vital: CoreWebVital }) {
  const tone = SCORE_TONES[getRatingTone(vital.rating)]

  return (
    <div className={`rounded-xl border ${tone.border} ${tone.bg} px-3 py-3`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{vital.metric}</p>
      <p className={`mt-1 text-lg font-medium tabular-nums ${tone.text}`}>
        {formatVitalValue(vital)}
      </p>
    </div>
  )
}

function OpportunitiesList({
  title,
  report,
}: {
  title: string
  report: PageSpeedReport | null
}) {
  const opportunities = report?.topOpportunities ?? []

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">{title}</p>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
          Top 3
        </span>
      </div>

      {opportunities.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-500">
          Sin oportunidades críticas detectadas.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {opportunities.map((opportunity) => (
            <div
              key={`${report?.strategy ?? title}-${opportunity.id}`}
              className="rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={15}
                  className="mt-0.5 shrink-0 text-amber-300"
                  strokeWidth={1.5}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <p className="text-sm font-medium leading-snug text-amber-200">
                      {opportunity.title}
                    </p>
                    {typeof opportunity.estimatedSavingsMs === 'number' && (
                      <span className="shrink-0 text-[10px] font-medium tabular-nums text-amber-300">
                        ~{Math.round(opportunity.estimatedSavingsMs).toLocaleString('es-AR')} ms
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                    {opportunity.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function PageSpeedCard({ mobile, desktop }: PageSpeedCardProps) {
  const latestReport = mobile ?? desktop

  if (!latestReport) {
    return (
      <HoverCard className="rounded-2xl">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Info size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Velocidad del sitio</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                Monitoreo de velocidad no configurado. Hablá con tu equipo de develOP.
              </p>
            </div>
          </div>
        </div>
      </HoverCard>
    )
  }

  const mobileVitals = mobile?.coreWebVitals.filter((vital) =>
    ['LCP', 'CLS', 'INP', 'FCP'].includes(vital.metric),
  ) ?? []

  return (
    <HoverCard className="rounded-2xl">
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <Zap size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                PageSpeed Insights
              </p>
              <h2 className="mt-1 text-base font-medium text-zinc-200">Velocidad del sitio</h2>
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Última medición{' '}
            <span className="text-zinc-300">{formatDate(latestReport.fetchedAt)}</span>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ScorePanel report={mobile} label="Mobile" Icon={Smartphone} />
          <ScorePanel report={desktop} label="Desktop" Icon={Monitor} />
        </div>

        {mobileVitals.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              Core Web Vitals mobile
            </p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {mobileVitals.map((vital) => (
                <VitalChip key={vital.metric} vital={vital} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <OpportunitiesList title="Oportunidades mobile" report={mobile} />
          <OpportunitiesList title="Oportunidades desktop" report={desktop} />
        </div>
      </section>
    </HoverCard>
  )
}
