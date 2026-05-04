import { MapPin, MousePointerClick, PhoneCall, Star, type LucideIcon } from 'lucide-react'
import type { GBPLocationMetrics } from '@/lib/integrations/google-business-profile'

type GBPMetricsCardProps = {
  metrics: GBPLocationMetrics
}

const STAR_ITEMS = [1, 2, 3, 4, 5] as const

function formatDate(date: Date) {
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-400">
      {STAR_ITEMS.map((value) => (
        <Star
          key={value}
          size={17}
          strokeWidth={1.5}
          className={value <= Math.round(rating) ? 'fill-amber-400' : 'fill-transparent text-zinc-700'}
        />
      ))}
    </div>
  )
}

function PerformanceChip({
  label,
  value,
  Icon,
}: {
  label: string
  value: number
  Icon: LucideIcon
}) {
  return (
    <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.045] px-4 py-3">
      <div className="flex items-center gap-2 text-cyan-400">
        <Icon size={14} strokeWidth={1.5} />
        <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="mt-2 font-mono text-xl font-black tabular-nums text-zinc-100">
        {value.toLocaleString('es-AR')}
      </p>
    </div>
  )
}

export function GBPMetricsCard({ metrics }: GBPMetricsCardProps) {
  const recentReviews = metrics.recentReviews.slice(0, 3)
  const performanceItems = [
    {
      key: 'profileViews',
      label: 'Vistas',
      value: metrics.performance.profileViews,
      Icon: Star,
    },
    {
      key: 'websiteClicks',
      label: 'Web',
      value: metrics.performance.websiteClicks,
      Icon: MousePointerClick,
    },
    {
      key: 'callClicks',
      label: 'Llamadas',
      value: metrics.performance.callClicks,
      Icon: PhoneCall,
    },
    {
      key: 'directionRequests',
      label: 'Cómo llegar',
      value: metrics.performance.directionRequests,
      Icon: MapPin,
    },
  ].filter((item) => item.value > 0)

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-2xl sm:p-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.045] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <Star size={20} strokeWidth={1.5} className="fill-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                Reputación Google
              </p>
              <p className="mt-1 text-xs text-zinc-500">Google Business Profile</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="font-mono text-6xl font-black tabular-nums text-amber-300">
              {metrics.averageRating.toLocaleString('es-AR', {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </p>
            <div className="mt-3">
              <RatingStars rating={metrics.averageRating} />
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              {metrics.totalReviews.toLocaleString('es-AR')} reseñas registradas
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.018] p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                Reseñas recientes
              </p>
              <p className="mt-1 text-xs text-zinc-600">Últimas respuestas visibles del perfil</p>
            </div>
          </div>

          {recentReviews.length === 0 ? (
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-sm text-zinc-500">
              No hay reseñas recientes para mostrar.
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-3">
              {recentReviews.map((review, index) => (
                <article
                  key={`${review.reviewerName}-${review.createdAt.toISOString()}-${index}`}
                  className="rounded-xl border border-white/[0.06] bg-zinc-950/30 px-4 py-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-zinc-200">
                        {review.reviewerName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <RatingStars rating={review.rating} />
                        <span className="text-[10px] font-semibold text-zinc-600">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>

                    {!review.replied && (
                      <span className="w-fit rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
                        Sin responder
                      </span>
                    )}
                  </div>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">
                    {review.comment?.trim() || 'Sin comentario escrito.'}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {performanceItems.length > 0 && (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              Performance del perfil
            </p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              Últimos 30 días
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {performanceItems.map((item) => (
              <PerformanceChip
                key={item.key}
                label={item.label}
                value={item.value}
                Icon={item.Icon}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
