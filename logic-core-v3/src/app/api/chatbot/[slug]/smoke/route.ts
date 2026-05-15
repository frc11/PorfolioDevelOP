import { runLLMSmokeTest } from '@/modules/chatbot/server/health/smokeTest'
import { checkChatbotHealth } from '@/modules/chatbot/server/health'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/chatbot/[slug]/smoke
 *
 * Full integration smoke test: health check + real LLM call.
 * Returns 200 only if everything works end-to-end.
 *
 * Use sparingly — consumes tokens. NOT for uptime monitoring (use /health for that).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params

  const health = await checkChatbotHealth(slug)
  if (!health.ok) {
    return Response.json(
      { ok: false, stage: 'health', health },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const smoke = await runLLMSmokeTest()
  if (!smoke.ok) {
    return Response.json(
      { ok: false, stage: 'llm', health, smoke },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return Response.json(
    { ok: true, health, smoke },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  )
}
