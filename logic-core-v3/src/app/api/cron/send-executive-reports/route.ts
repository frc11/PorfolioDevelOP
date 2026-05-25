import { NextResponse } from 'next/server'
import { sendExecutiveWeeklyReports } from '@/lib/reports/executive-weekly/send'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

function getProvidedCronSecret(request: Request): string | null {
  const authorization = request.headers.get('authorization')?.trim()
  const cronHeader = request.headers.get('x-cron-secret')?.trim()

  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice('Bearer '.length).trim()
  }
  return cronHeader ?? null
}

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET?.trim()
  const provided = getProvidedCronSecret(request)

  if (!expected || provided !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendExecutiveWeeklyReports()
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'unknown',
      },
      { status: 500 },
    )
  }
}
