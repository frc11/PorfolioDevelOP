/**
 * LeadOS B-beta — Lista read-only de las últimas evaluaciones de un setter
 * (server component puro: recibe las evaluaciones ya parseadas con el contrato
 * zod, en el orden de presentación). Es el destino del drill-down de la métrica
 * descarte/avance de la cola: "revisar criterio" pasa de búsqueda manual en la
 * base a un click. Solo presenta — no altera la métrica ni el scoring.
 */
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import type { Evaluacion } from '@/lib/leados/contracts'
import { formatFechaHora, STAGE_LABELS } from '@/lib/leados/flow'

export type SetterEvaluacionItem = {
  leadId: string
  businessName: string
  /** Stage actual del lead — qué pasó DESPUÉS de la evaluación (contexto). */
  stage: DossierStage
  evaluacion: Evaluacion
}

/**
 * Disciplina B9: el veredicto es informativo → cyan queda reservado para acción.
 * Copia local DELIBERADA del mapa canónico de
 * admin/leados/[leadId]/_components/dossier-panels.tsx — este drill-down se
 * mantiene autocontenido (no toca archivos fuera del scope del sprint). El
 * `Record` tipado contra `Evaluacion['veredicto']` rompe en compilación si el
 * enum del contrato cambia, así que la copia no puede derivar en silencio.
 */
const VEREDICTO_TONES: Record<Evaluacion['veredicto'], string> = {
  DESCARTAR: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
  AVANZAR: 'border-blue-400/20 bg-blue-500/10 text-blue-200',
  CALIENTE: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
}

export function SetterEvaluaciones({ items }: { items: SetterEvaluacionItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-zinc-500">
        Este setter todavía no tiene evaluaciones registradas.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          key={item.leadId}
          className="rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/leados/${item.leadId}`}
              className="group inline-flex items-center gap-1 text-base font-semibold text-white transition-colors hover:text-cyan-300"
            >
              {item.businessName}
              <ChevronRight
                className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-cyan-300"
                strokeWidth={1.5}
              />
            </Link>
            <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
              Score {item.evaluacion.score}/5
            </span>
            <span
              className={[
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                VEREDICTO_TONES[item.evaluacion.veredicto],
              ].join(' ')}
            >
              {item.evaluacion.veredicto}
            </span>
            <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-medium text-zinc-400">
              {STAGE_LABELS[item.stage]}
            </span>
            {item.evaluacion.fecha ? (
              <span className="text-xs text-zinc-500">
                {formatFechaHora(item.evaluacion.fecha)}
              </span>
            ) : (
              <span className="text-xs text-zinc-600">sin fecha (pre-B5)</span>
            )}
          </div>

          <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">
            {item.evaluacion.razonamiento}
          </p>

          {item.evaluacion.motivoDescarte ? (
            <p className="mt-2 text-xs leading-5 text-zinc-400">
              <span className="font-medium text-rose-200">Motivo de descarte:</span>{' '}
              {item.evaluacion.motivoDescarte}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  )
}
