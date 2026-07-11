import { NextResponse } from 'next/server'
import { cleanupOldEvents } from '@/modules/chatbot/server/logging'

export const dynamic = 'force-dynamic'

// T0.2 — retención de `chatbot_events`. 30 días deja margen amplio sobre la
// ventana de métricas más larga que lee la tabla hoy: buildWeeklyReport lee
// chatbotEvent hasta 14 días atrás (prevWeekStart); generateInsightsForBot
// mira 30 días pero sobre Conversation/ChatMessage, NO sobre chatbotEvent —
// no comparte tabla con esta purga. Ante la duda, conservador: si se agrega
// un lector de chatbotEvent con ventana > 14d en el futuro, subir este
// número antes que la retención por defecto de cleanupOldEvents.
const RETENTION_DAYS = 30

/**
 * Same auth shape as `regenerate-briefs`/`send-executive-reports`/`os-follow-up`
 * (duplicada ahí 3 veces, no hay helper compartido — no se tocan esos archivos
 * en este sprint). A diferencia del patrón más viejo de `send-weekly-reports`/
 * `generate-insights` (`authHeader !== 'Bearer ' + secret`), esto falla cerrado
 * si `CRON_SECRET` no está seteada: `undefined !== 'Bearer undefined'` da falso
 * NEGATIVO por accidente ahí, pero acá es explícito — nunca autentica contra un
 * secret vacío.
 *
 * Exportada (T0.2) para que el invariant testee la extracción y el rechazo
 * sin secret directo, sin invocar `GET` en el camino feliz (que llamaría a
 * `cleanupOldEvents` de verdad — DB real, fuera del alcance de un invariant).
 */
export function getProvidedCronSecret(request: Request): string | null {
  const authorizationHeader = request.headers.get('authorization')?.trim()
  const cronHeader = request.headers.get('x-cron-secret')?.trim()

  if (authorizationHeader?.startsWith('Bearer ')) {
    return authorizationHeader.slice('Bearer '.length).trim()
  }

  return cronHeader ?? null
}

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
