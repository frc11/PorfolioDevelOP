'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
  border: string
  bg: string
  iconClass: string
  titleClass: string
  descClass: string
}> = {
  DANGER: {
    icon: <AlertOctagon size={15} strokeWidth={1.5} />,
    border: 'border-rose-400/20',
    bg: 'bg-rose-400/10',
    iconClass: 'text-rose-300',
    titleClass: 'text-rose-300',
    descClass: 'text-rose-300/70',
  },
  WARNING: {
    icon: <AlertTriangle size={15} strokeWidth={1.5} />,
    border: 'border-amber-400/20',
    bg: 'bg-amber-400/10',
    iconClass: 'text-amber-300',
    titleClass: 'text-amber-300',
    descClass: 'text-amber-300/70',
  },
  SUCCESS: {
    icon: <CheckCircle2 size={15} strokeWidth={1.5} />,
    border: 'border-emerald-400/20',
    bg: 'bg-emerald-400/10',
    iconClass: 'text-emerald-300',
    titleClass: 'text-emerald-300',
    descClass: 'text-emerald-300/70',
  },
  INFO: {
    icon: <Info size={15} strokeWidth={1.5} />,
    border: 'border-cyan-400/20',
    bg: 'bg-cyan-400/10',
    iconClass: 'text-cyan-300',
    titleClass: 'text-cyan-300',
    descClass: 'text-cyan-300/70',
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
          className={`relative overflow-hidden rounded-xl border px-5 py-4 ${c.border} ${c.bg}`}
        >
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex-shrink-0 ${c.iconClass}`}>{c.icon}</span>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-tight ${c.titleClass}`}>
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
                    className={`mt-2 inline-block text-xs font-medium underline underline-offset-2 ${c.titleClass} opacity-80 hover:opacity-100 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    {accion.label} →
                  </button>
                ) : accion.href ? (
                  <a
                    href={accion.href}
                    className={`mt-2 inline-block text-xs font-medium underline underline-offset-2 ${c.titleClass} opacity-80 hover:opacity-100 transition-opacity`}
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
