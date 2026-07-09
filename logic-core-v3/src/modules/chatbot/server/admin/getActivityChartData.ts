import { unsafeGlobalQuery } from '@/lib/isolation'

export async function getActivityChartData() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // PENDIENTE-DECISIÓN: esta función agrega ChatbotEvent de TODAS las orgs, pero
  // su única página (/admin/chatbot/activity) está enmarcada como la actividad
  // del bot propio de develOP ('develop'), y el stream de eventos que la acompaña
  // SÍ está scopeado a ese bot. O se scopea al bot 'develop' (por-org) o se
  // re-enmarca la página como panel de plataforma. Queda global explícito hasta
  // que planificación decida. Ver reporte B0-S3.
  const events = await unsafeGlobalQuery(
    'PENDIENTE-DECISIÓN: chart de actividad agrega eventos de todas las orgs en una página enmarcada como el bot develOP — scopear o re-enmarcar (ver B0-S3)',
    (c) =>
      c.chatbotEvent.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true },
      }),
  )

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
