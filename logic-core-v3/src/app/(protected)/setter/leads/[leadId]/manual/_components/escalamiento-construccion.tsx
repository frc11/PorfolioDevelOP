'use client'

import { LifeBuoy } from 'lucide-react'
import { formatEspera } from '@/lib/leados/revision'
import { EscalarModal } from '../../_components/escalar-modal'
import { useHidratado } from '../../_components/use-hidratado'

/**
 * 5.6 — La capa «si se traba» que vivía SOLO en el paso de Construcción del
 * wizard, traída al manual (pantallas mc1/mc2): el MISMO `EscalarModal` (misma
 * action `escalarConstruccion` → dossier + Telegram a Franco), el banner «ya
 * avisaste» con la espera visible, y la nota re-servida a su autor que prefillea
 * el re-escalar (A-23). El «hace X» depende del reloj del cliente → se difiere a
 * post-hidratación con `useHidratado`, igual que en el wizard.
 */
export function EscalamientoConstruccion({
  leadId,
  escaladoAt,
  escaladoNota,
}: {
  leadId: string
  /** ISO del escalamiento vigente; null si no escaló. */
  escaladoAt: string | null
  /** A-23: la última nota de escalado; prefillea el modal al re-escalar. */
  escaladoNota: string | null
}) {
  const hidratado = useHidratado()
  const esperaEscalado =
    escaladoAt && hidratado ? formatEspera(new Date(escaladoAt), new Date()) : null

  if (escaladoAt) {
    return (
      <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.06] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-rose-100">
            <LifeBuoy size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-rose-300" />
            <span>
              <span className="font-semibold">Ya avisaste a Franco</span>
              {esperaEscalado ? ` (hace ${esperaEscalado})` : ''}. Está al tanto — seguí con
              otro lead mientras te responde.
            </span>
          </p>
          <EscalarModal leadId={leadId} reescalar notaPrevia={escaladoNota} />
        </div>
        {escaladoNota && (
          <details className="mt-3">
            <summary className="cursor-pointer text-[11px] font-medium text-rose-200/80 transition-colors hover:text-rose-100">
              Ver lo que le dijiste
            </summary>
            <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-rose-400/15 bg-rose-500/[0.04] p-3 text-xs leading-relaxed text-rose-100/90">
              {escaladoNota}
            </p>
          </details>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
      <p className="text-xs text-zinc-600">¿Algo no sale como la guía dice?</p>
      <EscalarModal leadId={leadId} />
    </div>
  )
}
