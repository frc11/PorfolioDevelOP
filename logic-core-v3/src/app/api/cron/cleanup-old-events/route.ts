import { NextResponse } from 'next/server'
import { cleanupOldEvents } from '@/modules/chatbot/server/logging'
import { getProvidedCronSecret } from './cron-secret'

export const dynamic = 'force-dynamic'

// T0.2 — retención de `chatbot_events`. 30 días deja margen amplio sobre la
// ventana de métricas más larga que lee la tabla hoy: buildWeeklyReport lee
// chatbotEvent hasta 14 días atrás (prevWeekStart); generateInsightsForBot
// mira 30 días pero sobre Conversation/ChatMessage, NO sobre chatbotEvent —
// no comparte tabla con esta purga. Ante la duda, conservador: si se agrega
// un lector de chatbotEvent con ventana > 14d en el futuro, subir este
// número antes que la retención por defecto de cleanupOldEvents.
const RETENTION_DAYS = 30

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET?.trim()
  const providedSecret = getProvidedCronSecret(request)

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const deletedCount = await cleanupOldEvents(RETENTION_DAYS)
    return NextResponse.json({ ok: true, deletedCount, retentionDays: RETENTION_DAYS })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'unknown' },
      { status: 500 },
    )
  }
}
