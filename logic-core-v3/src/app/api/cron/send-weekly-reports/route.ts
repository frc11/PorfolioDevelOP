import { NextResponse } from 'next/server'
import { sendWeeklyReports } from '@/modules/chatbot/server/reports/sendWeeklyReports'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
