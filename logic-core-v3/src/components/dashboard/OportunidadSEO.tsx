'use client'

import { useActionState, useState } from 'react'
import { motion } from 'framer-motion'
import { sendClientMessageAction } from '@/lib/actions/messages'
import { ArrowRight, CheckCircle2, Loader2, AlertOctagon, TrendingUp, Target } from 'lucide-react'
import type { ActionResult } from '@/lib/actions/schemas'

export type ImpactoNivel = 'URGENTE' | 'ALTO' | 'MEDIO'

export interface OportunidadSEOProps {
  impacto: ImpactoNivel
  titulo: string
  descripcion: string
  ctaLabel: string
  mensajeAdmin: string
  index: number
}

const IMPACTO_CONFIG: Record<ImpactoNivel, {
  label: string
  badgeClass: string
  borderColor: string
  bgColor: string
  accentGradient: string
  icon: React.ReactNode
}> = {
  URGENTE: {
    label: 'URGENTE',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    borderColor: 'rgba(239,68,68,0.2)',
    bgColor: 'rgba(239,68,68,0.035)',
    accentGradient: 'from-transparent via-red-500/40 to-transparent',
    icon: <AlertOctagon size={11} />,
  },
  ALTO: {
    label: 'ALTO IMPACTO',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    borderColor: 'rgba(34,197,94,0.2)',
    bgColor: 'rgba(34,197,94,0.035)',
    accentGradient: 'from-transparent via-emerald-500/40 to-transparent',
    icon: <TrendingUp size={11} />,
  },
  MEDIO: {
    label: 'MEDIO IMPACTO',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    borderColor: 'rgba(245,158,11,0.2)',
    bgColor: 'rgba(245,158,11,0.035)',
    accentGradient: 'from-transparent via-amber-500/40 to-transparent',
    icon: <Target size={11} />,
  },
}

export function OportunidadSEO({
  impacto,
  titulo,
  descripcion,
  ctaLabel,
  mensajeAdmin,
  index,
}: OportunidadSEOProps) {
  const [submitted, setSubmitted] = useState(false)
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(sendClientMessageAction, null)
  const c = IMPACTO_CONFIG[impacto]
  const isSuccess = submitted && !pending && state?.success

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-xl p-5 backdrop-blur-sm"
      style={{ border: `1px solid ${c.borderColor}`, background: c.bgColor }}
    >
      {/* Top accent line */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${c.accentGradient}`} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Content */}
        <div className="flex-1 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] ${c.badgeClass}`}
          >
            {c.icon}
            {c.label}
          </span>
          <h3 className="mt-2.5 text-sm font-semibold text-white leading-snug">{titulo}</h3>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{descripcion}</p>
        </div>

        {/* CTA */}
        <div className="flex-shrink-0 sm:pl-6">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5"
            >
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">¡Solicitud enviada!</span>
            </motion.div>
          ) : (
            <form action={formAction} onSubmit={() => setSubmitted(true)}>
              <input type="hidden" name="content" value={mensajeAdmin} />
              <button
                type="submit"
                disabled={pending}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white/75 transition-all hover:bg-white/[0.11] hover:text-white disabled:opacity-50 active:scale-[0.97]"
              >
                {pending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ArrowRight size={12} />
                )}
                {ctaLabel}
              </button>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  )
}
