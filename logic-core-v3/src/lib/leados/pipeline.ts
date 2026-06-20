/**
 * LeadOS B-beta — Reglas puras del PANORAMA de producción del admin. Sin
 * Prisma ni 'use server' (mismo criterio que revision.ts/flow.ts): las consume
 * el server component de /admin/leados y son testeables en frío.
 *
 * Qué resuelve: Franco estaba ciego al cuello de botella. Sus dos tableros sólo
 * muestran los extremos — /admin/leados la cola EN_REVISION (lo que ya llegó al
 * final), /admin/leads el estado COMERCIAL — y ninguno deja ver cuántas demos
 * hay en cada etapa de PRODUCCIÓN (FICHA→CONSTRUCCION) ni cuáles están paradas.
 * Este módulo agrega el `OsLeadDossier.stage` que YA existe; NO toca la máquina
 * de estados (transitionDossier) — es 100% presentación.
 *
 * Antigüedad por etapa — derivada, no migrada: el dossier no guarda "cuándo
 * entró a este stage". El proxy honesto es `updatedAt` ("sin movimiento desde"):
 *   - en EN_REVISION es exacto: la transición es el último write y los blobs
 *     quedan congelados (misma base que `ordenarCola` en revision.ts);
 *   - en el resto es la última señal de actividad del dossier — que es
 *     justamente lo que delata un atasco (una demo sin tocar hace días está
 *     parada, sin importar el instante exacto en que entró al stage).
 */
import type { DossierStage } from '@prisma/client'

/**
 * Etapas de PRODUCCIÓN en orden de flujo. La máquina real (dossier.ts) es
 *   FICHA → EVALUADA → BRIEF → CONSTRUCCION → EN_REVISION → APROBADA
 * con EVALUADA→DESCARTADA y EN_REVISION→RECHAZADA→CONSTRUCCION. El tablero
 * muestra el tramo en vuelo (lo que está "en producción"); APROBADA/DESCARTADA
 * son terminales y RECHAZADA es un loop-back (se vigila aparte, en atascos).
 */
export const PIPELINE_STAGES = [
  'FICHA',
  'EVALUADA',
  'BRIEF',
  'CONSTRUCCION',
  'EN_REVISION',
] as const satisfies readonly DossierStage[]

/**
 * SLA por etapa en HORAS: a partir de cuánto sin movimiento una demo cuenta
 * como atascada. Heurística — la producción debería moverse en días, no en
 * semanas. AJUSTABLE editando SOLO esta constante (mismo patrón que
 * SHELL_CONSTRUCCION/CANAL_INSTAGRAM): la UI la consume tal cual.
 *
 *   - FICHA/EVALUADA/BRIEF: pasos cortos (cargar, evaluar, briefear) → 48 h.
 *   - CONSTRUCCION: armar la demo lleva más → 72 h.
 *   - EN_REVISION: la cola es de Franco; debería despacharla rápido → 24 h.
 *   - RECHAZADA: el setter tiene que retomar el retrabajo pronto → 48 h.
 *   - APROBADA/DESCARTADA: terminales, nunca "atascan" → Infinity.
 */
export const STAGE_SLA_HORAS: Record<DossierStage, number> = {
  FICHA: 48,
  EVALUADA: 48,
  BRIEF: 48,
  CONSTRUCCION: 72,
  EN_REVISION: 24,
  RECHAZADA: 48,
  APROBADA: Number.POSITIVE_INFINITY,
  DESCARTADA: Number.POSITIVE_INFINITY,
}

const UNA_HORA_MS = 60 * 60 * 1000

/**
 * Un dossier tal como lo necesita el panorama — desacoplado de Prisma para
 * que el módulo siga siendo puro y testeable. `desde` es el proxy de "sin
 * movimiento desde" (el `updatedAt` del dossier).
 */
export type DossierPipelineInput = {
  leadId: string
  stage: DossierStage
  businessName: string
  setter: string
  desde: Date
}

/** Horas transcurridas desde `desde` hasta `ahora` (nunca negativo). */
export function horasDesde(desde: Date, ahora: Date): number {
  return Math.max(0, ahora.getTime() - desde.getTime()) / UNA_HORA_MS
}

/** ¿La demo superó el SLA de su etapa (sin movimiento)? */
export function esAtascado(stage: DossierStage, desde: Date, ahora: Date): boolean {
  return horasDesde(desde, ahora) >= STAGE_SLA_HORAS[stage]
}

/** Resumen agregado de una etapa del tablero. */
export type ResumenStage = {
  stage: DossierStage
  /** Demos en esta etapa. */
  total: number
  /** Cuántas superan el SLA (atascadas). */
  atascadas: number
  /** La más vieja por última actividad (la peor del carril), o null si vacía. */
  masViejoDesde: Date | null
}

/**
 * Conteo + antigüedad por etapa de producción, SIEMPRE en orden de flujo y con
 * las etapas vacías incluidas (el tablero muestra el pipeline completo, no sólo
 * lo que hoy tiene volumen). Las entradas RECHAZADA/terminales que vengan en el
 * input se ignoran acá: el tablero es el tramo en vuelo (PIPELINE_STAGES).
 */
export function resumirPipeline(
  inputs: readonly DossierPipelineInput[],
  ahora: Date,
): ResumenStage[] {
  return PIPELINE_STAGES.map((stage) => {
    const enStage = inputs.filter((d) => d.stage === stage)
    const masViejoDesde = enStage.reduce<Date | null>((viejo, d) => {
      return viejo === null || d.desde.getTime() < viejo.getTime() ? d.desde : viejo
    }, null)
    return {
      stage,
      total: enStage.length,
      atascadas: enStage.filter((d) => esAtascado(d.stage, d.desde, ahora)).length,
      masViejoDesde,
    }
  })
}

/** Una demo atascada, con las horas sin movimiento ya calculadas. */
export type Atasco = DossierPipelineInput & { horas: number }

/**
 * Las demos atascadas de TODO el input (incluye RECHAZADA: una demo que Franco
 * bochó y el setter no retoma es un atasco de manual), ordenadas de la más
 * parada a la menos. Cero atascos = la producción se mueve.
 */
export function detectarAtascos(
  inputs: readonly DossierPipelineInput[],
  ahora: Date,
): Atasco[] {
  return inputs
    .filter((d) => esAtascado(d.stage, d.desde, ahora))
    .map((d) => ({ ...d, horas: horasDesde(d.desde, ahora) }))
    .sort((a, b) => b.horas - a.horas)
}

/** Total de demos en el tramo en vuelo del tablero (suma de los carriles). */
export function totalEnPipeline(resumen: readonly ResumenStage[]): number {
  return resumen.reduce((acc, r) => acc + r.total, 0)
}
