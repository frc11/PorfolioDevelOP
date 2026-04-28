import { refreshExecutiveBriefCache } from '@/lib/ai/executive-brief'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const maxDuration = 300

function getProvidedCronSecret(request: Request): string | null {
  const authorizationHeader = request.headers.get('authorization')?.trim()
  const cronHeader = request.headers.get('x-cron-secret')?.trim()

  if (authorizationHeader?.startsWith('Bearer ')) {
    return authorizationHeader.slice('Bearer '.length).trim()
  }

  return cronHeader ?? null
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET?.trim()
  const providedSecret = getProvidedCronSecret(request)

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const orgs = await prisma.organization.findMany({
    where: {
      onboardingCompleted: true,
      subscription: { is: { status: 'ACTIVE' } },
    },
    select: { id: true, companyName: true },
  })

  let success = 0
  let errors = 0
  const errorLog: string[] = []

  for (const org of orgs) {
    try {
      await refreshExecutiveBriefCache(org.id)
      success++
    } catch (error) {
      errors++
      errorLog.push(`${org.companyName}: ${error instanceof Error ? error.message : 'unknown error'}`)
    }
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    totalOrgs: orgs.length,
    success,
    errors,
    errorLog,
  })
}
