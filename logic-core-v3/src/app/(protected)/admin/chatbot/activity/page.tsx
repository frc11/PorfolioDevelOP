import { prisma } from '@/lib/prisma'
import { listRecentEvents } from '@/modules/chatbot/server/admin/queries'
import { getActivityChartData } from '@/modules/chatbot/server/admin/getActivityChartData'
import { ActivityLog } from '@/modules/chatbot/components/admin/ActivityLog'
import { ActivityChart } from '@/modules/chatbot/components/admin/activity/ActivityChart'

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
  const [bot, chartData] = await Promise.all([
    prisma.botConfig.findUnique({ where: { slug: 'develop' }, select: { id: true } }),
    getActivityChartData(),
  ])

  if (!bot) return <div className="p-8 text-red-400">Bot no encontrado.</div>

  // Pool client-side para "Cargar más" (se muestran 50 y se revelan +50). Solo el arg;
  // queries.ts no se toca. La tab por-bot de chatbots/[botId] mantiene su propio take.
  const events = await listRecentEvents(bot.id, 250)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">Inteligencia</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">Activity Log</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Stream de eventos del chatbot en tiempo real
        </p>
      </div>

      <ActivityChart data={chartData} />

      <ActivityLog
        slug="develop"
        initialEvents={events.map((e) => ({
          id: e.id,
          type: e.type,
          level: e.level.toLowerCase() as 'info' | 'warn' | 'error' | 'debug',
          message: e.message,
          createdAt: e.createdAt.toISOString(),
          conversationSession: e.conversation?.sessionId ?? null,
          conversationPath: e.conversation?.currentPath ?? null,
          metadata: e.metadata as Record<string, unknown> | null,
        }))}
      />
    </div>
  )
}
