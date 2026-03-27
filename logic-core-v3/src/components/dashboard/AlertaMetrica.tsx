'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, AlertOctagon, CheckCircle2, Info } from 'lucide-react'

export type AlertType = 'WARNING' | 'DANGER' | 'SUCCESS' | 'INFO'

export interface AlertaMetricaProps {
  tipo: AlertType
  titulo: string
  descripcion: string
  accion?: {
    label: string
    href?: string
    onAction?: () => void
    disabled?: boolean
  }
}

const CONFIG: Record<AlertType, {
  icon: React.ReactNode
  borderColor: string
  bg: string
  iconClass: string
  titleClass: string
  descClass: string
  accentGradient: string
}> = {
  DANGER: {
    icon: <AlertOctagon size={15} />,
    borderColor: 'rgba(239,68,68,0.28)',
    bg: 'rgba(239,68,68,0.07)',
    iconClass: 'text-red-400',
    titleClass: 'text-red-300',
    descClass: 'text-red-400/65',
    accentGradient: 'from-transparent via-red-500/50 to-transparent',
  },
  WARNING: {
    icon: <AlertTriangle size={15} />,
    borderColor: 'rgba(245,158,11,0.28)',
    bg: 'rgba(245,158,11,0.07)',
    iconClass: 'text-amber-400',
    titleClass: 'text-amber-300',
    descClass: 'text-amber-400/65',
    accentGradient: 'from-transparent via-amber-500/50 to-transparent',
  },
  SUCCESS: {
    icon: <CheckCircle2 size={15} />,
    borderColor: 'rgba(34,197,94,0.28)',
    bg: 'rgba(34,197,94,0.07)',
    iconClass: 'text-emerald-400',
    titleClass: 'text-emerald-300',
    descClass: 'text-emerald-400/65',
    accentGradient: 'from-transparent via-emerald-500/50 to-transparent',
  },
  INFO: {
    icon: <Info size={15} />,
    borderColor: 'rgba(6,182,212,0.28)',
    bg: 'rgba(6,182,212,0.07)',
    iconClass: 'text-cyan-400',
    titleClass: 'text-cyan-300',
    descClass: 'text-cyan-400/65',
    accentGradient: 'from-transparent via-cyan-500/50 to-transparent',
  },
}

export function AlertaMetrica({ tipo, titulo, descripcion, accion }: AlertaMetricaProps) {
  const [visible, setVisible] = useState(true)
  const c = CONFIG[tipo]

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-xl px-5 py-4 backdrop-blur-sm"
          style={{
            border: `1px solid ${c.borderColor}`,
            background: c.bg,
          }}
        >
          {/* Top accent line */}
          <div
            className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${c.accentGradient}`}
          />

          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex-shrink-0 ${c.iconClass}`}>{c.icon}</span>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold leading-tight ${c.titleClass}`}>
                {titulo}
              </p>
              <p className={`mt-1 text-xs leading-relaxed ${c.descClass}`}>
                {descripcion}
              </p>
              {accion && (
                accion.onAction ? (
                  <button
                    onClick={accion.onAction}
                    disabled={accion.disabled}
                    className={`mt-2 inline-block text-xs font-semibold underline underline-offset-2 ${c.titleClass} opacity-80 hover:opacity-100 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {accion.label} →
                  </button>
                ) : accion.href ? (
                  <a
                    href={accion.href}
                    className={`mt-2 inline-block text-xs font-semibold underline underline-offset-2 ${c.titleClass} opacity-80 hover:opacity-100 transition-opacity`}
                  >
                    {accion.label} →
                  </a>
                ) : null
              )}
            </div>

            <button
              onClick={() => setVisible(false)}
              className="flex-shrink-0 rounded-lg p-1 text-white/20 hover:text-white/50 transition-colors"
              aria-label="Cerrar alerta"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
