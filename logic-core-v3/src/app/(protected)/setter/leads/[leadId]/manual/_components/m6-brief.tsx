import type { Brief, Evaluacion, Ficha } from '@/lib/leados/contracts'
import { buildBriefInputBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { BriefForm, BriefResumen } from '../../_components/brief-form'

/**
 * M6 — «Armá el brief» (5.3, tramo Brief del patrón 4.2/5.1/5.2). Con la ficha y
 * la evaluación a la vista, el setter genera el brief en el Gem de diseño y lo
 * trae. Registro COMPARTIDO del wizard (`BriefForm`: misma action `guardarBrief`
 * con su gate y su transición EVALUADA→BRIEF adentro):
 *   - contexto: el bloque del Gem re-servido (ficha + evaluación) — el MISMO
 *     builder del wizard (`buildBriefInputBlock`), listo para copiar;
 *   - munición: el link al Gem de diseño (fuente `herramientas.ts`, la misma
 *     pieza `ToolGuide` del wizard);
 *   - registro: el form compartido (captura), o el brief guardado de consulta
 *     (`BriefResumen`) al volver a la pantalla ya completada.
 * El avance no se setea acá: guardar el brief transiciona el dossier y la
 * posición se RE-DERIVA sola en el próximo request (el motor).
 */

/** Instrucción propia de M6: el bloque re-servido es el input del Gem de diseño. */
const INSTRUCCION_BLOQUE_M6 =
  'Ficha + evaluación juntas: el input completo del Gem de diseño — copialas, pegalas ahí y que arme el brief.'

/** Contexto: el bloque del Gem de diseño, re-servido y listo para copiar — el
 * MISMO paquete ficha+evaluación que arma el input del brief en el wizard. */
export function M6Contexto({
  lead,
  ficha,
  evaluacion,
}: {
  lead: CopyBlockLead
  ficha: Ficha | null
  evaluacion: Evaluacion | null
}) {
  if (!ficha || !evaluacion) {
    // Inalcanzable con la guardia del server (m6 exige EVALUADA con gate abierto,
    // o BRIEF+) — vacío honesto por si el dato se pierde entre carga y render.
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        La ficha y la evaluación tienen que estar registradas antes de armar el brief.
      </p>
    )
  }
  return (
    <CopyBlock
      titulo="Bloque para el Gem de diseño"
      instruccion={INSTRUCCION_BLOQUE_M6}
      texto={buildBriefInputBlock(lead, ficha, evaluacion)}
    />
  )
}

/** Munición: el Gem de diseño — link + qué es / qué le das (fuente `herramientas.ts`). */
export function M6Municion() {
  return <ToolGuide id="gemDiseno" />
}

/** Registro: el form compartido del brief (captura, EVALUADA) o el brief
 * guardado de consulta (`BriefResumen`, al volver desde BRIEF+). */
export function M6Registro({
  leadId,
  businessName,
  brief,
  capturando,
}: {
  leadId: string
  businessName: string
  brief: Brief | null
  /** true en la captura (stage EVALUADA); false al volver a la pantalla completada. */
  capturando: boolean
}) {
  if (!capturando && brief) {
    return <BriefResumen brief={brief} />
  }
  // El form solo llega acá en el tramo editable real: la guardia del server no
  // habilita m6 como captura fuera de EVALUADA con gate abierto.
  return <BriefForm leadId={leadId} businessName={businessName} brief={brief} />
}
