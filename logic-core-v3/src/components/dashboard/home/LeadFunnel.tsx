// P1.C — "Qué pasó con tus leads": embudo leads → contactados → vendidos del
// período. Degradación honesta: los que siguen sin tocar se muestran como
// "X sin actualizar" con un nudge suave a Mis contactos — nunca se inventan ni
// se ocultan. Server component. Empty state honesto cuando no hay leads.

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { SectionEmptyState } from './SectionEmptyState'
import type { Funnel } from '@/lib/dashboard/home-metrics-logic'

const LEADS_HREF = '/dashboard/chatbot/leads'

interface LeadFunnelProps {
  funnel: Funnel
}

interface Step {
  label: string
  value: number
  tone: string
}

export function LeadFunnel({ funnel }: LeadFunnelProps) {
  if (funnel.total === 0) {
    return (
      <SectionEmptyState
        variant="funnel"
        title="Tu embudo todavía está vacío"
        description="Apenas entren leads vas a ver cuántos contactaste y cuántos se convirtieron en clientes."
      />
    )
  }

  const steps: Step[] = [
    { label: 'Entraron', value: funnel.total, tone: 'text-cyan-300' },
    { label: 'Contactaste', value: funnel.contacted, tone: 'text-sky-300' },
    { label: 'Vendiste', value: funnel.sold, tone: 'text-emerald-300' },
  ]

  return (
    <FadeIn>
      <Card padding="lg">
        <h2 className="mb-1 text-lg font-semibold text-zinc-100">Qué pasó con tus leads</h2>
        <p className="mb-4 text-xs text-zinc-500">Del primer contacto a la venta, esta semana</p>

        <div className="grid grid-cols-3 gap-3">
          {steps.map((s) => {
            const pct = funnel.total > 0 ? Math.round((s.value / funnel.total) * 100) : 0
            return (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className={`text-2xl font-semibold tracking-tight tabular-nums ${s.tone}`}>
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">{s.label}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-white/20"
                    style={{ width: `${Math.max(4, pct)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {funnel.pending > 0 && (
          <Link
            href={`${LEADS_HREF}?status=NEW`}
            className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2.5 transition-colors hover:bg-amber-400/10"
          >
            <span className="text-sm text-amber-200/90">
              {funnel.pending} sin actualizar — marcá qué pasó con{' '}
              {funnel.pending === 1 ? 'él' : 'ellos'}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-amber-300" strokeWidth={1.5} />
          </Link>
        )}
      </Card>
    </FadeIn>
  )
}
