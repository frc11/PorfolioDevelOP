import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // B11.6 — PageView ahora se atribuye a la org del caller, no al user.id.
    // ORG_MEMBER: deriva del session (no acepta org del body). SUPER_ADMIN:
    // permite enviar `organizationId` explícito (impersonation/instrumentación).
    const data = await request.json()
    const url = String(data?.url ?? '')
    const duration = data?.duration
    const bodyOrgId = typeof data?.organizationId === 'string' ? data.organizationId : null

    const organizationId =
      session.user.role === 'SUPER_ADMIN'
        ? bodyOrgId ?? session.user.organizationId ?? null
        : session.user.organizationId ?? null

    if (!organizationId || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await prisma.pageView.create({
      data: {
        organizationId,
        url,
        duration: typeof duration === 'number' ? duration : Number(duration) || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TRACKING API ERROR]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
