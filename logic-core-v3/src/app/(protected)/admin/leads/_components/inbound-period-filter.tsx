'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { InboundPeriod } from '../_actions/inbound.schemas'

const PERIOD_LABELS: Record<InboundPeriod, string> = {
  '1w': '1 semana',
  '1m': '1 mes',
  '6m': '6 meses',
  '1y': '1 año',
  custom: 'Personalizado',
}
const PRESET_PERIODS: ReadonlyArray<Exclude<InboundPeriod, 'custom'>> = ['1w', '1m', '6m', '1y']

function buildPeriodHref(period: string, from?: string, to?: string): string {
  const params = new URLSearchParams()
  params.set('tab', 'inbound')
  params.set('period', period)
  if (period === 'custom' && from && to) {
    params.set('from', from)
    params.set('to', to)
  }
  return `/admin/leads?${params.toString()}`
}

const periodChipClass = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
    active
      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
      : 'border-white/10 bg-black/20 text-zinc-400 hover:text-zinc-200',
  )

/**
 * Filtro de período del listado inbound (server-driven). Navega por <Link> (preserva
 * tab=inbound, SIN router.push), highlight vía useSearchParams. 'Personalizado' revela
 * inputs date y 'Aplicar' (Link, deshabilitado hasta tener ambas fechas) empuja from/to.
 */
export function InboundPeriodFilter() {
  const searchParams = useSearchParams()
  const currentPeriod = searchParams.get('period') ?? '1m'
  const [customFrom, setCustomFrom] = useState(searchParams.get('from') ?? '')
  const [customTo, setCustomTo] = useState(searchParams.get('to') ?? '')
  const [showCustom, setShowCustom] = useState(currentPeriod === 'custom')

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Periodo</span>
        {PRESET_PERIODS.map((period) => (
          <Link
            key={period}
            href={buildPeriodHref(period)}
            aria-current={currentPeriod === period ? 'true' : undefined}
            className={periodChipClass(currentPeriod === period)}
          >
            {PERIOD_LABELS[period]}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom((current) => !current)}
          aria-expanded={showCustom}
          className={periodChipClass(currentPeriod === 'custom')}
        >
          {PERIOD_LABELS.custom}
        </button>
      </div>

      {showCustom ? (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[11px] text-zinc-400">
            Desde
            <input
              type="date"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/35"
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-zinc-400">
            Hasta
            <input
              type="date"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-cyan-400/35"
            />
          </label>
          <Link
            href={buildPeriodHref('custom', customFrom, customTo)}
            aria-disabled={!customFrom || !customTo}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-medium transition-colors',
              !customFrom || !customTo
                ? 'pointer-events-none border-white/10 text-zinc-600 opacity-50'
                : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15',
            )}
          >
            Aplicar
          </Link>
        </div>
      ) : null}
    </>
  )
}
