import { extractClientIp, handleChatRequest, hashIp } from '@/modules/chatbot/index.server'
import { validateOrigin } from '@/lib/security/validate-origin'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { forOrg } from '@/lib/isolation'

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

    if (validation.botConfigId && validation.organizationId) {
      // CARRERAS commit 4 (D5) — await: sin él, devolver el 403 congela la
      // lambda y este write corría carrera contra el freeze — la telemetría
      // SECURITY.BLOCKED_ORIGIN se perdía en silencio (justo la señal de que
      // alguien está probando origins). El .catch(() => {}) SE QUEDA: un
      // fallo del evento jamás debe romper ni demorar el 403 en sí.
      await forOrg(validation.organizationId)
        .chatbotEvent.create({
          botConfigId: validation.botConfigId,
          type: 'SECURITY.BLOCKED_ORIGIN',
          level: 'WARN',
          message: `Blocked request from ${origin ?? 'no-origin'}`,
          metadata: { origin, reason: validation.reason },
        })
        .catch(() => {})
    }

    return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Rate-limit per origin + IP hash (SEC-RATELIMIT-02).
  // sessionId was attacker-controllable — trivially bypassed by rotating it.
  // IP is set by the Netlify edge and is not spoofeble from the outside.
  // PRIVACIDAD: mismo esquema de hash que el resto del chatbot (hashIp,
  // salted, 16 hex) — al cambiar el formato de la clave, los buckets en Neon
  // se resetean UNA vez en el deploy (ventana de 60s; las filas viejas las
  // barre el cleanup perezoso del limiter).
  const ipHash = hashIp(extractClientIp(request))
  const rateKey = `chatbotPerSession:${origin ?? 'no-origin'}:${ipHash}`
  const rate = await checkRateLimit({
    key: rateKey,
    limit: RATE_LIMIT_PRESETS.chatbotPerSession.limit,
    windowMs: RATE_LIMIT_PRESETS.chatbotPerSession.windowMs,
  })

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
