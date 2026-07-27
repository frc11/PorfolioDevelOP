import type { LeadStatus } from '@prisma/client'
import type { Evaluacion, Ficha } from '@/lib/leados/contracts'
import { buildFichaCopyBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import {
  EvaluacionForm,
  EvaluacionResumen,
  type EvaluacionTextos,
} from '../../_components/evaluacion-form'

/**
 * M3 — «Registrá el veredicto» (5.1, tramo Evaluación del patrón 4.2).
 * Transcripción con el registro COMPARTIDO del wizard (`EvaluacionForm`:
 * misma action, mismo gate triple score+veredicto+razonamiento, misma guardia
 * A-24) — solo cambia la presentación:
 *   - contexto: la ficha ABIERTA a la vista (A-22: el setter transcribe CON la
 *     ficha adelante, no colapsada) — mismo builder del wizard;
 *   - munición: el link al Evaluador (por si la respuesta quedó en la otra
 *     pestaña y hay que volver a buscarla);
 *   - registro: el form compartido, o el resumen registrado si ya se
 *     transcribió (M3 completada / lead descartado).
 * El avance no se setea acá: registrar la evaluación transiciona el dossier y
 * la posición se RE-DERIVA sola en el próximo request.
 */

/**
 * Labels de prioridad post-2.1/admin-1b para el veredicto: el CALIENTE del
 * Evaluador solo SUGIERE prioridad (a Franco, que es quien marca el caliente
 * operativo del lead) — por eso en el manual la opción no dice «Caliente».
 * Los VALORES que viajan a la action no cambian (`VEREDICTO_VALUES`).
 */
const TEXTOS_M3: EvaluacionTextos = {
  scoreHint: 'El número que dio el Evaluador, tal cual: 1–2 descarta, 3 avanza, 4–5 sugiere prioridad.',
  veredictoHint: 'El que eligió el Evaluador — transcribilo sin cambiarlo.',
  veredictoLabels: {
    DESCARTAR: 'Descartar',
    AVANZAR: 'Avanzar',
    CALIENTE: 'Avanzar con prioridad',
  },
}

/** Contexto: la ficha a la vista mientras se transcribe (A-22) — abierta,
 * scrolleable, mismo formato del bloque que leyó el Evaluador. */
export function M3Contexto({ lead, ficha }: { lead: CopyBlockLead; ficha: Ficha | null }) {
  if (!ficha) {
    // Inalcanzable con la guardia del server (m3 exige señal mínima) — vacío
    // honesto por si la ficha se pierde entre carga y render.
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        La ficha todavía no está guardada — completala antes de registrar el veredicto.
      </p>
    )
  }
  return (
    <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words rounded-xl border border-white/[0.06] bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-zinc-400">
      {buildFichaCopyBlock(lead, ficha)}
    </pre>
  )
}

/** Munición: el camino de vuelta a la herramienta si se perdió la respuesta. */
export function M3Municion() {
  return <ToolGuide id="evaluador" />
}

/** Registro: el form compartido (vivo) o el resumen registrado (congelado). */
export function M3Registro({
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
        veredictoLabels={TEXTOS_M3.veredictoLabels}
      />
    )
  }
  // El form solo llega acá en el tramo editable real: la guardia del server no
  // habilita m3 sin señal mínima, y con evaluación registrada cae en el resumen.
  return (
    <EvaluacionForm
      leadId={leadId}
      leadStatus={leadStatus}
      caliente={caliente}
      textos={TEXTOS_M3}
    />
  )
}
