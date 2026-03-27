'use client'

import { motion } from 'framer-motion'

interface TrendBadgeProps {
  /** Numeric change — positive = up, negative = down */
  value: number
  /** Override the displayed number (e.g. "0:23" for time deltas) */
  displayValue?: string
  /** Unit suffix after the number (default: '%') */
  suffix?: string
  /** When true, rising is bad and falling is good (e.g. bounce rate, open tickets) */
  invertColors?: boolean
}

export function TrendBadge({
  value,
  displayValue,
  suffix = '%',
  invertColors = false,
}: TrendBadgeProps) {
  if (value === 0) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        title="vs mes anterior"
        className="inline-flex items-center gap-1 rounded-full border border-zinc-600/30 bg-zinc-700/20 px-2 py-0.5 text-[10px] font-bold tracking-tight text-zinc-500"
      >
        — 0{suffix}
      </motion.span>
    )
  }

  const isRising = value > 0
  const isGood = invertColors ? !isRising : isRising
  const arrow = isRising ? '↑' : '↓'
  const formatted = displayValue ?? `${Math.abs(value).toFixed(1)}${suffix}`

  return (
    <motion.span
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      title="vs mes anterior"
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-tight ${
        isGood
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'border-rose-500/20 bg-rose-500/10 text-rose-400'
      }`}
    >
      {arrow} {formatted}
    </motion.span>
  )
}
