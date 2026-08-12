import { NextResponse } from 'next/server'
import { isAuthorizedCronRequest } from '@/lib/cron/cron-secret'
import { sendWeeklyReports } from '@/modules/chatbot/server/reports/sendWeeklyReports'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await sendWeeklyReports()
    return NextResponse.json({ ok: true, ...results })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    )
  }
}
