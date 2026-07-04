import type { DossierStage, LeadStatus } from '@prisma/client'
import { requireSetter } from '@/lib/auth-guards'
import { countFollowUps } from '@/lib/follow-up'
import type { Agenda, Brief, Evaluacion, Ficha, Progreso, Rechazo, SelfCheck } from '@/lib/leados/contracts'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'
import { getOwnedDossier } from '@/lib/leados/dossier'
import {
  parseAgenda,
  parseBrief,
  parseEvaluacion,
  parseFicha,
  parseProgreso,
  parseSelfCheck,
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
  /** M6 — el brief guardado, parseado con el MISMO contrato que el wizard
   * (`parseBrief`); null mientras no se armó. Alimenta la captura vs. la
   * consulta de M6 y el bloque de Construcción (M7–M12 / M-R). */
  brief: Brief | null
  /** M7–M12 — el checklist de Construcción (auto-reporte, jamás gate); el MISMO
   * `progresoJson` que consume el wizard. Fresco = `{ completadas: [] }`. */
  progreso: Progreso
  /** M4 — el primer contacto (opener) ya está registrado (mismo proxy que el
   * wizard: `contactos > 0`); con esto el registro cae en el resumen «Enviado». */
  openerEnviado: boolean
  /** M4 — ISO del último contacto registrado — la fecha del resumen «Enviado». */
  ultimoContacto: string | null
  /** M13 — el link del borrador publicado (Netlify Drop). null hasta publicarlo:
   * alimenta la captura vs. el resumen de M13, y se muestra A LA VISTA en M14
   * (cierra A-04). Mismo campo `dossier.draftUrl` que consume el wizard. */
  draftUrl: string | null
  /** M14 — el self-check guardado (hard-blocks + flags de diseño), parseado con
   * el MISMO contrato que el wizard (`parseSelfCheck`); null hasta guardarlo. */
  selfCheck: SelfCheck | null
  /** M15 — la URL permanente que registra el admin al aprobar (el link que se
   * manda al negocio); null hasta que Franco aprueba. Es el `finalUrl` del gate
   * de envío (`gateEnvioDemo`), no el borrador. */
  finalUrl: string | null
  /** M15 — ISO del envío de la demo aprobada (`dossier.enviadaAt`); null si no se
   * envió. Alimenta el estado «enviada» de M15 (mismo proxy que el wizard). */
  demoEnviadaAt: string | null
  /** M5 — conteo de SIN_RESPUESTA (opener incluido) que alimenta `cadenciaInfo`
   * (toques hechos, próximo toque, cadencia agotada). MISMO `countFollowUps` que
   * la maquinaria; el manual solo PRESENTA la cadencia, jamás la calcula. */
  followUpCount: number
  /** M5 — ISO de la reactivación de un lead POSTERGADO (`lead.reactivateAt`); null
   * si no está postergado. El panel lo retoma en esa fecha por el reloj existente
   * — el manual solo lo muestra, no re-implementa ese regreso al foco. */
  reactivateAt: string | null
  /** M5/M16 — teléfono del lead (A-14): re-servido para seguir la conversación o
   * coordinar el horario sin volver a la ficha. Mismo `lead.phone` que el wizard. */
  leadPhone: string | null
  /** M16 — el booking parseado (`parseAgenda`); null hasta agendar. `reunionAgendada`
   * decide si ya hay reunión (mismo contrato que consume el wizard). */
  agenda: Agenda | null
  /** M16 — prefill del attendee de Cal.com: nombre de contacto del lead. `lead.contactName`. */
  contactName: string | null
  /** M16 — prefill del attendee: email del lead (ahí llega la confirmación de Cal.com). `lead.email`. */
  leadEmail: string | null
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
  // Hoisted: el checklist alimenta la derivación (completadas) Y se re-sirve a
  // las pantallas de Construcción (M7–M12). Una sola lectura de `progresoJson`.
  const progreso = parseProgreso(dossier?.progresoJson ?? null)
  // Contactos comerciales (opener incluido): alimenta la derivación Y el proxy
  // `openerEnviado` de M4 — una sola lectura de `actividades`.
  const contactos = actividades?.length ?? 0
  // Hoisted: el conteo de SIN_RESPUESTA alimenta la derivación (cadencia) Y la
  // presentación de M5 (toques / próximo toque / agotada). Una sola pasada.
  const followUpCount = countFollowUps(actividades ?? [])
  // Hoisted: el booking alimenta la derivación (m16 completada) Y el resumen del
  // traspaso de M16. Un solo parse de `agendaJson`.
  const agenda = parseAgenda(dossier?.agendaJson ?? null)

  const posicion = derivarPantalla({
    stage,
    status: lead.status,
    // El campo crudo que marca Franco — mismo criterio que el gate del wizard.
    caliente: lead.caliente,
    ficha,
    draftUrl: dossier?.draftUrl ?? null,
    progreso,
    agenda,
    contactos,
    followUpCount,
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
    brief: parseBrief(dossier?.briefJson ?? null),
    progreso,
    openerEnviado: contactos > 0,
    ultimoContacto: actividades?.[0]?.createdAt.toISOString() ?? null,
    draftUrl: dossier?.draftUrl ?? null,
    selfCheck: parseSelfCheck(dossier?.selfCheckJson ?? null),
    finalUrl: dossier?.finalUrl ?? null,
    demoEnviadaAt: dossier?.enviadaAt?.toISOString() ?? null,
    followUpCount,
    reactivateAt: lead.reactivateAt?.toISOString() ?? null,
    leadPhone: lead.phone,
    agenda,
    contactName: lead.contactName,
    leadEmail: lead.email,
  }
}
