import { handleConfigRequest } from '@/modules/chatbot/index.server'
import { validateOrigin } from '@/lib/security/validate-origin'

export const runtime = 'nodejs'

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}

export async function OPTIONS(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const origin = req.headers.get('origin')
  const validation = await validateOrigin({ origin, botSlug: slug })

  if (!validation.allowed || !origin) {
    return new Response(null, { status: 403 })
  }

  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}

/**
 * GET /api/chatbot/[slug]/config
 *
 * Returns public bot configuration for the frontend widget.
 * Cached for 60s with 300s stale-while-revalidate.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params
  const origin = request.headers.get('origin')

  const validation = await validateOrigin({ origin, botSlug: slug })

  if (!validation.allowed) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const response = await handleConfigRequest(slug)

  if (origin) {
    const headers = new Headers(response.headers)
    for (const [k, v] of Object.entries(corsHeaders(origin))) {
      headers.set(k, v)
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  return response
}
