import { handleChatRequest } from '@/modules/chatbot/index.server'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * POST /api/chatbot/[slug]/chat
 *
 * Thin wrapper that delegates to the chatbot module.
 * All business logic lives in `src/modules/chatbot/`.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  return handleChatRequest(request, slug)
}
