'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { ThemedDateInput } from './themed-date-input'
import { INBOUND_DEFAULT_PERIOD, type InboundPeriod } from '../_actions/inbound.schemas'

// === TUNABLES (calibrá por ojo) ===
const SLIDE_DURATION = 0.2 // s — slide vertical (alto+opacidad) de los campos custom
const SLIDE_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

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
 * Filtro de período inbound (server-driven via <Link>). "Personalizado" abre los campos
 * from/to con un slide (motion/react); elegir otro período los cierra. El estado de
 * apertura se sincroniza con la URL para no quedar abierto al pasar a un preset.
 */
export function InboundPeriodFilter() {
  const searchParams = useSearchParams()
  const reduced = useReducedMotion()
  const currentPeriod = searchParams.get('period') ?? INBOUND_DEFAULT_PERIOD
  const [customFrom, setCustomFrom] = useState(searchParams.get('from') ?? '')
  const [customTo, setCustomTo] = useState(searchParams.get('to') ?? '')
  const [showCustom, setShowCustom] = useState(currentPeriod === 'custom')

  // Sync con la URL (reset-on-prop-change en render): cambiar de período cierra/abre los
  // campos custom según corresponda — sin esto quedaban abiertos al pasar a un preset.
  const [syncedPeriod, setSyncedPeriod] = useState(currentPeriod)
  if (syncedPeriod !== currentPeriod) {
    setSyncedPeriod(currentPeriod)
    setShowCustom(currentPeriod === 'custom')
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Periodo</span>
        {PRESET_PERIODS.map((period) => (
          <Link
            key={period}
            href={buildPeriodHref(period)}
            onClick={() => setShowCustom(false)}
            aria-current={!showCustom && currentPeriod === period ? 'true' : undefined}
            className={periodChipClass(!showCustom && currentPeriod === period)}
          >
            {PERIOD_LABELS[period]}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          aria-expanded={showCustom}
          className={periodChipClass(showCustom)}
        >
          {PERIOD_LABELS.custom}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showCustom ? (
          <motion.div
            key="custom-range"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: SLIDE_DURATION, ease: SLIDE_EASE }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-end gap-3 pt-3">
              <ThemedDateInput label="Desde" value={customFrom} onChange={setCustomFrom} />
              <ThemedDateInput label="Hasta" value={customTo} onChange={setCustomTo} />
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
