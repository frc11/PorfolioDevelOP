import { prisma } from '@/lib/prisma'
import { listRecentEvents } from '@/modules/chatbot/server/admin/queries'
import { ActivityLog } from '@/modules/chatbot/components/admin/ActivityLog'

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const bot = await prisma.botConfig.findUnique({ where: { slug: 'develop' }, select: { id: true } })
  if (!bot) return <div className="p-8 text-red-400">Bot no encontrado.</div>

  const events = await listRecentEvents(bot.id, 50)

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-light mb-6">Activity Log</h1>
        <ActivityLog
          slug="develop"
          initialEvents={events.map((e) => ({
            id: e.id,
            type: e.type,
            level: e.level as 'info' | 'warn' | 'error' | 'debug',
            message: e.message,
            createdAt: e.createdAt.toISOString(),
            conversationSession: e.conversation?.sessionId ?? null,
            conversationPath: e.conversation?.currentPath ?? null,
            metadata: e.metadata as Record<string, unknown> | null,
          }))}
        />
      </div>
    </div>
  )
}
