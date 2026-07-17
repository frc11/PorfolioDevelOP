/**
 * LeadOS B6 — Maquinaria comercial compartida admin/setter.
 *
 * Lógica de negocio EXTRAÍDA tal cual de las actions admin
 * (`admin/leads/_actions/activity.actions.ts` y `demo.actions.ts`) para que
 * el panel del setter la reuse sin duplicarla y sin aflojar las actions
 * admin: ellas siguen siendo `requireSuperAdmin()` y conservan sus schemas y
 * revalidates. Acá NO hay auth ni revalidación — cada caller pone su guard
 * (admin: requireSuperAdmin; setter: requireSetter + ownership) y revalida
 * sus propias rutas.
 *
 * Invariantes (cambiarlos = frenar y avisar):
 *   - SIN_RESPUESTA arma el próximo follow-up con calculateNextFollowUp
 *     (+2/+2/+3/stop) contando los SIN_RESPUESTA del lead. 2.1/C-02: agotada la
 *     cadencia (cálculo → null) LIMPIA el toque viejo (nextFollowUpAt:null) —
 *     antes quedaba vencido y el lead se servía como «trabajar» para siempre.
 *   - RESPONDIO mueve a LeadStatus.RESPONDIO y limpia nextFollowUpAt.
 *   - CALL_AGENDADA mueve a LeadStatus.CALL_AGENDADA y limpia nextFollowUpAt.
 *   - 2.1/B-01: todo contacto real (SIN_RESPUESTA/RESPONDIO/CALL_AGENDADA/RECHAZADO)
 *     limpia además el vencimiento del postergado (reactivateAt:null): registrar el
 *     retomar corta el loop del postergado vencido. El status NO se toca acá (salir
 *     de POSTERGADO sería una transición nueva; la decide Franco).
 *   - 2.1/C-11: RECHAZADO limpia el toque agendado (nextFollowUpAt:null) — deja de
 *     generar el CTA de toque eterno. No cambia status (no hay LeadStatus.RECHAZADO):
 *     el cierre (PERDIDO) lo decide Franco. La pausa (postergarLead) sigue aparte.
 *   - crearDemoComercial NO es idempotente: cada llamada registra un envío
 *     (OsDemo nuevo). La idempotencia del envío del setter vive en
 *     `dossier.enviadaAt` (B6), no acá.
 */
import {
  ActivityChannel,
  ActivityResult,
  LeadStatus,
  type OsServiceType,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { calculateNextFollowUp, countFollowUps } from '@/lib/follow-up'

export type ContactoComercialInput = {
  leadId: string
  channel: ActivityChannel
  result?: ActivityResult
  notes?: string
  performedById: string
}

/**
 * Registro de un contacto real al prospecto + efectos comerciales por
 * resultado. Cuerpo idéntico al que vivía en la action admin createActivity.
 * OJO: cada llamada crea una OsLeadActivity — el cron os-follow-up lee
 * `activities[0]` como "último contacto", así que SOLO contacto real al
 * prospecto pasa por acá (eventos internos jamás).
 */
export async function registrarContactoComercial(
  input: ContactoComercialInput
): Promise<{ id: string }> {
  const activity = await prisma.osLeadActivity.create({
    data: {
      leadId: input.leadId,
      channel: input.channel,
      result: input.result,
      notes: input.notes,
      performedById: input.performedById,
    },
    select: { id: true },
  })

  if (input.result === ActivityResult.SIN_RESPUESTA) {
    const activities = await prisma.osLeadActivity.findMany({
      where: { leadId: input.leadId },
      select: { result: true },
    })

    const followUpCount = countFollowUps(activities)
    // C-02: agotada la cadencia, el cálculo devuelve null → se ESCRIBE null (limpia
    // el toque viejo, antes vencido eterno). B-01: registrar el toque limpia también
    // el vencimiento del postergado (reactivateAt) — el retomar corta ese loop.
    const nextFollowUpAt = calculateNextFollowUp(followUpCount)
    await prisma.osLead.update({
      where: { id: input.leadId },
      data: { nextFollowUpAt, reactivateAt: null },
    })
  }

  if (input.result === ActivityResult.RESPONDIO) {
    await prisma.osLead.update({
      where: { id: input.leadId },
      data: {
        status: LeadStatus.RESPONDIO,
        nextFollowUpAt: null,
        reactivateAt: null,
      },
    })
  }

  if (input.result === ActivityResult.CALL_AGENDADA) {
    await prisma.osLead.update({
      where: { id: input.leadId },
      data: {
        status: LeadStatus.CALL_AGENDADA,
        nextFollowUpAt: null,
        reactivateAt: null,
      },
    })
  }

  if (input.result === ActivityResult.RECHAZADO) {
    // C-11: el rechazo corta el toque agendado (antes quedaba y, al vencer, generaba
    // el CTA de toque eterno) y limpia el vencimiento del postergado. El status NO
    // cambia (no existe LeadStatus.RECHAZADO): el cierre a PERDIDO lo decide Franco.
    await prisma.osLead.update({
      where: { id: input.leadId },
      data: { nextFollowUpAt: null, reactivateAt: null },
    })
  }

  return activity
}

export type DemoComercialInput = {
  leadId: string
  demoUrl: string
  serviceType?: OsServiceType
  loomUrl?: string
  notes?: string
}

/**
 * El "enviar la demo" comercial: crea OsDemo, mueve a DEMO_ENVIADA SOLO si el
 * lead estaba PROSPECTO (un lead que ya RESPONDIO conserva su status — esa es
 * la semántica original de createDemo) y arma el follow-up. Cuerpo idéntico
 * al que vivía en la action admin createDemo.
 */
export async function crearDemoComercial(
  input: DemoComercialInput
): Promise<{ id: string }> {
  const demo = await prisma.osDemo.create({
    data: input,
    select: {
      id: true,
      leadId: true,
      lead: {
        select: {
          status: true,
        },
      },
    },
  })

  const nextFollowUpAt = calculateNextFollowUp(0) ?? calculateNextFollowUp(1)
  const leadData: {
    status?: LeadStatus
    nextFollowUpAt?: Date
  } = {}

  if (demo.lead.status === LeadStatus.PROSPECTO) {
    leadData.status = LeadStatus.DEMO_ENVIADA
  }

  if (nextFollowUpAt) {
    leadData.nextFollowUpAt = nextFollowUpAt
  }

  if (leadData.status || leadData.nextFollowUpAt) {
    await prisma.osLead.update({
      where: { id: demo.leadId },
      data: leadData,
    })
  }

  return { id: demo.id }
}

/**
 * Pausa comercial: POSTERGADO + reactivateAt — espejo EXACTO de la rama
 * POSTERGADO de updateLeadStatus (admin/leads/_actions/lead.actions.ts).
 * Duplicación mínima a propósito: refactorizar updateLeadStatus (que maneja
 * TODOS los status) para compartir dos líneas arriesgaba la action admin.
 * Si la semántica de POSTERGADO cambia allá, cambiarla acá.
 */
export async function postergarLead(
  leadId: string,
  reactivateAt: Date
): Promise<void> {
  await prisma.osLead.update({
    where: { id: leadId },
    data: {
      status: LeadStatus.POSTERGADO,
      reactivateAt,
    },
  })
}
