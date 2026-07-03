import type { DossierStage, LeadStatus } from '@prisma/client'
import { requireSetter } from '@/lib/auth-guards'
import { countFollowUps } from '@/lib/follow-up'
import type { Evaluacion, Ficha, Rechazo } from '@/lib/leados/contracts'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'
import { getOwnedDossier } from '@/lib/leados/dossier'
import {
  parseAgenda,
  parseEvaluacion,
  parseFicha,
  parseProgreso,
  ultimoRechazo,
} from '@/lib/leados/flow'
import { derivarPantalla, type PosicionManual } from '@/lib/leados/manual'
import { listOwnedLeadActivities } from '@/lib/leados/outreach'
import { getOwnedLead } from '@/lib/leados/ownership'

/**
 * Lo que las pantallas del manual necesitan del lead: identidad mínima, la
 * posición derivada y los datos que los estados/reentrada muestran. Crece a
 * medida que las pantallas reales migren (cada sprint suma lo suyo).
 */
export type ManualDelLead = {
  lead: { id: string; businessName: string }
  stage: DossierStage | null
  posicion: PosicionManual
  /** ISO del próximo toque agendado (estado de espera) — null si no hay. */
  proximoToque: string | null
  /** Último rechazo de Franco — la nota al frente de la reentrada M-R. */
  rechazo: Rechazo | null
  /** M1 — identidad + links del negocio (mismo shape que consume el wizard). */
  leadCopy: CopyBlockLead
  /** M1 — la ficha guardada, re-servida tal cual llega al wizard. */
  ficha: Ficha | null
  /** M1 — MISMA regla que `fichaEditable` del wizard: editable hasta que la
   * evaluación quede registrada (después, congelada). */
  fichaEditable: boolean
  /** M2/M3 — la evaluación registrada, parseada con el MISMO contrato que el
   * wizard (`parseEvaluacion`); null mientras el veredicto no se transcribió. */
  evaluacion: Evaluacion | null
  /** M3 — los MISMOS datos que el wizard pasa al registro para la nota de
   * score 3 (`gateBriefAbierto`): status del lead + campo caliente de Franco. */
  leadStatus: LeadStatus
  caliente: boolean
}

/**
 * Carga owned del manual — MISMA materia prima y MISMOS caminos que la página
 * del wizard (`getOwnedLead` + `getOwnedDossier` + actividades comerciales):
 * lead ajeno o inexistente → null (la página lo vuelve 404, sin leakear). El
 * manual solo LEE; acá no se escribe ni transiciona nada.
 */
export async function cargarManualDelLead(leadId: string): Promise<ManualDelLead | null> {
  const userId = await requireSetter()

  const lead = await getOwnedLead(leadId, userId)
  if (!lead) return null

  const [dossier, actividades] = await Promise.all([
    getOwnedDossier(leadId, userId),
    listOwnedLeadActivities(leadId, userId),
  ])

  // Reloj request-time, fuera del render (mismo criterio que el home usa para
  // `followUpVencido`): el toque agendado ya venció.
  const followUpVencido = lead.nextFollowUpAt
    ? lead.nextFollowUpAt.getTime() <= Date.now()
    : false

  const stage = dossier?.stage ?? null
  const ficha = parseFicha(dossier?.fichaJson ?? null)

  const posicion = derivarPantalla({
    stage,
    status: lead.status,
    // El campo crudo que marca Franco — mismo criterio que el gate del wizard.
    caliente: lead.caliente,
    ficha,
    draftUrl: dossier?.draftUrl ?? null,
    progreso: parseProgreso(dossier?.progresoJson ?? null),
    agenda: parseAgenda(dossier?.agendaJson ?? null),
    contactos: actividades?.length ?? 0,
    followUpCount: countFollowUps(actividades ?? []),
    followUpVencido,
    finalUrl: dossier?.finalUrl ?? null,
    demoEnviada: Boolean(dossier?.enviadaAt),
  })

  return {
    lead: { id: lead.id, businessName: lead.businessName },
    stage,
    posicion,
    proximoToque: lead.nextFollowUpAt?.toISOString() ?? null,
    rechazo: ultimoRechazo(dossier?.rechazos ?? null),
    leadCopy: {
      businessName: lead.businessName,
      industry: lead.industry,
      zone: lead.zone,
      instagramUrl: lead.instagramUrl,
      currentWebUrl: lead.currentWebUrl,
      googleMapsUrl: lead.googleMapsUrl,
    },
    ficha,
    fichaEditable: stage === null || stage === 'FICHA',
    evaluacion: parseEvaluacion(dossier?.evaluacionJson ?? null),
    leadStatus: lead.status,
    caliente: lead.caliente,
  }
}
