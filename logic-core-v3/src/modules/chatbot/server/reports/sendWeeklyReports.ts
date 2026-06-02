import { prisma } from '@/lib/prisma'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { buildWeeklyReport } from './buildWeeklyReport'
import { weeklyReportEmail } from '@/lib/email/templates/weekly-report'
import { getPlanForOrg } from '@/lib/plan/get-plan-for-org'
import { planAllows } from '@/lib/plan/plan-allows'

export interface SendWeeklyReportsResult {
  total: number
  sent: number
  failed: number
  skipped: number
  /** Bots salteados porque su plan no incluye reportes (gate de plan). */
  skippedPlan: number
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
    skippedPlan: 0,
    errors: [],
  }

  for (const bot of activeBots) {
    try {
      // Plan gate — solo orgs cuyo plan incluye reportes (mismo patrón que 'crm'
      // en syncLeadToCrm.ts). getPlanForOrg cachea y cae a fallback (features=false)
      // para orgs sin plan, así un STARTER nunca recibe el reporte semanal.
      const plan = await getPlanForOrg(bot.organization.id)
      if (!planAllows(plan, 'reports')) {
        results.skippedPlan++
        continue
      }

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
