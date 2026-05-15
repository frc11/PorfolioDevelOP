import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateInsightsForBot } from '@/modules/chatbot/index.server'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { botSlug?: unknown }
  const botSlug = typeof body.botSlug === 'string' ? body.botSlug : null

  if (!botSlug) {
    return NextResponse.json({ ok: false, error: 'Missing botSlug' }, { status: 400 })
  }

  const bot = await prisma.botConfig.findUnique({ where: { slug: botSlug } })
  if (!bot) {
    return NextResponse.json({ ok: false, error: 'Bot not found' }, { status: 404 })
  }

  const result = await generateInsightsForBot(bot.id)
  return NextResponse.json(result)
}
