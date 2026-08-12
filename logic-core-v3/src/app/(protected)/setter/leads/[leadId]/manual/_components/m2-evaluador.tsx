import type { LeadStatus } from '@prisma/client'
import { GraduationCap } from 'lucide-react'
import type { Evaluacion, Ficha } from '@/lib/leados/contracts'
import { buildFichaCopyBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { GUIA_EVALUACION, GUIA_FICHA } from '@/lib/leados/guidance-content'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import {
  EvaluacionForm,
  EvaluacionResumen,
  type EvaluacionTextos,
} from '../../_components/evaluacion-form'

/**
 * M2 — «Llevá la ficha a evaluar y registrá el veredicto» (tramo Evaluación del
 * patrón 4.2). P4 fusionó acá la pantalla que registraba el veredicto aparte:
 * el viaje a la herramienta y la vuelta con el resultado son UN movimiento del
 * setter, no dos, y la navegación entre ambos no aportaba nada (no había dato
 * que persistiera «ya fui a evaluar» — la posición se re-deriva).
 *   - contexto: la ficha re-servida como bloque copiable (el MISMO builder del
 *     wizard, `buildFichaCopyBlock`) — se copia para el viaje y queda ABIERTA a
 *     la vista para transcribir contra ella a la vuelta (A-22);
 *   - munición: el acceso a la herramienta (fuente `herramientas.ts`, la misma
 *     pieza `ToolGuide` del wizard) + qué criterios mira, antes de llevarle la ficha;
 *   - registro: el form COMPARTIDO del wizard (`EvaluacionForm`: misma action,
 *     mismo gate triple score+veredicto+razonamiento, misma guardia A-24), o el
 *     resumen congelado si el veredicto ya se transcribió (lead evaluado o
 *     descartado).
 * El avance no se setea acá: registrar la evaluación transiciona el dossier y
 * la posición se RE-DERIVA sola en el próximo request.
 */

/** Instrucción propia de la pantalla: la de `GUIA_FICHA.copyBlock` está escrita
 * para quien todavía está en la Ficha y manda «volvé a Evaluación» — acá ya se
 * está en Evaluación. */
const INSTRUCCION_BLOQUE_M2 =
  'Se arma con lo último guardado — copialo y pegalo en el chat de evaluación.'

/**
 * Labels de prioridad post-2.1/admin-1b para el veredicto: el CALIENTE de la
 * evaluación solo SUGIERE prioridad (a Franco, que es quien marca el caliente
 * operativo del lead) — por eso en el manual la opción no dice «Caliente».
 * Los VALORES que viajan a la action no cambian (`VEREDICTO_VALUES`).
 */
const TEXTOS_M2: EvaluacionTextos = {
  scoreHint: 'El número que te dio, tal cual: 1–2 descarta, 3 avanza, 4–5 sugiere prioridad.',
  veredictoHint: 'El que eligió la evaluación — transcribilo sin cambiarlo.',
  veredictoLabels: {
    DESCARTAR: 'Descartar',
    AVANZAR: 'Avanzar',
    CALIENTE: 'Avanzar con prioridad',
  },
}

/**
 * Contexto: la ficha que esta tarea lleva a evaluar. Copiable para el viaje y
 * abierta mientras se transcribe la vuelta (A-22) — un solo bloque para los dos
 * movimientos, mismo formato del texto que leyó la herramienta.
 */
export function M2Contexto({ lead, ficha }: { lead: CopyBlockLead; ficha: Ficha | null }) {
  if (!ficha) {
    // Inalcanzable con la guardia del server (m2 exige señal mínima) — vacío
    // honesto por si la ficha se pierde entre carga y render.
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        La ficha todavía no está guardada — completala en la pantalla anterior.
      </p>
    )
  }
  return (
    <CopyBlock
      titulo={GUIA_FICHA.copyBlock.titulo}
      instruccion={INSTRUCCION_BLOQUE_M2}
      texto={buildFichaCopyBlock(lead, ficha)}
    />
  )
}

/** Munición: la herramienta externa del viaje — link + qué es / qué le das — y
 * la tabla de criterios (5.6: la misma pieza que mostraba el paso del wizard —
 * saber QUÉ se mira antes de llevarle la ficha). */
export function M2Municion() {
  return (
    <div className="space-y-4">
      <ToolGuide id="evaluador" />
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <GraduationCap size={12} strokeWidth={1.5} />
          Qué se mira en la evaluación (y por qué importa)
        </p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {GUIA_EVALUACION.criterios.map((criterio) => (
            <li key={criterio.nombre} className="text-[11px] leading-relaxed text-zinc-500">
              <span className="font-semibold text-zinc-400">{criterio.nombre}:</span>{' '}
              {criterio.porQue}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Registro: el form compartido (vivo) o el resumen registrado (congelado). */
export function M2Registro({
  leadId,
  leadStatus,
  caliente,
  evaluacion,
  descartado,
}: {
  leadId: string
  leadStatus: LeadStatus
  caliente: boolean
  evaluacion: Evaluacion | null
  descartado: boolean
}) {
  if (evaluacion) {
    return (
      <EvaluacionResumen
        evaluacion={evaluacion}
        descartado={descartado}
        titulo="Veredicto registrado"
        veredictoLabels={TEXTOS_M2.veredictoLabels}
      />
    )
  }
  // El form solo llega acá en el tramo editable real: la guardia del server no
  // habilita m2 sin señal mínima, y con evaluación registrada cae en el resumen.
  return (
    <EvaluacionForm
      leadId={leadId}
      leadStatus={leadStatus}
      caliente={caliente}
      textos={TEXTOS_M2}
    />
  )
}
