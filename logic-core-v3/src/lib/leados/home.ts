/**
 * LeadOS — Construcción de los leads del home ("Mi día") a partir de las filas
 * de Prisma. Vive en lib (no en el Server Component) A PROPÓSITO: `Date.now()`
 * (request-time, para vencimientos y snooze) no es puro en render — fuera del
 * cuerpo del componente se respeta `react-hooks/purity` sin perder la semántica
 * de "ahora" del Server Component. El meta privado del setter (pin/snooze/nota)
 * viene ya filtrado por setterId desde `listOwnedLeads`.
 *
 * Alimenta el home del setter (`/setter`): el foco (`seleccionarFoco` sobre la
 * cola `trabajar` ya ordenada) y la cartera secundaria de búsqueda.
 */
import {
  clasificarLead,
  parseAgenda,
  parseEvaluacion,
  parseFicha,
  ultimoRechazo,
  type HomeLead,
  type HomeLeadInput,
} from './flow'
import type { OwnedLeadWithDossier } from './ownership'
import { toSetterMetaView } from './setter-meta'

export function buildHomeLeads(leads: OwnedLeadWithDossier[]): HomeLead[] {
  const ahora = Date.now()
  return leads.map((lead) => {
    const meta = toSetterMetaView(lead.setterMetas)
    const input: HomeLeadInput = {
      id: lead.id,
      businessName: lead.businessName,
      industry: lead.industry,
      zone: lead.zone,
      status: lead.status,
      // admin-1b: el caliente persistido (lo marca Franco), no derivado del score.
      caliente: lead.caliente,
      createdAt: lead.createdAt,
      stage: lead.dossier?.stage ?? null,
      ficha: parseFicha(lead.dossier?.fichaJson ?? null),
      evaluacion: parseEvaluacion(lead.dossier?.evaluacionJson ?? null),
      ultimoRechazo: ultimoRechazo(lead.dossier?.rechazos ?? null),
      // A-09: fuente de la nota de PERDIDO en el archivo categorizado (cero
      // queries nuevas — el dossier ya viene incluido).
      agenda: parseAgenda(lead.dossier?.agendaJson ?? null),
      // B6: estado de la conversación de outreach (derivado, cero campos nuevos).
      contactos: lead._count.activities,
      followUpVencido:
        lead.nextFollowUpAt !== null && lead.nextFollowUpAt.getTime() <= ahora,
      // 2.1: sin próximo toque agendado (nextFollowUpAt null) = cadencia agotada o
      // rechazado → el lead se enfría. Distinto de un toque futuro (aún esperando).
      // No mira el reloj (null es null): puro, sin la salvedad de purity del `ahora`.
      sinProximoToque: lead.nextFollowUpAt === null,
      // 2.1b/D6: POSTERGADO cuya reactivación ya venció — vuelve a ser accionable
      // (el cron solo notifica). Mismo reloj request-time que followUpVencido.
      postergadoVencido:
        lead.status === 'POSTERGADO' &&
        lead.reactivateAt !== null &&
        lead.reactivateAt.getTime() <= ahora,
      demoEnviada: Boolean(lead.dossier?.enviadaAt),
      // B-beta: organización propia del setter (privada, aislada por setterId).
      pinned: meta.pinned,
      snoozed: meta.snoozedUntil !== null && meta.snoozedUntil.getTime() > ahora,
      snoozedUntil: meta.snoozedUntil,
      note: meta.note,
    }
    return clasificarLead(input)
  })
}
