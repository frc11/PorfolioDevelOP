'use client'

import { useActionState, useState } from 'react'
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
  cardBorder: string
  icon: React.ReactNode
}> = {
  URGENTE: {
    label: 'URGENTE',
    badgeClass: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    cardBorder: 'border-rose-400/20',
    icon: <AlertOctagon size={11} strokeWidth={1.75} />,
  },
  ALTO: {
    label: 'ALTO IMPACTO',
    badgeClass: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    cardBorder: 'border-emerald-400/20',
    icon: <TrendingUp size={11} strokeWidth={1.75} />,
  },
  MEDIO: {
    label: 'MEDIO IMPACTO',
    badgeClass: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    cardBorder: 'border-amber-400/20',
    icon: <Target size={11} strokeWidth={1.75} />,
  },
}

export function OportunidadSEO({
  impacto,
  titulo,
  descripcion,
  ctaLabel,
  mensajeAdmin,
}: OportunidadSEOProps) {
  const [submitted, setSubmitted] = useState(false)
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    sendClientMessageAction,
    null,
  )
  const c = IMPACTO_CONFIG[impacto]
  const isSuccess = submitted && !pending && state?.success

  return (
    <div className={`rounded-xl border bg-white/[0.02] p-5 ${c.cardBorder}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Content */}
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] ${c.badgeClass}`}
          >
            {c.icon}
            {c.label}
          </span>
          <h3 className="mt-2.5 text-sm font-medium leading-snug text-zinc-100">{titulo}</h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">{descripcion}</p>
        </div>

        {/* CTA — acción intacta (sendClientMessageAction) */}
        <div className="flex-shrink-0 sm:pl-6">
          {isSuccess ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2.5">
              <CheckCircle2 size={13} className="text-emerald-300" strokeWidth={1.5} />
              <span className="text-xs font-medium text-emerald-300">¡Solicitud enviada!</span>
            </div>
          ) : (
            <form action={formAction} onSubmit={() => setSubmitted(true)}>
              <input type="hidden" name="content" value={mensajeAdmin} />
              <button
                type="submit"
                disabled={pending}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 size={12} className="animate-spin" strokeWidth={1.75} />
                ) : (
                  <ArrowRight size={12} strokeWidth={1.75} />
                )}
                {ctaLabel}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
