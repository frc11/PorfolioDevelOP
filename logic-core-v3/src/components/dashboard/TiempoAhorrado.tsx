'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

interface Props {
  successfulExecutions: number
}

const CIRCUMFERENCE = 2 * Math.PI * 36 // r=36

export function TiempoAhorrado({ successfulExecutions }: Props) {
  const horasAhorradas = Math.round((successfulExecutions * 15) / 60)
  const diasLaborales = (horasAhorradas / 8).toFixed(1)
  const valorUSD = horasAhorradas * 15

  // Fill progress up to 160 h/month as max reference
  const pct = Math.min(horasAhorradas / 160, 1)
  const strokeDashoffset = CIRCUMFERENCE * (1 - pct)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-xl p-6"
      style={{
        border: '1px solid rgba(168,85,247,0.2)',
        background: 'rgba(168,85,247,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg
            className="-rotate-90"
            width="96"
            height="96"
            viewBox="0 0 88 88"
          >
            <circle
              cx="44"
              cy="44"
              r="36"
              fill="none"
              stroke="rgba(168,85,247,0.12)"
              strokeWidth="6"
            />
            <circle
              cx="44"
              cy="44"
              r="36"
              fill="none"
              stroke="rgba(168,85,247,0.75)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock size={13} className="text-violet-400" />
            <p className="mt-0.5 text-sm font-bold text-white">{horasAhorradas}h</p>
          </div>
        </div>

        {/* Text content */}
        <div className="flex-1">
          <p className="text-base font-semibold text-zinc-100">
            {horasAhorradas} horas ahorradas este mes
          </p>
          <p className="mt-1.5 text-sm text-zinc-400">
            Eso es{' '}
            <span className="font-semibold text-violet-300">
              {diasLaborales} días laborales
            </span>{' '}
            que dedicaste a tu negocio en lugar de tareas repetitivas
          </p>

          <div className="mt-3 flex flex-wrap gap-5">
            <div>
              <p className="text-xs text-zinc-600">Equivalente en dinero</p>
              <p className="text-sm font-semibold text-violet-400">
                ${valorUSD.toLocaleString('es-AR')} USD
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Tasa calculada</p>
              <p className="text-sm font-semibold text-zinc-300">$15 USD / hora</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Por ejecución</p>
              <p className="text-sm font-semibold text-zinc-300">15 min</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
