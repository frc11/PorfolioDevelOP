import { NextResponse } from 'next/server'
import { resolveOrgId } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ leads: [] }, { status: 401 })
  }

  const orgId = await resolveOrgId()
  if (!orgId) {
    return NextResponse.json({ leads: [] })
  }

  const leads = await prisma.chatbotLead.findMany({
    where: { botConfig: { organizationId: orgId } },
    orderBy: { capturedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ leads })
}
