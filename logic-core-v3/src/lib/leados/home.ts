/**
 * LeadOS — Construcción de los leads del home ("Mi día") a partir de las filas
 * de Prisma. Vive en lib (no en el Server Component) A PROPÓSITO: `Date.now()`
 * (request-time, para vencimientos y snooze) no es puro en render — fuera del
 * cuerpo del componente se respeta `react-hooks/purity` sin perder la semántica
 * de "ahora" del Server Component. El meta privado del setter (pin/snooze/nota)
 * viene ya filtrado por setterId desde `listOwnedLeads`.
 *
 * Compartido por la cartera (`/setter`) y el recorrido de cola del detalle
 * (`/setter/leads/[id]?cola=…`): ambos clasifican igual, así el orden de la
 * cola en el home y el de prev/next en el detalle son EL MISMO.
 */
import {
  clasificarLead,
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
      createdAt: lead.createdAt,
      stage: lead.dossier?.stage ?? null,
      ficha: parseFicha(lead.dossier?.fichaJson ?? null),
      evaluacion: parseEvaluacion(lead.dossier?.evaluacionJson ?? null),
      ultimoRechazo: ultimoRechazo(lead.dossier?.rechazos ?? null),
      // B6: estado de la conversación de outreach (derivado, cero campos nuevos).
      contactos: lead._count.activities,
      followUpVencido:
        lead.nextFollowUpAt !== null && lead.nextFollowUpAt.getTime() <= ahora,
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
