import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { sendWeeklyReports } from '@/modules/chatbot/server/reports/sendWeeklyReports'

export async function POST() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const results = await sendWeeklyReports()
    return NextResponse.json({ ok: true, ...results })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
