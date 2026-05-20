import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { runAlertDetector } from '@/modules/chatbot/server/admin/detectBotIssues'

export async function POST() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const result = await runAlertDetector()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
