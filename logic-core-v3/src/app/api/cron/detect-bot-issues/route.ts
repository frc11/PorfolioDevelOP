import { NextResponse } from 'next/server'
import { isAuthorizedCronRequest } from '@/lib/cron/cron-secret'
import { runAlertDetector } from '@/modules/chatbot/server/admin/detectBotIssues'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runAlertDetector()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    )
  }
}
