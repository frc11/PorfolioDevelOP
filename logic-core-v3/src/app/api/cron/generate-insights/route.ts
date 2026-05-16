import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInsightsForBot } from '@/modules/chatbot/index.server'
import { sendInsightsNotificationEmail } from '@/modules/chatbot/server/notifications/sendInsightsNotification'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // Validar secret token
  const authHeader = req.headers.get('authorization')
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()

  // Listar bots activos
  const bots = await prisma.botConfig.findMany({
    where: { isActive: true },
    include: { organization: true },
  })

  const results = {
    total: bots.length,
    processed: 0,
    skipped_pending_overload: 0,
    skipped_insufficient: 0,
    generated: 0,
    failed: 0,
    emails_sent: 0,
  }

  for (const bot of bots) {
    try {
      // Skipear si ya tiene mucho PENDING acumulado
      const pendingCount = 0 // await prisma.chatbotInsight.count({ where: { botConfigId: bot.id, status: 'PENDING' } })
      if (pendingCount >= 5) {
        results.skipped_pending_overload++
        continue
      }

      const result = await generateInsightsForBot(bot.id)
      results.processed++

      if (result && 'insufficient' in result && result.insufficient) {
        results.skipped_insufficient++
        continue
      }

      if (result && 'ok' in result && result.ok && result.insights && result.insights.length > 0) {
        results.generated += result.insights.length

        // Email al cliente si hay email configurado
        const org: any = bot.organization
        if (
          org.leadNotificationEmail &&
          org.leadNotificationMode !== 'DISABLED'
        ) {
          try {
            await sendInsightsNotificationEmail({
              to: org.leadNotificationEmail,
              organizationName: org.companyName ?? org.name,
              botName: bot.botName,
              insightsCount: result.insights.length,
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/chatbot`,
            })
            results.emails_sent++
          } catch (emailError) {
            console.error('[cron] Failed to send insights email', emailError)
          }
        }
      }
    } catch (err) {
      console.error(`[cron] Failed for bot ${bot.id}`, err)
      results.failed++
    }
  }

  return NextResponse.json({
    ok: true,
    durationMs: Date.now() - startedAt,
    results,
  })
}
