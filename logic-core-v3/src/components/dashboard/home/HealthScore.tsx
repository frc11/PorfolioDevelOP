'use client'

/**
 * HealthScore.tsx
 *
 * Hero visual component — Apple Watch–style concentric rings showing
 * Digital / Commercial / Operational scores with animated spring counter.
 *
 * Renders three distinct states:
 *   ONBOARDING — pulsing rings, no score, calibration messaging
 *   PARTIAL    — live rings + score + partial-data disclaimer
 *   COMPLETE   — full live rings + score + trend
 *
 * This component is PURE PRESENTATIONAL — all computation happens server-side
 * in getHealthScore(). No fetches or calculations run in the client.
 */

import { motion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown, Minus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HealthScoreResult, HealthScoreDimension } from '@/lib/health-score'

// ─── Public component ─────────────────────────────────────────────────────────

interface HealthScoreProps {
  data: HealthScoreResult
}

export function HealthScore({ data }: HealthScoreProps) {
  if (data.level === 'ONBOARDING') {
    return <HealthScoreOnboarding data={data} />
  }
  return <HealthScoreActive data={data} />
}

// ─── Active state (PARTIAL | COMPLETE) ───────────────────────────────────────

function HealthScoreActive({ data }: { data: HealthScoreResult }) {
  const isPartial = data.level === 'PARTIAL'

  const [displayValue, setDisplayValue] = useState(0)
  const spring = useSpring(0, { stiffness: 60, damping: 18 })

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => setDisplayValue(Math.round(v)))
    spring.set(data.total)
    return unsubscribe
  }, [spring, data.total])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-cyan-500/[0.05] backdrop-blur-2xl p-6 sm:p-10">
      {/* Ambient glows */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" aria-hidden />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" aria-hidden />

      <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-center">

        {/* ── Rings + center score ── */}
        <div
          className="relative mx-auto lg:mx-0 w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]"
          role="img"
          aria-label={`Health Score: ${data.total} de 100`}
        >
          <ConcentricRings
            digital={data.dimensions[0].score}
            commercial={data.dimensions[1].score}
            operational={data.dimensions[2].score}
          />

          {/* Score number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <span className="text-7xl sm:text-8xl font-black tracking-tighter text-white tabular-nums leading-none">
                {displayValue}
              </span>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">
                de 100
              </span>
            </motion.div>
          </div>
        </div>

        {/* ── Details panel ── */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                Health Score
              </span>
              <TrendChip value={data.trend.value} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {scoreToTitle(data.total)}
            </h2>
            <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">
              {scoreToSubtitle(data.total, data.trend.value)}
            </p>
          </div>

          {/* 3 dimension mini-cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {data.dimensions.map((dim, i) => (
              <DimensionMini key={dim.key} dim={dim} index={i} />
            ))}
          </div>

          {/* Partial disclaimer */}
          {isPartial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-2 text-[10px] text-zinc-600"
            >
              <Sparkles size={11} className="text-cyan-500/60 flex-shrink-0" />
              <span>
                Calibrando · {data.connectedSources} de {data.totalSources} fuentes activas
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Onboarding state ─────────────────────────────────────────────────────────

function HealthScoreOnboarding({ data }: { data: HealthScoreResult }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-cyan-500/[0.05] backdrop-blur-2xl p-6 sm:p-10">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" aria-hidden />

      <div className="relative grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-center">
        {/* Pulsing rings — no score visible */}
        <div
          className="relative mx-auto lg:mx-0 w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]"
          aria-hidden
        >
          <PulsingRings />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Sparkles className="text-cyan-400 mb-2" size={28} />
            </motion.div>
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em]">
              Calibrando
            </span>
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-cyan-400">
              Health Score · En construcción
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              Estamos calibrando tu score
            </h2>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
              develOP está conectando las herramientas de tu negocio.
              En cuanto tengamos datos suficientes, verás tu Health Score completo.
            </p>
          </div>

          {/* Progress bar */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Implementación
              </span>
              <span className="text-xs font-bold text-cyan-400">
                {data.connectedSources}/{data.totalSources}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.connectionPercentage}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
              />
            </div>
            <p className="text-[10px] text-zinc-600 mt-2">
              ETA: tu score real estará disponible en pocos días.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Concentric animated rings ────────────────────────────────────────────────

const RING_SIZE = 300
const RING_CENTER = RING_SIZE / 2
const STROKE_WIDTH = 18
const RING_GAP = 6

const OUTER_RADIUS = RING_CENTER - STROKE_WIDTH / 2 - 4
const MIDDLE_RADIUS = OUTER_RADIUS - STROKE_WIDTH - RING_GAP
const INNER_RADIUS = MIDDLE_RADIUS - STROKE_WIDTH - RING_GAP

const RING_RADII = [OUTER_RADIUS, MIDDLE_RADIUS, INNER_RADIUS] as const

const RING_CONFIG = [
  { color: '#06b6d4', label: 'Digital' },       // cyan  — outer
  { color: '#8b5cf6', label: 'Commercial' },     // violet — middle
  { color: '#10b981', label: 'Operational' },    // emerald — inner
] as const

function ConcentricRings({
  digital,
  commercial,
  operational,
}: {
  digital: number
  commercial: number
  operational: number
}) {
  const values = [digital, commercial, operational] as const

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      className="overflow-visible"
      aria-hidden
    >
      <defs>
        {RING_CONFIG.map((ring, i) => (
          <linearGradient key={i} id={`hs-ring-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ring.color} stopOpacity={0.7} />
            <stop offset="100%" stopColor={ring.color} stopOpacity={1} />
          </linearGradient>
        ))}
      </defs>

      {RING_CONFIG.map((ring, i) => {
        const r = RING_RADII[i]
        const value = values[i]
        const circumference = 2 * Math.PI * r
        const dashOffset = circumference - (value / 100) * circumference

        return (
          <g key={i} transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}>
            {/* Background track */}
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeOpacity={0.12}
              strokeWidth={STROKE_WIDTH}
            />
            {/* Animated progress arc */}
            <motion.circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={r}
              fill="none"
              stroke={`url(#hs-ring-grad-${i})`}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{
                duration: 1.6,
                delay: 0.2 + i * 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ filter: `drop-shadow(0 0 8px ${ring.color}55)` }}
            />
          </g>
        )
      })}
    </svg>
  )
}

// ─── Pulsing rings (onboarding) ───────────────────────────────────────────────

function PulsingRings() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
      aria-hidden
    >
      {RING_RADII.map((r, i) => (
        <motion.circle
          key={i}
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={r}
          fill="none"
          stroke={RING_CONFIG[i].color}
          strokeOpacity={0.15}
          strokeWidth={STROKE_WIDTH}
          animate={{ strokeOpacity: [0.08, 0.32, 0.08] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.45,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  )
}

// ─── Dimension mini-card ──────────────────────────────────────────────────────

const DIM_STYLES: Record<
  string,
  { wrapper: string; label: string }
> = {
  digital: {
    wrapper: 'border-cyan-500/20 bg-cyan-500/5',
    label: 'text-cyan-400',
  },
  commercial: {
    wrapper: 'border-violet-500/20 bg-violet-500/5',
    label: 'text-violet-400',
  },
  operational: {
    wrapper: 'border-emerald-500/20 bg-emerald-500/5',
    label: 'text-emerald-400',
  },
}

const DIM_LABELS: Record<string, string> = {
  digital: 'Digital',
  commercial: 'Comercial',
  operational: 'Operativa',
}

function DimensionMini({ dim, index }: { dim: HealthScoreDimension; index: number }) {
  const styles = DIM_STYLES[dim.key] ?? DIM_STYLES['digital']

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
      className={cn('rounded-xl border p-3', styles.wrapper)}
    >
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 text-zinc-400 truncate">
        {DIM_LABELS[dim.key] ?? dim.label}
      </p>
      {dim.metricsAvailable === 0 ? (
        <p className="text-xs font-bold text-zinc-600 mt-1">—</p>
      ) : (
        <p className={cn('text-xl font-black tabular-nums mt-0.5', styles.label)}>
          {dim.score}
        </p>
      )}
    </motion.div>
  )
}

// ─── Trend chip ───────────────────────────────────────────────────────────────

function TrendChip({ value }: { value: number }) {
  if (value === 0 || (value > -2 && value < 2)) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500">
        <Minus size={10} />
        sin cambio
      </span>
    )
  }

  const isUp = value > 0
  const Icon = isUp ? ArrowUp : ArrowDown
  const colorClass = isUp ? 'text-emerald-400' : 'text-rose-400'

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold', colorClass)}>
      <Icon size={10} strokeWidth={2.5} />
      {isUp ? '+' : ''}{value} esta semana
    </span>
  )
}

// ─── Copy helpers ─────────────────────────────────────────────────────────────

function scoreToTitle(score: number): string {
  if (score >= 90) return 'Tu negocio digital está excepcional.'
  if (score >= 75) return 'Tu negocio digital está saludable.'
  if (score >= 60) return 'Tu negocio digital va bien, hay margen.'
  if (score >= 40) return 'Tu negocio digital necesita atención.'
  return 'Tu negocio digital tiene oportunidades urgentes.'
}

function scoreToSubtitle(score: number, trend: number): string {
  const trendText =
    trend > 5
      ? 'Subió fuerte esta semana.'
      : trend > 1
        ? 'Sube esta semana.'
        : trend < -5
          ? 'Bajó esta semana.'
          : trend < -1
            ? 'Baja levemente esta semana.'
            : 'Estable esta semana.'

  if (score >= 75) return `Estás por encima del promedio. ${trendText}`
  if (score >= 60) return `Performance sólida con áreas de mejora. ${trendText}`
  return `Hay puntos críticos para revisar. ${trendText}`
}
