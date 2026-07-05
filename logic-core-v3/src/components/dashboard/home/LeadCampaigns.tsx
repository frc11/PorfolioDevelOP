// P4.1 — "Campañas": desglose de leads por campaña UTM del período. Reusa el
// humanizador compartido (lead-origin.ts → campaignLabel) vía la agregación
// tallyCampaigns. Server component. Empty state honesto cuando todavía no hay
// ninguna campaña etiquetada (el caso real hoy); los leads sin campaña se
// muestran como un renglón "Sin campaña", nunca como una campaña inventada.

import { Card } from '@/components/ui/Card'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { SectionEmptyState } from './SectionEmptyState'
import { adminHoverCls } from '@/lib/hover'
import { cn } from '@/lib/utils'
import type { CampaignBreakdown } from '@/lib/dashboard/home-metrics-logic'

interface LeadCampaignsProps {
  campaigns: CampaignBreakdown
}

export function LeadCampaigns({ campaigns }: LeadCampaignsProps) {
  const { campaigns: buckets, noCampaign, total } = campaigns

  // Sin NINGUNA campaña real en el período → estado vacío honesto (aunque haya
  // leads sin etiquetar): no tiene sentido una única barra de 100% "Sin campaña".
  if (buckets.length === 0) {
    return (
      <SectionEmptyState
        variant="campaign"
        title="Todavía sin campañas"
        description="Cuando corras una campaña con enlace UTM (Instagram Ads, Google Ads, un mail...), vas a ver acá cuántos leads te trajo cada una."
      />
    )
  }

  // Las campañas reales resaltan (cian); "Sin campaña" es el resto, en tono muted.
  const rows: { label: string; count: number; muted: boolean }[] = [
    ...buckets.map((b) => ({ label: b.label, count: b.count, muted: false })),
    ...(noCampaign > 0 ? [{ label: 'Sin campaña', count: noCampaign, muted: true }] : []),
  ]

  return (
    <FadeIn className="h-full">
      <Card padding="lg" className={cn('h-full', adminHoverCls)}>
        <h2 className="mb-1 text-lg font-semibold text-zinc-100">Campañas</h2>
        <p className="mb-4 text-xs text-zinc-500">Qué campaña te trajo leads esta semana</p>

        <ul className="space-y-3">
          {rows.map((r) => {
            const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
            return (
              <li key={r.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className={r.muted ? 'text-zinc-400' : 'text-zinc-300'}>{r.label}</span>
                  <span className="tabular-nums text-zinc-500">
                    {r.count} {r.count === 1 ? 'lead' : 'leads'} · {pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={cn('h-full rounded-full', r.muted ? 'bg-white/[0.12]' : 'bg-cyan-400/60')}
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
