'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// Rango activo que el filtro emite al padre. null = sin filtro de fecha (mostrar todo):
// pre-mount (gate de hidratación) o "Personalizado" incompleto/invalido.
export type TicketDateRange = { fromMs: number; toMs: number } | null

type RangePreset = '1m' | '3m' | '6m' | '1y'
type Preset = 'all' | RangePreset | 'custom'

const PRESET_LABELS: Record<Preset, string> = {
  all: 'Todos',
  '1m': '1 mes',
  '3m': '3 meses',
  '6m': '6 meses',
  '1y': '1 año',
  custom: 'Personalizado',
}

const RANGE_PRESETS: ReadonlyArray<RangePreset> = ['1m', '3m', '6m', '1y']
const PRESET_MONTHS: Record<RangePreset, number> = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }

const MS_PER_DAY = 86_400_000

// Tunables del reveal inline de los campos custom (fade + leve x, no height).
const SLIDE_DURATION = 0.2
const SLIDE_EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

function presetCutoff(nowMs: number, preset: RangePreset): number {
  const date = new Date(nowMs)
  date.setMonth(date.getMonth() - PRESET_MONTHS[preset])
  return date.getTime()
}

const chipClass = (active: boolean) =>
  cn(
    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
    active
      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100'
      : 'border-white/10 bg-black/20 text-zinc-400 hover:text-zinc-200',
  )

type ThemedDateFieldProps = {
  label: string
  value: string
  min?: string
  max?: string
  onChange: (value: string) => void
}

// Replica local del ThemedDateInput de leads. NO se importa: vive en _components privado
// de otra seccion y tickets se mantiene aislado (replicar, no importar). `color-scheme: dark`
// pinta el date-picker nativo acorde al tema.
function ThemedDateField({ label, value, min, max, onChange }: ThemedDateFieldProps) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] text-zinc-400">
      <span>{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        style={{ colorScheme: 'dark' }}
        className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-white outline-none transition-colors focus:border-cyan-400/35"
      />
    </label>
  )
}

type TicketDateFilterProps = {
  /** Pasar un setter estable (p. ej. el de useState) para evitar re-emisiones en loop. */
  onChange: (range: TicketDateRange) => void
}

/**
 * Filtro de fechas client-side, contiguo a los tabs de estado en el mismo renglon.
 * Chips de preset + "Personalizado" (que despliega Desde/Hasta INLINE a la derecha, en el
 * espacio sobrante del renglon — no hacia abajo). Filtra en memoria (sin server/URL).
 * Default: ultimo mes ('1m'); "Todos" emite null (sin filtro de fecha). Emite el rango
 * activo al padre via onChange; el padre lo aplica sobre los tickets ya traidos.
 */
export function TicketDateFilter({ onChange }: TicketDateFilterProps) {
  const reduce = useReducedMotion()
  const [preset, setPreset] = useState<Preset>('1m')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  // nowMs se resuelve solo en cliente (post-mount): comparar contra un "ahora" distinto en
  // server vs cliente provocaria mismatch de hidratacion. Hasta entonces el rango es null
  // (el padre muestra todo) y el primer paint coincide con el SSR.
  const [nowMs, setNowMs] = useState<number | null>(null)

  useEffect(() => {
    setNowMs(Date.now())
  }, [])

  useEffect(() => {
    if (preset === 'all') {
      onChange(null)
      return
    }
    if (nowMs === null) {
      onChange(null)
      return
    }
    if (preset === 'custom') {
      if (!from || !to) {
        onChange(null)
        return
      }
      const fromMs = new Date(from).getTime()
      const toMs = new Date(to).getTime() + MS_PER_DAY - 1 // incluir el dia "hasta" completo
      if (Number.isNaN(fromMs) || Number.isNaN(toMs) || fromMs > toMs) {
        onChange(null)
        return
      }
      onChange({ fromMs, toMs })
      return
    }
    onChange({ fromMs: presetCutoff(nowMs, preset), toMs: nowMs })
  }, [nowMs, preset, from, to, onChange])

  const showCustom = preset === 'custom'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Periodo</span>
      <button
        type="button"
        onClick={() => setPreset('all')}
        aria-pressed={preset === 'all'}
        className={chipClass(preset === 'all')}
      >
        {PRESET_LABELS.all}
      </button>
      {RANGE_PRESETS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setPreset(option)}
          aria-pressed={preset === option}
          className={chipClass(preset === option)}
        >
          {PRESET_LABELS[option]}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setPreset('custom')}
        aria-pressed={showCustom}
        aria-expanded={showCustom}
        className={chipClass(showCustom)}
      >
        {PRESET_LABELS.custom}
      </button>

      <AnimatePresence initial={false}>
        {showCustom ? (
          <motion.div
            key="custom-range"
            initial={reduce ? false : { opacity: 0, x: -4 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -4 }}
            transition={reduce ? { duration: 0 } : { duration: SLIDE_DURATION, ease: SLIDE_EASE }}
            className="flex flex-wrap items-center gap-3"
          >
            <ThemedDateField label="Desde" value={from} max={to || undefined} onChange={setFrom} />
            <ThemedDateField label="Hasta" value={to} min={from || undefined} onChange={setTo} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
