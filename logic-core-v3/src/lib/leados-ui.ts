import type { DossierStage } from '@prisma/client'

/**
 * Helpers de PRESENTACIÓN de LeadOS (no es lógica de negocio — eso vive en `@/lib/leados`).
 * Fuente única para el tono de color de un stage, así dejamos de duplicar el mapeo
 * en home-sections, dossier-panels, admin/leados, etc.
 */

export type LeadosTone = 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet' | 'zinc' | 'blue'

/**
 * Disciplina de color B9 — el stage es INFORMATIVO:
 *   - nunca `cyan` (reservado para lo accionable / paso activo)
 *   - nunca `amber` (reservado para "caliente" / atención)
 *   - `emerald` = aprobado/bueno · `rose` = problema/rechazo
 *   - el resto (en progreso) en azul/violeta/zinc
 */
export const STAGE_TONE: Record<DossierStage, LeadosTone> = {
  FICHA: 'zinc',
  EVALUADA: 'blue',
  BRIEF: 'blue',
  CONSTRUCCION: 'violet',
  EN_REVISION: 'violet',
  APROBADA: 'emerald',
  RECHAZADA: 'rose',
  DESCARTADA: 'zinc',
}

export function stageTone(stage: DossierStage): LeadosTone {
  return STAGE_TONE[stage]
}
