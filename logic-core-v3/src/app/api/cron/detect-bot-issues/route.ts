import { NextResponse } from 'next/server'
import { detectBotIssues, persistAndNotifyIssues } from '@/modules/chatbot/server/admin/detectBotIssues'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const issues = await detectBotIssues()
    await persistAndNotifyIssues(issues)

    return NextResponse.json({
      ok: true,
      issuesFound: issues.length,
      issues: issues.map((issue) => ({
        type: issue.type,
        severity: issue.severity,
        title: issue.title,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    )
  }
}
