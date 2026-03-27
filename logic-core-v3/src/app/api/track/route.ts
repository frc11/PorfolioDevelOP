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

    const data = await request.json()
    const clientId = String(data?.clientId ?? '')
    const url = String(data?.url ?? '')
    const duration = data?.duration

    if (!clientId || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (session.user.role !== 'SUPER_ADMIN' && clientId !== session.user.id) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    await prisma.pageView.create({
      data: {
        clientId,
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
