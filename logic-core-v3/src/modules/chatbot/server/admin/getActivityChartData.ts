import { prisma } from '@/lib/prisma'

export async function getActivityChartData() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const events = await prisma.chatbotEvent.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  })

  const byDay = new Map<string, number>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
    byDay.set(key, 0)
  }

  for (const event of events) {
    const key = new Date(event.createdAt).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
    })
    byDay.set(key, (byDay.get(key) ?? 0) + 1)
  }

  return Array.from(byDay.entries()).map(([hour, count]) => ({ hour, count }))
}
