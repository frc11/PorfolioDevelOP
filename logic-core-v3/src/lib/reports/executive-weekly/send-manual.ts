import { WeeklyReportStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { executiveWeeklyEmail } from '@/lib/email/templates/executive-weekly'
import { getISOWeekKeyAR } from '@/lib/tz-ar'
import { buildExecutiveWeeklyReport, type BuildSkipReason } from './build'

const SKIP_REASON_TO_STATUS: Record<BuildSkipReason, WeeklyReportStatus> = {
  PLAN: 'SKIPPED_PLAN',
  OPTOUT: 'SKIPPED_OPTOUT',
  NO_RECIPIENT: 'SKIPPED_NO_RECIPIENT',
  NO_DATA: 'SKIPPED_NO_DATA',
}

export type ManualSendResult =
  | { ok: true; periodKey: string; messageId: string | undefined; recipientEmail: string }
  | { ok: false; reason: 'NOT_FOUND' }
  | { ok: false; reason: 'ALREADY_SENT'; periodKey: string; sentAt: Date | null }
  | { ok: false; reason: 'BUILD_SKIPPED'; periodKey: string; buildReason: BuildSkipReason }
  | { ok: false; reason: 'SEND_FAILED'; periodKey: string; error: string }
  | { ok: false; reason: 'UNEXPECTED_ERROR'; periodKey: string; error: string }

/**
 * Disparo manual (admin, 1 org) del Executive Weekly Report — P2.B.1.
 *
 * NO vive en `send.ts`: ese archivo (motor del reporte, fuera de scope de
 * P2.B.1) no tiene forma de acotar a 1 org ni de forzar un reenvío ya-SENT.
 * Esta función reimplementa la MISMA secuencia (idempotencia → build → Brevo
 * → log) para una sola org, incluyendo el MISMO bloqueo duro: si ya hay un
 * log `SENT` para `(organizationId, periodKey)`, NO reenvía — igual que el
 * cron. `build.ts`/`send.ts`/`top-hot-leads.ts` quedan sin modificar.
 */
export async function sendExecutiveWeeklyReportManual(
  organizationId: string,
  now: Date = new Date(),
): Promise<ManualSendResult> {
  const periodKey = getISOWeekKeyAR(now)

  try {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true },
    })
    if (!org) return { ok: false, reason: 'NOT_FOUND' }

    const existing = await prisma.weeklyReportLog.findUnique({
      where: { organizationId_periodKey: { organizationId, periodKey } },
      select: { status: true, sentAt: true },
    })
    if (existing?.status === 'SENT') {
      return { ok: false, reason: 'ALREADY_SENT', periodKey, sentAt: existing.sentAt }
    }

    const built = await buildExecutiveWeeklyReport(organizationId, now)

    if (!built.ok) {
      await prisma.weeklyReportLog.upsert({
        where: { organizationId_periodKey: { organizationId, periodKey } },
        create: {
          organizationId,
          periodKey,
          status: SKIP_REASON_TO_STATUS[built.reason],
        },
        update: {
          status: SKIP_REASON_TO_STATUS[built.reason],
          errorMessage: null,
        },
      })
      return { ok: false, reason: 'BUILD_SKIPPED', periodKey, buildReason: built.reason }
    }

    // Marcamos PENDING antes de mandar — mismo motivo que send.ts: si el
    // proceso muere a mitad, queda visible que esta org estaba en vuelo.
    await prisma.weeklyReportLog.upsert({
      where: { organizationId_periodKey: { organizationId, periodKey } },
      create: {
        organizationId,
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
        'List-Unsubscribe': `<${built.data.unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    if (sendResult.ok) {
      await prisma.weeklyReportLog.update({
        where: { organizationId_periodKey: { organizationId, periodKey } },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          messageId: sendResult.messageId ?? null,
          errorMessage: null,
        },
      })
      return {
        ok: true,
        periodKey,
        messageId: sendResult.messageId,
        recipientEmail: built.recipient.email,
      }
    }

    await prisma.weeklyReportLog.update({
      where: { organizationId_periodKey: { organizationId, periodKey } },
      data: { status: 'FAILED', errorMessage: sendResult.error },
    })
    return { ok: false, reason: 'SEND_FAILED', periodKey, error: sendResult.error }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown'
    // Mejor esfuerzo: marcar FAILED si pudimos llegar a crear el log (mismo
    // criterio que el catch de send.ts).
    await prisma.weeklyReportLog
      .upsert({
        where: { organizationId_periodKey: { organizationId, periodKey } },
        create: {
          organizationId,
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
    return { ok: false, reason: 'UNEXPECTED_ERROR', periodKey, error: message }
  }
}
