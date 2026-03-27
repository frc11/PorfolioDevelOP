'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

interface Props {
  monthlyRoi: number
  successfulExecutions: number
}

function useCountUp(target: number, duration = 1800): number {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) return
    startRef.current = null

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return value
}

export function RoiAnualizado({ monthlyRoi, successfulExecutions }: Props) {
  const annualRoi = Math.round(monthlyRoi * 12)
  const displayed = useCountUp(annualRoi)
  const formatted = displayed.toLocaleString('es-AR')

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl p-6 md:p-8"
      style={{
        border: '1px solid rgba(6,182,212,0.3)',
        background:
          'linear-gradient(135deg, rgba(6,182,212,0.09) 0%, rgba(6,182,212,0.03) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: numbers */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp size={15} className="text-cyan-400" />
            <p className="text-sm font-semibold text-cyan-400">Valor generado este año</p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              ${formatted}
            </span>
            <span className="text-lg font-normal text-zinc-500">USD</span>
          </div>

          <p className="mt-1.5 text-xs text-zinc-400">
            Proyección basada en el rendimiento actual
          </p>

          <div className="mt-3 flex flex-col gap-1">
            <p className="text-xs text-zinc-500">
              <span className="text-zinc-300">{successfulExecutions.toLocaleString('es-AR')} ejecuciones exitosas</span>
              {' × $3.75 por ejecución × 12 meses'}
            </p>
            <p className="text-xs text-zinc-600">vs $0 sin automatizaciones</p>
          </div>
        </div>

        {/* Right: active badge */}
        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            ACTIVO — trabajando por vos ahora mismo
          </span>
        </div>
      </div>
    </motion.div>
  )
}
