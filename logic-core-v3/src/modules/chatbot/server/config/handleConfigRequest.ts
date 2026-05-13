import { getPublicConfig } from './getPublicConfig'
import { chatbotLog } from '../logging'

/**
 * Entrypoint for GET /api/chatbot/[slug]/config.
 *
 * Cache strategy: aggressive HTTP cache. The config changes rarely;
 * when an admin edits it, propagation may take up to 60 seconds.
 * Acceptable tradeoff for MVP.
 */
export async function handleConfigRequest(slug: string): Promise<Response> {
  const config = await getPublicConfig(slug)

  if (!config) {
    chatbotLog('config.bot_not_found', { slug }, 'warn')
    return Response.json({ error: 'Bot not found or inactive' }, { status: 404 })
  }

  return Response.json(config, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
}
