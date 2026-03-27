'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendBadge } from './TrendBadge'
import { AnimatedCounter } from './AnimatedCounter'

const COLORS = {
  cyan: {
    icon: 'text-cyan-400',
    value: 'text-cyan-400',
    iconBg: 'bg-cyan-500/[0.08] border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/25',
    topLine: 'via-cyan-500/30',
  },
  green: {
    icon: 'text-emerald-400',
    value: 'text-emerald-400',
    iconBg: 'bg-emerald-500/[0.08] border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/25',
    topLine: 'via-emerald-500/30',
  },
  red: {
    icon: 'text-rose-400',
    value: 'text-rose-400',
    iconBg: 'bg-rose-500/[0.08] border-rose-500/20',
    hoverBorder: 'hover:border-rose-500/25',
    topLine: 'via-rose-500/30',
  },
  violet: {
    icon: 'text-violet-400',
    value: 'text-violet-400',
    iconBg: 'bg-violet-500/[0.08] border-violet-500/20',
    hoverBorder: 'hover:border-violet-500/25',
    topLine: 'via-violet-500/30',
  },
  amber: {
    icon: 'text-amber-400',
    value: 'text-amber-400',
    iconBg: 'bg-amber-500/[0.08] border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/25',
    topLine: 'via-amber-500/30',
  },
} as const

interface AnalyticsMetricCardProps {
  label: string
  tooltip: string
  displayValue: string
  rawValue?: number
  suffix?: string
  icon: ReactNode
  color: keyof typeof COLORS
  trend?: { value: number; displayValue?: string } | null
  invertColors?: boolean
  delay?: number
}

export function AnalyticsMetricCard({
  label,
  tooltip,
  displayValue,
  rawValue,
  suffix,
  icon,
  color,
  trend,
  invertColors = false,
  delay = 0,
}: AnalyticsMetricCardProps) {
  const c = COLORS[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className={`group relative overflow-hidden rounded-3xl p-7 transition-all duration-500 hover:scale-[1.015] cursor-default border border-white/[0.08] ${c.hoverBorder} bg-white/[0.025] backdrop-blur-3xl shadow-2xl`}
    >
      {/* Accent top line on hover */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${c.topLine} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="flex items-start justify-between mb-7">
        <div
          className={`p-2.5 rounded-xl border ${c.iconBg} ${c.icon} transition-transform group-hover:scale-110 duration-500`}
        >
          {icon}
        </div>
        {trend && (
          <TrendBadge
            value={trend.value}
            displayValue={trend.displayValue}
            invertColors={invertColors}
          />
        )}
      </div>

      <div className="space-y-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 group-hover:text-white/70 transition-colors">
          {label}
        </p>

        <div className={`text-5xl font-black tracking-tighter ${c.value} leading-none py-1.5`}>
          {rawValue !== undefined ? (
            <span className="flex items-baseline gap-0.5">
              <AnimatedCounter value={Math.round(rawValue)} />
              {suffix && (
                <span className="text-3xl font-bold opacity-80 ml-0.5">{suffix}</span>
              )}
            </span>
          ) : (
            <span>{displayValue}</span>
          )}
        </div>

        {trend && (
          <p className="text-[10px] text-zinc-600 font-medium">vs mes anterior</p>
        )}

        <p className="text-[10px] text-zinc-600/70 leading-relaxed pt-3 border-t border-white/[0.04] mt-3">
          {tooltip}
        </p>
      </div>
    </motion.div>
  )
}
