'use client'

import { Fragment } from 'react'
import { Eye, Timer } from 'lucide-react'
import { Card } from '@/components/ui'
import type { Ficha } from '@/lib/leados/contracts'
import { buildFichaCopyBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { fichaFaltantes } from '@/lib/leados/flow'
import { GUIA_FICHA } from '@/lib/leados/guidance-content'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { FichaEjemplo } from '@/app/(protected)/setter/_components/ejemplo-ideal'
import { FichaForm } from './ficha-form'

type FichaStepProps = {
  leadId: string
  lead: CopyBlockLead
  ficha: Ficha | null
  /** false una vez registrada la evaluación: la ficha queda congelada. */
  editable: boolean
}

/**
 * Presentación del wizard para la ficha (4.2): chrome (Card + encabezado +
 * ejemplo + bloque copiable) alrededor del registro compartido (`FichaForm`,
 * donde viven campos, gate, autosave y guardia). El manual (M1) monta el MISMO
 * `FichaForm` con su propio chrome — dos presentaciones, un solo camino de
 * escritura, hasta el corte del Bloque 5.
 */
export function FichaStep({ leadId, lead, ficha, editable }: FichaStepProps) {
  const faltantesGuardados = fichaFaltantes(ficha)

  // Ficha congelada (post-evaluación): solo lectura, colapsada.
  if (!editable) {
    return (
      <details className="rounded-2xl border border-white/10 bg-white/[0.02]">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-sm font-medium text-zinc-300 [&::-webkit-details-marker]:hidden">
          <Eye size={15} strokeWidth={1.5} className="text-zinc-500" />
          {GUIA_FICHA.congelada.resumen}
        </summary>
        <div className="border-t border-white/[0.06] px-5 py-4">
          {ficha ? (
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-400">
              {buildFichaCopyBlock(lead, ficha)}
            </pre>
          ) : (
            <p className="text-xs text-zinc-600">{GUIA_FICHA.congelada.vacia}</p>
          )}
        </div>
      </details>
    )
  }

  return (
    <Card padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">{GUIA_FICHA.titulo}</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
            {GUIA_FICHA.intro.map((segmento, indice) =>
              typeof segmento === 'string' ? (
                <Fragment key={indice}>{segmento}</Fragment>
              ) : (
                <span key={indice} className="font-semibold text-zinc-300">
                  {segmento.enfasis}
                </span>
              ),
            )}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-zinc-400">
          <Timer size={12} strokeWidth={1.5} />
          {GUIA_FICHA.duracion}
        </span>
      </div>

      {/* Referencia: cómo se ve una ficha bien hecha. Útil sobre todo cuando el
          form está en blanco, pero queda a mano para comparar mientras se llena. */}
      <FichaEjemplo />

      <FichaForm leadId={leadId} ficha={ficha} />

      {ficha && faltantesGuardados.length === 0 && (
        <CopyBlock
          titulo={GUIA_FICHA.copyBlock.titulo}
          instruccion={GUIA_FICHA.copyBlock.instruccion}
          texto={buildFichaCopyBlock(lead, ficha)}
        />
      )}
    </Card>
  )
}
