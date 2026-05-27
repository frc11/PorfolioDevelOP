import { WeeklyReportStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { executiveWeeklyEmail } from '@/lib/email/templates/executive-weekly'
import { getISOWeekKeyAR } from '@/lib/tz-ar'
import { buildExecutiveWeeklyReport, type BuildSkipReason } from './build'

export interface SendExecutiveWeeklyReportsResult {
  periodKey: string
  totalOrgs: number
  sent: number
  failed: number
  alreadySent: number
  skipped: Record<BuildSkipReason, number>
  errors: { organizationId: string; message: string }[]
}

const SKIP_REASON_TO_STATUS: Record<BuildSkipReason, WeeklyReportStatus> = {
  PLAN: 'SKIPPED_PLAN',
  OPTOUT: 'SKIPPED_OPTOUT',
  NO_RECIPIENT: 'SKIPPED_NO_RECIPIENT',
  NO_DATA: 'SKIPPED_NO_DATA',
}

/**
 * Orchestrator del envío semanal del reporte ejecutivo.
 *
 * Garantías:
 * - Idempotente por (orgId, periodKey). Si una org ya tiene log SENT esta
 *   semana, se saltea (anti-spam).
 * - Resiliente: una org que falla NO aborta el cron. Su log queda en FAILED
 *   con `errorMessage` para retry manual o en la próxima corrida.
 * - Cero LLM al mandar: reusa `cachedExecutiveBrief` (B6.1). Solo regenera
 *   como fallback si NO hay cache.
 * - Gating de plan PRO/BUSINESS dentro del builder.
 */
export async function sendExecutiveWeeklyReports(
  now: Date = new Date(),
): Promise<SendExecutiveWeeklyReportsResult> {
  const periodKey = getISOWeekKeyAR(now)

  const orgs = await prisma.organization.findMany({
    where: {
      onboardingCompleted: true,
      subscription: { is: { status: 'ACTIVE' } },
    },
    select: { id: true },
  })

  const result: SendExecutiveWeeklyReportsResult = {
    periodKey,
    totalOrgs: orgs.length,
    sent: 0,
    failed: 0,
    alreadySent: 0,
    skipped: {
      PLAN: 0,
      OPTOUT: 0,
      NO_RECIPIENT: 0,
      NO_DATA: 0,
    },
    errors: [],
  }

  for (const { id: orgId } of orgs) {
    try {
      // Idempotencia: si ya hay un envío SENT para esta semana, saltear.
      const existing = await prisma.weeklyReportLog.findUnique({
        where: { organizationId_periodKey: { organizationId: orgId, periodKey } },
        select: { status: true },
      })
      if (existing?.status === 'SENT') {
        result.alreadySent++
        continue
      }

      const built = await buildExecutiveWeeklyReport(orgId, now)

      if (!built.ok) {
        result.skipped[built.reason]++
        await prisma.weeklyReportLog.upsert({
          where: {
            organizationId_periodKey: { organizationId: orgId, periodKey },
          },
          create: {
            organizationId: orgId,
            periodKey,
            status: SKIP_REASON_TO_STATUS[built.reason],
          },
          update: {
            status: SKIP_REASON_TO_STATUS[built.reason],
            errorMessage: null,
          },
        })
        continue
      }

      // Marcamos PENDING antes de mandar — si el process muere a mitad, queda
      // visible que esta org estaba en vuelo y se puede reintentar.
      await prisma.weeklyReportLog.upsert({
        where: {
          organizationId_periodKey: { organizationId: orgId, periodKey },
        },
        create: {
          organizationId: orgId,
          periodKey,
          status: 'PENDING',
          recipientEmail: built.recipient.email,
          attempts: 1,
        },
        update: {
          status: 'PENDING',
          recipientEmail: built.recipient.email,
          attempts: { increment: 1 },
          errorMessage: null,
        },
      })

      const email = executiveWeeklyEmail(built.data)

      const sendResult = await sendTransactionalEmail({
        to: {
          email: built.recipient.email,
          name: built.recipient.name ?? undefined,
        },
        subject: email.subject,
        htmlContent: email.htmlContent,
        textContent: email.textContent,
        headers: {
          // RFC 8058 + RFC 2369: 1-click unsubscribe. Gmail / Outlook lo usan
          // para mostrar el botón nativo de "Cancelar suscripción".
          'List-Unsubscribe': `<${built.data.unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })

      if (sendResult.ok) {
        result.sent++
        await prisma.weeklyReportLog.update({
          where: {
            organizationId_periodKey: { organizationId: orgId, periodKey },
          },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            messageId: sendResult.messageId ?? null,
            errorMessage: null,
          },
        })
      } else {
        result.failed++
        result.errors.push({ organizationId: orgId, message: sendResult.error })
        await prisma.weeklyReportLog.update({
          where: {
            organizationId_periodKey: { organizationId: orgId, periodKey },
          },
          data: {
            status: 'FAILED',
            errorMessage: sendResult.error,
          },
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown'
      result.failed++
      result.errors.push({ organizationId: orgId, message })
      // Mejor esfuerzo: marcar FAILED si pudimos llegar a crear el log.
      await prisma.weeklyReportLog
        .upsert({
          where: {
            organizationId_periodKey: { organizationId: orgId, periodKey },
          },
          create: {
            organizationId: orgId,
            periodKey,
            status: 'FAILED',
            errorMessage: message,
            attempts: 1,
          },
          update: {
            status: 'FAILED',
            errorMessage: message,
            attempts: { increment: 1 },
          },
        })
        .catch(() => {})
    }
  }

  return result
}
