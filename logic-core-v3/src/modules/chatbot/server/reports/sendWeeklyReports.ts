import { prisma } from '@/lib/prisma'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { buildWeeklyReport } from './buildWeeklyReport'
import { weeklyReportEmail } from '@/lib/email/templates/weekly-report'

export interface SendWeeklyReportsResult {
  total: number
  sent: number
  failed: number
  skipped: number
  errors: string[]
}

export async function sendWeeklyReports(): Promise<SendWeeklyReportsResult> {
  const activeBots = await prisma.botConfig.findMany({
    where: { isActive: true },
    include: {
      organization: {
        include: {
          members: {
            where: { role: 'ADMIN' },
            include: { user: { select: { email: true, name: true } } },
            take: 1,
          },
        },
      },
    },
  })

  const results: SendWeeklyReportsResult = {
    total: activeBots.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  }

  for (const bot of activeBots) {
    try {
      const primary = bot.organization.members[0]?.user
      if (!primary?.email) {
        results.skipped++
        continue
      }

      const reportData = await buildWeeklyReport(bot.id)
      if (!reportData) {
        results.skipped++
        continue
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      const email = weeklyReportEmail({
        ...reportData,
        dashboardUrl: `${appUrl}/dashboard/chatbot`,
      })

      const result = await sendTransactionalEmail({
        to: { email: primary.email, name: primary.name ?? undefined },
        subject: email.subject,
        htmlContent: email.htmlContent,
      })

      if (result.ok) {
        results.sent++
        await prisma.chatbotEvent
          .create({
            data: {
              botConfigId: bot.id,
              type: 'REPORT.WEEKLY_SENT',
              level: 'INFO',
              message: `Weekly report sent to ${primary.email}`,
              metadata: { recipientEmail: primary.email },
            },
          })
          .catch(() => {})
      } else {
        results.failed++
        results.errors.push(`${bot.slug}: ${result.error}`)
      }
    } catch (error) {
      results.failed++
      results.errors.push(
        `${bot.slug}: ${error instanceof Error ? error.message : 'unknown'}`,
      )
    }
  }

  return results
}
