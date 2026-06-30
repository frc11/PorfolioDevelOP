// P1.C — "De dónde llegan": top de orígenes del período (Google, Instagram,
// Directo, ...). Mapeo honesto: lo no reconocible es 'Otros', nada se inventa.
// Server component. Empty state honesto cuando todavía no hay leads.

import { Card } from '@/components/ui/Card'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { SectionEmptyState } from './SectionEmptyState'
import { adminHoverCls } from '@/lib/hover'
import { cn } from '@/lib/utils'
import type { OriginBucket } from '@/lib/dashboard/home-metrics-logic'

interface LeadOriginsProps {
  origins: OriginBucket[]
}

export function LeadOrigins({ origins }: LeadOriginsProps) {
  const total = origins.reduce((acc, o) => acc + o.count, 0)

  if (total === 0) {
    return (
      <SectionEmptyState
        variant="origin"
        title="Todavía no sabemos de dónde llegan"
        description="Cuando entren leads desde Google, tus redes o tu sitio, los vas a ver agrupados acá."
      />
    )
  }

  return (
    <FadeIn className="h-full">
      <Card padding="lg" className={cn('h-full', adminHoverCls)}>
        <h2 className="mb-1 text-lg font-semibold text-zinc-100">De dónde llegan</h2>
        <p className="mb-4 text-xs text-zinc-500">Los canales que te trajeron leads esta semana</p>

        <ul className="space-y-3">
          {origins.map((o) => {
            const pct = Math.round((o.count / total) * 100)
            return (
              <li key={o.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-zinc-300">{o.label}</span>
                  <span className="tabular-nums text-zinc-500">
                    {o.count} {o.count === 1 ? 'lead' : 'leads'} · {pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-cyan-400/60"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </FadeIn>
  )
}
