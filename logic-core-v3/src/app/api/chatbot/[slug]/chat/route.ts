import { handleChatRequest } from '@/modules/chatbot/index.server'
import { validateOrigin } from '@/lib/security/validate-origin'
import { checkRateLimit } from '@/modules/chatbot/server/rate-limit'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const maxDuration = 30

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'false',
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params
  const origin = request.headers.get('origin')

  const validation = await validateOrigin({ origin, botSlug: slug })

  if (!validation.allowed) {
    console.warn(
      `[Security] Blocked ${origin ?? 'no-origin'} for bot ${slug}: ${validation.reason}`,
    )

    if (validation.botConfigId) {
      prisma.chatbotEvent
        .create({
          data: {
            botConfigId: validation.botConfigId,
            type: 'SECURITY.BLOCKED_ORIGIN',
            level: 'warn',
            message: `Blocked request from ${origin ?? 'no-origin'}`,
            metadata: { origin, reason: validation.reason },
          },
        })
        .catch(() => {})
    }

    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Rate limit por origin + sessionId
  let sessionId = 'unknown'
  try {
    const body = await request.clone().json()
    sessionId = typeof body?.sessionId === 'string' ? body.sessionId : 'unknown'
  } catch {
    // body parse fail → use fallback key
  }

  const rateKey = `${origin ?? 'no-origin'}:${sessionId}`
  const rate = checkRateLimit(rateKey, 30, 60_000)

  if (!rate.allowed) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((rate.resetAt - Date.now()) / 1000)),
        ...(origin ? corsHeaders(origin) : {}),
      },
    })
  }

  const response = await handleChatRequest(request, slug)

  const headers = new Headers(response.headers)
  if (origin) {
    for (const [k, v] of Object.entries(corsHeaders(origin))) {
      headers.set(k, v)
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
