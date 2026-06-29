/**
 * LeadOS B5/B4 — Notificaciones Telegram al admin. Envían vía el sender único
 * `sendTelegram` (src/lib/notifications/telegram.ts), que resuelve credenciales
 * config-first (AgencySettings) con fallback a env. Formato HTML.
 *
 * Contrato: fire-and-forget. NUNCA lanzan — si Telegram (o la config) falla
 * se loguea y el flujo del setter sigue intacto.
 *
 *   - B5/admin-1c `notificarEvaluacionScoreAlto`: score >= 4 → aviso INFORMATIVO
 *     a Franco de que el setter evaluó alto el lead (señal para que considere
 *     marcarlo caliente). NO determina el caliente operativo — eso es el campo
 *     `OsLead.caliente` que marca Franco. Una sola vez por dossier (marca
 *     `calienteNotificadaAt` — nombre legacy del flag de idempotencia).
 *   - B4 `notificarEscalamientoConstruccion`: el setter se trabó construyendo
 *     la demo → aviso con el contexto. Devuelve si el envío salió, así la UI
 *     puede decirle al setter que escriba directo si falló.
 */
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { AgendaSchema, EvaluacionSchema } from '@/lib/leados/contracts'
import { formatFechaHora, STAGE_LABELS } from '@/lib/leados/flow'
import { sendTelegram } from '@/lib/notifications/telegram'

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

/**
 * B4 — El setter se trabó en la construcción y pide ayuda. Esta capa SOLO empuja
 * el Telegram con el contexto (negocio, stage, draft si hay) + lo que el setter
 * describe. La PERSISTENCIA del escalamiento (marca `escaladoAt`/`escaladoNota`
 * en el dossier) la hace la action `escalarConstruccion` vía `marcarEscaladoOwned`
 * ANTES de llamar acá — así el registro durable no depende de Telegram. Nunca
 * lanza; devuelve si el push salió.
 */
export async function notificarEscalamientoConstruccion(params: {
  leadId: string
  descripcion: string
}): Promise<boolean> {
  try {
    const dossier = await prisma.osLeadDossier.findUnique({
      where: { leadId: params.leadId },
      select: {
        stage: true,
        draftUrl: true,
        lead: {
          select: {
            businessName: true,
            assignedTo: { select: { name: true, email: true } },
          },
        },
      },
    })
    if (!dossier) return false

    const setter =
      dossier.lead.assignedTo?.name ?? dossier.lead.assignedTo?.email ?? 'setter'
    const message = [
      `🛟 <b>Setter trabado en construcción</b> — ${escapeHtml(dossier.lead.businessName)}`,
      '',
      `Etapa: <b>${escapeHtml(STAGE_LABELS[dossier.stage])}</b> · setter ${escapeHtml(setter)}`,
      dossier.draftUrl ? `Draft: ${escapeHtml(dossier.draftUrl)}` : 'Sin draft publicado todavía',
      '',
      `"${escapeHtml(params.descripcion.slice(0, 800))}"`,
    ].join('\n')

    return await sendTelegram(message, { parseMode: 'HTML' })
  } catch (error) {
    console.error('[leados notify] fallo no fatal:', error)
    return false
  }
}

/**
 * B7 — Reunión agendada por el setter: el aviso de traspaso a Franco con
 * negocio + horario + notas. La confirmación al invitado y el recordatorio
 * los manda Cal.com nativo — esto es SOLO el traspaso interno. Fire-and-forget.
 */
export async function notificarReunionAgendada(leadId: string): Promise<void> {
  try {
    const dossier = await prisma.osLeadDossier.findUnique({
      where: { leadId },
      select: {
        agendaJson: true,
        lead: {
          select: {
            businessName: true,
            assignedTo: { select: { name: true, email: true } },
          },
        },
      },
    })
    if (!dossier) return

    const agenda = AgendaSchema.safeParse(dossier.agendaJson)
    if (!agenda.success || agenda.data.estado !== 'AGENDADA') return

    const setter =
      dossier.lead.assignedTo?.name ?? dossier.lead.assignedTo?.email ?? 'setter'
    const horario = agenda.data.slotStart ? formatFechaHora(agenda.data.slotStart) : 'sin horario'
    const attendee = agenda.data.attendee
      ? `${agenda.data.attendee.nombre} (${agenda.data.attendee.email})`
      : 'sin datos del invitado'
    const message = [
      `📅 <b>Reunión agendada</b> — ${escapeHtml(dossier.lead.businessName)}`,
      '',
      `<b>${escapeHtml(horario)}</b> · con ${escapeHtml(attendee)}`,
      `Agendó ${escapeHtml(setter)} · booking Cal.com <code>${escapeHtml(agenda.data.calBookingUid ?? '?')}</code>`,
      '',
      '<b>Notas de traspaso</b>',
      `"${escapeHtml((agenda.data.notasTraspaso ?? '').slice(0, 800))}"`,
    ].join('\n')

    await sendTelegram(message, { parseMode: 'HTML' })
  } catch (error) {
    console.error('[leados notify] fallo no fatal:', error)
  }
}

/**
 * admin-1c — Aviso INFORMATIVO: el setter evaluó este lead con score alto (>= 4).
 * Es una señal para que Franco lo CONSIDERE caliente, no una declaración de que ya
 * lo es: el caliente operativo lo determina exclusivamente el campo `OsLead.caliente`
 * que marca Franco a ojo (admin-1b). Esta notificación no toca ese campo, no abre
 * gates ni dispara la demo preventiva — solo informa. Mantiene el trigger del score
 * y la idempotencia por dossier (flag `calienteNotificadaAt`, nombre legacy).
 */
export async function notificarEvaluacionScoreAlto(leadId: string): Promise<void> {
  try {
    const dossier = await prisma.osLeadDossier.findUnique({
      where: { leadId },
      select: {
        evaluacionJson: true,
        lead: {
          select: {
            businessName: true,
            assignedTo: { select: { name: true, email: true } },
          },
        },
      },
    })
    if (!dossier) return

    const evaluacion = EvaluacionSchema.safeParse(dossier.evaluacionJson)
    if (!evaluacion.success) return
    if (evaluacion.data.score < 4) return
    if (evaluacion.data.calienteNotificadaAt) return

    const setter =
      dossier.lead.assignedTo?.name ?? dossier.lead.assignedTo?.email ?? 'setter'
    const message = [
      `📊 <b>Evaluación con score alto</b> — ${escapeHtml(dossier.lead.businessName)}`,
      '',
      `${escapeHtml(setter)} evaluó este lead con score <b>${evaluacion.data.score}/5</b>.`,
      `${escapeHtml(evaluacion.data.razonamiento.slice(0, 300))}`,
      '',
      '<i>Es info para tu criterio: si lo querés caliente, marcalo vos en la asignación.</i>',
    ].join('\n')

    const enviado = await sendTelegram(message, { parseMode: 'HTML' })
    if (!enviado) return

    // Marca de notificado — solo tras envío exitoso. Merge sobre la evaluación
    // parseada: no toca stage ni el resto del dossier.
    await prisma.osLeadDossier.update({
      where: { leadId },
      data: {
        evaluacionJson: {
          ...evaluacion.data,
          calienteNotificadaAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    })
  } catch (error) {
    console.error('[leados notify] fallo no fatal:', error)
  }
}
