import { prisma } from '@/lib/prisma'
import { listRecentEvents, listEventsSince } from '@/modules/chatbot/server/admin/queries'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const slug = url.searchParams.get('slug') ?? 'develop'
  const since = url.searchParams.get('since')

  const bot = await prisma.botConfig.findUnique({ where: { slug }, select: { id: true } })
  if (!bot) return Response.json({ events: [] })

  const events = since
    ? await listEventsSince(bot.id, new Date(since))
    : await listRecentEvents(bot.id)

  return Response.json({
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      level: e.level,
      message: e.message,
      createdAt: e.createdAt.toISOString(),
      conversationSession: e.conversation?.sessionId ?? null,
      conversationPath: e.conversation?.currentPath ?? null,
      metadata: e.metadata,
    })),
    serverTime: new Date().toISOString(),
  })
}
