/**
 * P2.A — Orquestador del aviso de lead al CLIENTE.
 *
 * Se invoca fire-and-forget desde el hook post-captura del runtime del bot
 * (`captureLead.ts`). NUNCA lanza: cualquier fallo (Brevo, DB, plan) se loguea
 * y se traga — el lead ya está persistido antes de llamar acá, así que un mail
 * caído jamás rompe la captura ni la respuesta del bot.
 *
 * Reusa piezas existentes del repo, sin sistema paralelo:
 *  - Envío: `sendTransactionalEmail` (Brevo, mismo remitente transaccional).
 *  - Plan/gate: `getPlanForOrg` + `planAllows(plan, 'leadScoring')`.
 *  - Cap anti-spam: `checkRateLimit` (tabla Neon atómica) con presets nuevos.
 * La decisión (avisar / destacado / digest) vive pura en `decide.ts`.
 */
import type { NotificationMode } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { getPlanForOrg, planAllows } from '@/lib/plan'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import {
  decideLeadNotification,
  resolveDelivery,
  digestCountWhere,
  type LeadClassification,
} from './decide'
import {
  leadEmailSubject,
  renderLeadEmail,
  digestEmailSubject,
  renderDigestEmail,
} from './templates'

const DIGEST_WINDOW_MS = RATE_LIMIT_PRESETS.leadNotifyPerOrg.windowMs

export interface NotifyClientOfLeadInput {
  organizationId: string
  organization: {
    companyName: string
    leadNotificationEmail: string | null
    leadNotificationMode: NotificationMode | null
  }
  botName: string
  leadId: string
  classification: LeadClassification
  lead: {
    name: string
    email: string | null
    phone: string | null
    intent: string
    message: string
    capturedAt: Date
  }
}

/**
 * Destinatario del aviso: el email de notificación de la org si está seteado;
 * si no, fallback al dueño (primer OrgMember ADMIN). Siempre org-scoped — nunca
 * cruza tenants. `null` = no hay a quién avisar (no se manda nada).
 */
async function resolveRecipientEmail(
  organizationId: string,
  leadNotificationEmail: string | null,
): Promise<string | null> {
  if (leadNotificationEmail && leadNotificationEmail.trim()) {
    return leadNotificationEmail.trim()
  }
  const owner = await prisma.orgMember.findFirst({
    where: { organizationId, role: 'ADMIN' },
    orderBy: { joinedAt: 'asc' },
    select: { user: { select: { email: true } } },
  })
  return owner?.user.email ?? null
}

async function markNotified(leadId: string): Promise<void> {
  await prisma.chatbotLead
    .update({
      where: { id: leadId },
      data: { notificationSent: true, notificationSentAt: new Date() },
    })
    .catch((err: unknown) => {
      console.error('[client-notifications] mark notified failed:', err)
    })
}

export async function notifyClientOfLead(input: NotifyClientOfLeadInput): Promise<void> {
  try {
    const { organization: org, organizationId } = input

    // Preferencia de la org: DISABLED apaga el aviso. (DAILY_DIGEST queda
    // reservado para el resumen diario por cron — no existe aún; hoy P2.A opera
    // en modo inmediato para cualquier valor que no sea DISABLED.)
    if (org.leadNotificationMode === 'DISABLED') return

    const to = await resolveRecipientEmail(organizationId, org.leadNotificationEmail)
    if (!to) return

    const plan = await getPlanForOrg(organizationId)
    const hasLeadScoring = planAllows(plan, 'leadScoring')

    const decision = decideLeadNotification({
      classification: input.classification,
      hasLeadScoring,
    })
    if (!decision.notify) return // dq: no se avisa

    // Cap anti-spam: solo para avisos normales. El caliente en Pro+ lo saltea.
    let capAllowed = true
    let digestAllowed = false
    if (!decision.bypassCap) {
      const cap = await checkRateLimit({
        key: `leadNotify:${organizationId}`,
        limit: RATE_LIMIT_PRESETS.leadNotifyPerOrg.limit,
        windowMs: RATE_LIMIT_PRESETS.leadNotifyPerOrg.windowMs,
      })
      capAllowed = cap.allowed
      if (!capAllowed) {
        const dg = await checkRateLimit({
          key: `leadDigest:${organizationId}`,
          limit: RATE_LIMIT_PRESETS.leadDigestPerOrg.limit,
          windowMs: RATE_LIMIT_PRESETS.leadDigestPerOrg.windowMs,
        })
        digestAllowed = dg.allowed
      }
    }

    const delivery = resolveDelivery({
      bypassCap: decision.bypassCap,
      capAllowed,
      digestAllowed,
    })
    if (delivery === 'suppress') return

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '')

    if (delivery === 'digest') {
      const since = new Date(Date.now() - DIGEST_WINDOW_MS)
      const count = await prisma.chatbotLead.count({
        where: digestCountWhere(organizationId, since),
      })
      const res = await sendTransactionalEmail({
        to: { email: to },
        subject: digestEmailSubject(count),
        htmlContent: renderDigestEmail({
          organizationName: org.companyName,
          count,
          leadsUrl: `${appUrl}/dashboard/chatbot/leads`,
        }),
      })
      if (res.ok) await markNotified(input.leadId)
      return
    }

    // Envío individual (normal o caliente).
    const subject = leadEmailSubject(decision.template, {
      leadName: input.lead.name,
      intent: input.lead.intent,
    })
    const html = renderLeadEmail(decision.template, {
      organizationName: org.companyName,
      botName: input.botName,
      leadName: input.lead.name,
      email: input.lead.email,
      phone: input.lead.phone,
      intent: input.lead.intent,
      message: input.lead.message,
      capturedAt: input.lead.capturedAt,
      leadUrl: `${appUrl}/dashboard/chatbot/leads/${input.leadId}`,
    })
    const res = await sendTransactionalEmail({ to: { email: to }, subject, htmlContent: html })
    if (res.ok) await markNotified(input.leadId)
  } catch (err) {
    // Blindaje final: el aviso jamás propaga un error al runtime del bot.
    console.error('[client-notifications] notifyClientOfLead failed (lead ya guardado):', err)
  }
}
