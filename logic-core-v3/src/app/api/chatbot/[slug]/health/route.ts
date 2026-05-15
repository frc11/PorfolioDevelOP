import { checkChatbotHealth } from '@/modules/chatbot/server/health'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/chatbot/[slug]/health
 *
 * Returns the result of checkChatbotHealth for the given bot.
 * Useful for uptime monitoring and post-deploy smoke tests.
 *
 * MVP: no auth (public). For Phase 1.5+, restrict via shared secret header.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const health = await checkChatbotHealth(slug)

  return Response.json(health, {
    status: health.ok ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
