import { handleConfigRequest } from '@/modules/chatbot'

export const runtime = 'nodejs'

/**
 * GET /api/chatbot/[slug]/config
 *
 * Returns public bot configuration for the frontend widget.
 * Cached for 60s with 300s stale-while-revalidate.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  return handleConfigRequest(slug)
}
