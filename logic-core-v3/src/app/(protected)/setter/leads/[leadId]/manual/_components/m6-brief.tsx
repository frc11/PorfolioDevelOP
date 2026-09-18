import type { DossierStage } from '@prisma/client'
import type { Brief, Evaluacion, Ficha } from '@/lib/leados/contracts'
import { buildBriefInputBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { BriefForm, BriefResumen } from '../../_components/brief-form'
import { BriefSanity } from './brief-sanity'

/**
 * M6 — «Decidí cómo va a ser la demo» (5.3, tramo Brief del patrón 4.2/5.1/5.2;
 * retitulada en P5-B). Con la ficha y la evaluación a la vista, el setter corre
 * el Gem de diseño y trae acá el plano de la demo. Registro COMPARTIDO del
 * wizard (`BriefForm`: misma action `guardarBrief`
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

/**
 * Instrucción propia de M6: el bloque re-servido es el input del Gem de diseño.
 * P40 — ya viaja adentro del mensaje de la vuelta 1; decía «copialas, pegalas ahí
 * y que arme el brief», que era el pegado único de antes. No más larga que la
 * vieja a propósito: a 390 un renglón más corría 16 px el primer accionable
 * (medido con `medir-pliegue-manual.ts`).
 */
const INSTRUCCION_BLOQUE_M6 =
  'Ficha + evaluación juntas: ya viajan dentro del mensaje de la vuelta 1. Quedan acá para consultarlas.'

/** P40 — El bloque de la ficha que lleva el mensaje de la vuelta 1, o nada si falta el dato. */
function bloqueFichaDe(lead: CopyBlockLead, ficha: Ficha | null, evaluacion: Evaluacion | null) {
  return ficha && evaluacion ? buildBriefInputBlock(lead, ficha, evaluacion) : null
}

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

/** Registro: el form compartido del brief (captura, EVALUADA), el sanity-check
 * del wizard mientras el dossier sigue en BRIEF (5.6: ¿quedó genérico? →
 * re-pegar reabre el MISMO form), o el brief de consulta (`BriefResumen`) en
 * los stages posteriores. P40: el form trae las cuatro vueltas con el Gem, y la
 * consulta, lo que quedó guardado de ellas. */
export function M6Registro({
  leadId,
  businessName,
  brief,
  capturando,
  stage,
  lead,
  ficha,
  evaluacion,
}: {
  leadId: string
  businessName: string
  brief: Brief | null
  /** true en la captura (stage EVALUADA); false al volver a la pantalla completada. */
  capturando: boolean
  stage: DossierStage | null
  /** P40 — lo que arma el mensaje de la vuelta 1 (la ficha y la evaluación). */
  lead: CopyBlockLead
  ficha: Ficha | null
  evaluacion: Evaluacion | null
}) {
  const bloqueFicha = bloqueFichaDe(lead, ficha, evaluacion)
  if (!capturando && brief) {
    return stage === 'BRIEF' ? (
      <BriefSanity
        leadId={leadId}
        businessName={businessName}
        brief={brief}
        bloqueFicha={bloqueFicha}
      />
    ) : (
      <BriefResumen brief={brief} conVueltas />
    )
  }
  // El form solo llega acá en el tramo editable real: la guardia del server no
  // habilita m6 como captura fuera de EVALUADA con gate abierto.
  return (
    <BriefForm leadId={leadId} businessName={businessName} brief={brief} bloqueFicha={bloqueFicha} />
  )
}
