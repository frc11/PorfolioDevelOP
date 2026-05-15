import { prisma } from '@/lib/prisma'
import { listRecentEvents, listEventsSince } from '@/modules/chatbot/server/admin/queries'

// MVP: no auth check (admin path, but the page itself is in /admin/* which
// should be protected at layout level). For Phase 1.5+, add auth here.

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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
