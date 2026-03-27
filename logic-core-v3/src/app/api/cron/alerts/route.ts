import { NextResponse } from 'next/server'
import { runPeriodicAgencyAlerts } from '@/lib/alerts'

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET?.trim()
  const providedSecret = request.headers.get('X-Cron-Secret')?.trim()

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runPeriodicAgencyAlerts()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[cron alerts] execution error:', error)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 })
  }
}
