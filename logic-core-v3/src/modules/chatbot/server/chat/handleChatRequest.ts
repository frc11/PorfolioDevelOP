import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { forOrg } from '@/lib/isolation'
import { sanitizeAttributionField } from '../../shared/attribution'
import { shouldSkipUserPersist } from './dedup'

import {
  resolveBotBySlug,
  getOrCreateConversation,
} from '../conversation'
import {
  checkQuota,
  tryReserveConversation,
  triggerUpsellAlertIfFirst,
} from '../quota'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { hashIp } from '../safety'
import { chatbotLog } from '../logging'
import { chatbotDebug } from '../logging'
import { logChatbotEvent, logPersistFailure } from '../logging'
import { getPlanForOrg, type EffectivePlan } from '@/lib/plan'
import { originMatchesAllowed } from '@/lib/security/origin-matcher'
import {
  trimHistory,
  HISTORY_WINDOW_MESSAGES,
  MAX_MESSAGES_SHAPE,
  MAX_MESSAGE_CHARS,
  HARD_CAP_MESSAGES,
} from '../../shared/historyPolicy'
// B2-S1 — el núcleo de generación (intent → prompt → tools → LLM → persistencia)
// vive en ./core y lo comparten el canal web (esta cáscara) y el sync (Motor).
import { runChatGeneration } from './core'
import { TimingRecorder } from './timing'

// UTM.1 — Los campos de atribución (referrer + utm_*) son input del
// visitante (query string / document.referrer) → SIEMPRE sanitizados acá:
// se quitan caracteres de control y se recorta a `maxLength`. Nunca rechazan
// la request (sanitización silenciosa, no validación estricta) — son datos
// de atribución best-effort, no lógica crítica.
const attributionField = (maxLength: number) =>
  z
    .string()
    .nullish()
    .transform((val) => (val == null ? undefined : sanitizeAttributionField(val, maxLength)))

/**
 * Body schema for POST /api/chatbot/[slug]/chat.
 * Validates incoming requests from the frontend.
 *
 * Exportado (UTM.1) para que el invariant de sanitización de atribución
 * pueda testear el schema real vía requestBodySchema.parse(...), no solo
 * las funciones puras de shared/attribution.ts.
 */
export const requestBodySchema = z.object({
  // C0.2 — una conversación larga NUNCA muere en 400 por longitud:
  //  - Camino normal: recorte, no rechazo. El transform aplica trimHistory —
  //    los últimos HISTORY_WINDOW_MESSAGES, con el último 'user' (el turno en
  //    curso) SIEMPRE preservado y la ventana user-led. `body.messages` aguas
  //    abajo ya es la ventana recortada.
  //  - min/max quedan solo como validación de FORMA (payload absurdo que
  //    ningún widget real produce — ver historyPolicy.ts). Superarlos sí es 400.
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(MAX_MESSAGE_CHARS),
      })
    )
    .min(1)
    .max(MAX_MESSAGES_SHAPE)
    .transform((msgs) => trimHistory(msgs, HISTORY_WINDOW_MESSAGES)),
  sessionId: z.string().min(1).max(200),
  currentPath: z.string().max(500).optional(),
  referrer: attributionField(500),
  // Proactive teaser question the bot "asked" via the tooltip. Client-supplied →
  // VALIDATED server-side against the bot's configured proactivePrompts before it
  // is trusted into the system prompt. Never enters the conversation as a turn.
  proactiveOpener: z.string().max(500).optional(),
  // UTM.1 — first-touch, ver getOrCreateConversation (resolver.ts) para la
  // semántica de "se persisten una sola vez".
  utmSource: attributionField(255),
  utmMedium: attributionField(255),
  utmCampaign: attributionField(255),
})

type RequestBody = z.infer<typeof requestBodySchema>

/**
 * C0.2 — Largo del array `messages` del body CRUDO (antes del recorte del
 * transform del schema), solo para telemetría: permite ver cuánto recorta la
 * ventana server sobre tráfico real. Defensivo contra cualquier shape.
 */
function countRawMessages(json: unknown): number | null {
  if (json && typeof json === 'object') {
    const messages = (json as { messages?: unknown }).messages
    if (Array.isArray(messages)) return messages.length
  }
  return null
}

/**
 * Best-effort extraction of client IP from request headers.
 * Returns "unknown" if no header is available (e.g. local dev).
 */
function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

/**
 * B4.2/B4.5 — Respuesta estandarizada de modo degradado.
 *
 * Lockeada en la economía del producto: cuando el gating bloquea,
 * NUNCA llamamos a Gemini. Devolvemos JSON canned + datos para que el
 * widget arme el handoff de WhatsApp con la info del bot real.
 *
 * Cero costo de LLM, cero crash, cero 500.
 *
 * El widget detecta `mode === 'degraded'` y muestra el CTA WhatsApp
 * directamente. La `reason` permite distinguir downstream (telemetría,
 * UI texto distinto en el widget si quisiera).
 */
type DegradedReason = 'quota_exhausted' | 'domain_overflow' | 'conversation_limit'

interface DegradedContext {
  whatsappNumber: string | null
  whatsappMessage: string | null
  companyName: string | null
}

function degradedResponse(
  message: string,
  reason: DegradedReason,
  bot: DegradedContext = {
    whatsappNumber: null,
    whatsappMessage: null,
    companyName: null,
  },
): Response {
  return Response.json({
    mode: 'degraded',
    reason,
    message,
    ctaWhatsapp: true,
    whatsappNumber: bot.whatsappNumber,
    whatsappMessage: bot.whatsappMessage,
    companyName: bot.companyName,
  })
}

/**
 * B4.2 — Aplica el cap de `maxDomains` del plan al array de dominios
 * autorizados del bot.
 *
 * Si el plan no tiene cap (`null` = uso justo / ilimitado), devuelve
 * el array entero. Si el bot tiene más dominios configurados que el
 * plan permite (downgrade sin limpieza), los primeros N son efectivos
 * y el resto queda como "overflow" — pasa validateOrigin (que mira el
 * full array) pero NO pasa el check defensivo de este pipeline.
 */
function effectiveAllowedDomains(
  botAllowedDomains: readonly string[],
  planMaxDomains: number | null,
): { effective: string[]; overflow: string[] } {
  if (planMaxDomains === null) {
    return { effective: [...botAllowedDomains], overflow: [] }
  }
  return {
    effective: botAllowedDomains.slice(0, planMaxDomains),
    overflow: botAllowedDomains.slice(planMaxDomains),
  }
}

/**
 * B4.2 — ¿El origin es efectivamente autorizado para este (bot, plan)?
 *
 * Replica los escapes de `validateOrigin` (dev/localhost, develop.com.ar)
 * y después aplica el slice del plan. NO duplica el matcher (delega a
 * `originMatchesAllowed`). Llamado DESPUÉS de validateOrigin (que ya
 * autorizó el origin contra el full `bot.allowedDomains`).
 *
 * Devuelve `false` solo si el origin matchea exclusivamente un dominio
 * "overflow" (configurado en el bot pero excedido por el cap del plan).
 */
function isOriginWithinPlanCap(
  origin: string | null,
  botAllowedDomains: readonly string[],
  planMaxDomains: number | null,
): boolean {
  // Dev → localhost siempre OK (la batería de regresión corre desde localhost)
  if (
    process.env.NODE_ENV === 'development' &&
    origin &&
    (origin.includes('localhost') || origin.includes('127.0.0.1'))
  ) {
    return true
  }
  // develop.com.ar nunca cae al cap
  if (
    origin === 'https://develop.com.ar' ||
    origin === 'https://www.develop.com.ar'
  ) {
    return true
  }
  // Sin cap del plan → cualquier origin que pasó validateOrigin pasa acá también
  if (planMaxDomains === null) return true
  // Sin origin (curl, same-origin) — ya pasó validateOrigin, no aplico el cap
  if (!origin) return true

  const { effective } = effectiveAllowedDomains(botAllowedDomains, planMaxDomains)
  return originMatchesAllowed(origin, effective)
}

/**
 * Main entrypoint for the chat API route.
 * The Next.js route handler is a thin wrapper that calls this.
 */
export async function handleChatRequest(
  request: Request,
  slug: string
): Promise<Response> {
  let bot: Awaited<ReturnType<typeof resolveBotBySlug>> = null
  try {
  // Per-stage timing breakdown (B1.3). B2-S1: el recorder viaja al núcleo a
  // medio request — la cáscara hace sus marcas de pre-LLM y el núcleo continúa
  // con las de generación/persistencia sobre el mismo cursor.
  const timing = new TimingRecorder(Date.now())

  // ─── 1. Parse and validate body ───────────────────────────────
  let body: RequestBody
  let receivedMessageCount: number | null = null
  try {
    const json: unknown = await request.json()
    receivedMessageCount = countRawMessages(json)
    body = requestBodySchema.parse(json)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'invalid body'
    chatbotLog('chat.bad_request', { slug, error: msg }, 'warn')
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  timing.mark('validation_ms')

  chatbotDebug('request_parsed', {
    slug,
    // C0.2 — messageCount ya es la ventana recortada (transform del schema);
    // receivedMessageCount es lo que llegó del cliente antes del recorte.
    messageCount: body.messages.length,
    receivedMessageCount,
    sessionId: body.sessionId,
    currentPath: body.currentPath,
  })

  // ─── 2. Resolve bot ───────────────────────────────────────────
  bot = await resolveBotBySlug(slug)
  if (!bot) {
    chatbotLog('chat.bot_not_found', { slug }, 'warn')
    return Response.json({ error: 'Bot not found or inactive' }, { status: 404 })
  }
  // B0-S3 — org del tenant (BotConfig.organizationId, ya incluido por
  // resolveBotBySlug). Fija el scope de aislamiento de todo el request.
  // B2-S1: la persistencia en callbacks ya no vive acá (se mudó a ./core con su
  // propia referencia no-null del bot), así que `resolvedBot` dejó de hacer falta.
  const orgId = bot.organization.id
  const scope = forOrg(orgId)

  if (!bot.knowledgeBase) {
    chatbotLog('chat.bot_no_kb', { slug, botConfigId: bot.id }, 'error')
    return Response.json({ error: 'Bot misconfigured' }, { status: 500 })
  }
  // B2-S1 — capturamos la KB no-null como `const` acá (donde el guard la estrecha):
  // el estrechamiento de la propiedad anidada de `bot` (un `let`) no sobrevive a
  // los awaits de más abajo, y el núcleo la exige no-null.
  const knowledgeBase = bot.knowledgeBase

  timing.mark('bot_resolve_ms')

  chatbotDebug('bot_resolved', {
    botId: bot.id,
    botName: bot.botName,
    llmProvider: bot.llmProvider,
    llmModel: bot.llmModel,
    monthlyQuota: bot.monthlyQuota,
  })

  // ─── 3. Rate limit (per session — each conversation has its own bucket) ──
  const clientIp = extractClientIp(request)
  const ipHash = hashIp(clientIp)
  const rateLimit = await checkRateLimit({
    key: `chatbotPerBotSession:${slug}:${body.sessionId}`,
    limit: RATE_LIMIT_PRESETS.chatbotPerBotSession.limit,
    windowMs: RATE_LIMIT_PRESETS.chatbotPerBotSession.windowMs,
  })
  if (!rateLimit.allowed) {
    chatbotLog(
      'chat.rate_limited',
      { slug, botConfigId: bot.id, ipHash, resetAt: rateLimit.resetAt },
      'warn'
    )
    return Response.json(
      { error: 'Demasiadas consultas seguidas. Probá en un minuto.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    )
  }

  timing.mark('rate_limit_ms')

  // ─── 4 & 5. Plan + quota check + conversation (parallel) ──────
  // B4.2: getPlanForOrg() suma 1 DB lookup (cacheada 60s) en paralelo
  //       a las otras dos. La cuota del plan reemplaza bot.monthlyQuota
  //       como límite efectivo.
  const userAgent = request.headers.get('user-agent')?.slice(0, 500) ?? undefined

  const [plan, quota, { conversation, isNew: isNewConversation }] = await Promise.all([
    (async () => {
      const t = Date.now()
      const r: EffectivePlan = await getPlanForOrg(bot.organization.id)
      timing.timings.plan_only_ms = Date.now() - t
      return r
    })(),
    (async () => {
      const t = Date.now()
      // Lectura optimista contra QuotaUsage. El cap real lo enforce el
      // tryReserveConversation atómico de abajo cuando aplica.
      const r = await checkQuota(orgId, bot.id, Number.MAX_SAFE_INTEGER)
      timing.timings.quota_only_ms = Date.now() - t
      return r
    })(),
    (async () => {
      const t = Date.now()
      const r = await getOrCreateConversation({
        organizationId: orgId,
        botConfigId: bot.id,
        sessionId: body.sessionId,
        currentPath: body.currentPath,
        referrer: body.referrer,
        visitorIpHash: ipHash,
        visitorUserAgent: userAgent,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
      })
      timing.timings.conv_only_ms = Date.now() - t
      return r
    })(),
  ])
  timing.mark('db_pre_llm_ms')

  chatbotDebug('plan_resolved', {
    botConfigId: bot.id,
    organizationId: bot.organization.id,
    planKey: plan.key,
    isFallback: plan.isFallback,
    quota: plan.quota,
    llmModel: plan.llmModel,
    tools: plan.tools,
    maxDomains: plan.maxDomains,
  })

  // ─── 5.a Gating: dominio (defensive cap del plan) ─────────────
  // validateOrigin (en route.ts) ya autorizó el origin contra
  // `bot.allowedDomains` completo. Acá aplicamos el cap del plan:
  // si el bot tiene N dominios pero el plan permite M < N, los
  // dominios bot.allowedDomains[M:] son "overflow" y NO deben servir.
  const requestOrigin = request.headers.get('origin')
  if (!isOriginWithinPlanCap(requestOrigin, bot.allowedDomains, plan.maxDomains)) {
    chatbotLog(
      'chat.gating_domain_overflow',
      {
        slug,
        botConfigId: bot.id,
        origin: requestOrigin,
        planKey: plan.key,
        planMaxDomains: plan.maxDomains,
        botAllowedDomainCount: bot.allowedDomains.length,
      },
      'warn',
    )
    await logChatbotEvent({
      organizationId: orgId,
      botConfigId: bot.id,
      type: 'chat.gating_domain_overflow',
      level: 'warn',
      message: `Origin ${requestOrigin ?? 'no-origin'} excede el cap del plan ${plan.key}`,
      conversationId: conversation.id,
      metadata: { origin: requestOrigin, planKey: plan.key, maxDomains: plan.maxDomains },
    })
    return degradedResponse(
      'Este dominio no está habilitado en el plan actual. ¿Te ayudo por WhatsApp?',
      'domain_overflow',
      {
        whatsappNumber: bot.whatsappNumber,
        whatsappMessage: bot.whatsappMessage,
        companyName: bot.organization.companyName,
      },
    )
  }

  // ─── 5.b Gating: cuota mensual (optimista + reserva atómica) ──
  // Optimista: si ya estamos por encima del cap, ni intentamos el LLM.
  if (quota.conversationsUsed >= plan.quota) {
    chatbotLog(
      'chat.quota_exceeded',
      {
        slug,
        botConfigId: bot.id,
        conversationsUsed: quota.conversationsUsed,
        conversationsLimit: plan.quota,
        planKey: plan.key,
        isFallback: plan.isFallback,
        period: `${quota.year}-${String(quota.month).padStart(2, '0')}`,
      },
      'warn',
    )
    await logChatbotEvent({
      organizationId: orgId,
      botConfigId: bot.id,
      type: 'chat.quota_exceeded',
      level: 'warn',
      message: `Cuota agotada (${quota.conversationsUsed}/${plan.quota}) — plan ${plan.key}`,
      conversationId: conversation.id,
      metadata: {
        conversationsUsed: quota.conversationsUsed,
        conversationsLimit: plan.quota,
        planKey: plan.key,
        period: `${quota.year}-${String(quota.month).padStart(2, '0')}`,
      },
    })
    // B4.5: alerta de upsell idempotente (1 por bot/mes via degradedAt atómico).
    await triggerUpsellAlertIfFirst({
      organizationId: orgId,
      botConfigId: bot.id,
      organizationName: bot.organization.companyName,
      planKey: plan.key,
      planQuota: plan.quota,
      conversationsUsed: quota.conversationsUsed,
      year: quota.year,
      month: quota.month,
      adminLinkPath: `/admin/clients/${bot.organization.id}`,
    })
    return degradedResponse(
      'Por hoy alcanzamos el límite de atención automática del mes. Te derivo con el equipo por WhatsApp así seguimos sin demoras.',
      'quota_exhausted',
      {
        whatsappNumber: bot.whatsappNumber,
        whatsappMessage: bot.whatsappMessage,
        companyName: bot.organization.companyName,
      },
    )
  }

  // Atomic reserve: solo para conversación nueva (mensaje en convo
  // existente no incrementa el contador, así que no necesita reserve).
  // Cubre el race TOCTOU exacto en el último cupo del mes.
  if (isNewConversation) {
    const reserve = await tryReserveConversation(orgId, bot.id, plan.quota)
    if (!reserve.reserved) {
      chatbotLog(
        'chat.quota_reserve_failed',
        {
          slug,
          botConfigId: bot.id,
          conversationsUsed: reserve.conversationsUsed,
          conversationsLimit: reserve.conversationsLimit,
          planKey: plan.key,
        },
        'warn',
      )
      await logChatbotEvent({
        organizationId: orgId,
        botConfigId: bot.id,
        type: 'chat.quota_exceeded',
        level: 'warn',
        message: `TOCTOU: cuota se llenó entre check y reserve — ${reserve.conversationsUsed}/${plan.quota}`,
        conversationId: conversation.id,
        metadata: { reservedRace: true, planKey: plan.key },
      })
      // B4.5: el race TOCTOU también dispara el upsell alert (cubre el caso del
      // último cupo cuando concurrent requests pegan al mismo tiempo).
      await triggerUpsellAlertIfFirst({
        organizationId: orgId,
        botConfigId: bot.id,
        organizationName: bot.organization.companyName,
        planKey: plan.key,
        planQuota: plan.quota,
        conversationsUsed: reserve.conversationsUsed,
        year: reserve.year,
        month: reserve.month,
        adminLinkPath: `/admin/clients/${bot.organization.id}`,
      })
      return degradedResponse(
        'Por hoy alcanzamos el límite de atención automática del mes. Te derivo con el equipo por WhatsApp así seguimos sin demoras.',
        'quota_exhausted',
        {
          whatsappNumber: bot.whatsappNumber,
          whatsappMessage: bot.whatsappMessage,
          companyName: bot.organization.companyName,
        },
      )
    }
    timing.timings.quota_reserve_ms = timing.sinceCursor()
  }

  // ─── 5.c Gating: tope duro de conversación (C0.2) ─────────────
  // A partir de HARD_CAP_MESSAGES mensajes persistidos (~20 turnos del
  // visitante), la conversación automática se cierra con dignidad: respuesta
  // canned + CTA a WhatsApp si el bot lo tiene configurado — NUNCA un 400 ni
  // un turno mudo, y cero costo de LLM. Se evalúa sobre
  // Conversation.messageCount (autoritativo, ya resuelto en este request —
  // cero query extra), como GATE — no como sugerencia al modelo (eso es el
  // soft-cap de sections.ts). No se persiste el mensaje ni se incrementan
  // contadores → el estado degradado es estable en los turnos siguientes.
  // Solo alcanzable en conversaciones existentes (una nueva arranca en 0).
  if ((conversation.messageCount ?? 0) >= HARD_CAP_MESSAGES) {
    chatbotLog(
      'chat.gating_conversation_limit',
      {
        slug,
        botConfigId: bot.id,
        conversationId: conversation.id,
        messageCount: conversation.messageCount,
        hardCap: HARD_CAP_MESSAGES,
      },
      'warn',
    )
    await logChatbotEvent({
      organizationId: orgId,
      botConfigId: bot.id,
      type: 'chat.gating_conversation_limit',
      level: 'warn',
      message: `Conversación al tope (${conversation.messageCount}/${HARD_CAP_MESSAGES} mensajes) — respuesta degradada${bot.whatsappNumber ? ' con CTA a WhatsApp' : ''}`,
      conversationId: conversation.id,
      metadata: { messageCount: conversation.messageCount, hardCap: HARD_CAP_MESSAGES },
    })
    return degradedResponse(
      bot.whatsappNumber
        ? 'Llegamos al tope de esta conversación automática. Te derivo con el equipo por WhatsApp así seguimos personalmente y sin demoras.'
        : 'Llegamos al tope de esta conversación automática. Escribinos por los canales de contacto del sitio y el equipo te sigue personalmente.',
      'conversation_limit',
      {
        whatsappNumber: bot.whatsappNumber,
        whatsappMessage: bot.whatsappMessage,
        companyName: bot.organization.companyName,
      },
    )
  }

  // ─── 6. Persist user message ──────────────────────────────────
  const lastUserMessage = [...body.messages]
    .reverse()
    .find((m) => m.role === 'user')

  if (!lastUserMessage) {
    chatbotLog('chat.no_user_message', { conversationId: conversation.id }, 'warn')
    return Response.json({ error: 'No user message found' }, { status: 400 })
  }

  // INFRA.2 — Idempotencia ante el retry del widget: si el mismo mensaje USER quedó
  // como cola SIN responder (un intento previo lo persistió pero murió antes del
  // onFinish del assistant), NO lo duplicamos. Dedupe leyendo solo columnas existentes
  // (sin migración) vía la cola de la conversación; la corrección la da el chequeo de
  // "cola USER sin responder" (una re-pregunta legítima ya tiene un ASSISTANT después y
  // NO se saltea). Ver shouldSkipUserPersist.
  const tail = await scope.chatMessage.findFirst({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'desc' },
    select: { role: true, content: true, createdAt: true },
  })
  if (!shouldSkipUserPersist(tail, lastUserMessage.content, new Date())) {
    await scope.chatMessage.create({
      conversationId: conversation.id,
      role: 'USER',
      content: lastUserMessage.content,
    })
  }
  timing.mark('user_msg_persist_ms')

  // ─── 7-8. Generación (núcleo compartido web+sync, B2-S1) ──────
  // Intent + system prompt + tools (perfil web = las 4) + resolución de modelo +
  // streamText multi-step + persistencia en onFinish viven en ./core, una sola
  // vez, consumidos por ambos canales. La cáscara web pasa el historial que el
  // cliente mandó (`body.messages`, ya recortado por el schema) y devuelve el
  // stream UI. El `timing` sigue de largo: el núcleo continúa marcando sobre el
  // mismo cursor (intent_ms, prompt_build_ms, llm_setup_ms, y las de onFinish).
  const { result } = await runChatGeneration({
    organizationId: orgId,
    bot: {
      id: bot.id,
      slug,
      botName: bot.botName,
      tone: bot.tone,
      verticalPack: bot.verticalPack,
      proactivePrompts: bot.proactivePrompts,
      llmProvider: bot.llmProvider,
      knowledgeBase: {
        businessInfo: knowledgeBase.businessInfo,
        servicesOrProducts: knowledgeBase.servicesOrProducts,
        faq: knowledgeBase.faq,
        policies: knowledgeBase.policies,
        salesGuidance: knowledgeBase.salesGuidance,
        toneExamples: knowledgeBase.toneExamples,
        forbiddenStatements: knowledgeBase.forbiddenStatements,
      },
      organization: { companyName: bot.organization.companyName },
    },
    conversation,
    isNewConversation,
    plan,
    messages: body.messages,
    lastUserMessageContent: lastUserMessage.content,
    channel: 'web',
    currentPath: body.currentPath,
    proactiveOpener: body.proactiveOpener,
    visitorIpHash: ipHash,
    visitorUserAgent: userAgent,
    timing,
  })

  return result.toUIMessageStreamResponse()

  } catch (unhandledError) {
    // INFRA.1 — Sink off-Neon PRIMERO (mismo patrón silencioso: el logChatbotEvent
    // de abajo también moriría con Neon caída). Reemplaza al chatbotError previo.
    logPersistFailure('chat.unhandled_failed', unhandledError, {
      botSlug: slug,
      botConfigId: bot?.id ?? null,
      stage: 'unhandled',
    })
    if (bot) {
      await logChatbotEvent({
        // orgId (declarado dentro del try tras resolver el bot) no está en scope
        // en este catch externo; la org sale del propio bot ya resuelto.
        organizationId: bot.organization.id,
        botConfigId: bot.id,
        type: 'chat.unhandled_error',
        level: 'error',
        message: unhandledError instanceof Error ? unhandledError.message : 'unknown',
      })
    }
    // B14.5 — el caso más crítico: el endpoint devolvió 500 al visitante.
    // Tag stage=unhandled = error de runtime no anticipado, máxima prioridad
    // de triage. Scrub-pii limpia el payload antes de mandar.
    Sentry.captureException(unhandledError, {
      tags: { module: 'chatbot', stage: 'unhandled' },
      extra: { botSlug: slug, botId: bot?.id },
    })
    return Response.json(
      {
        error: 'Internal server error in chatbot. Check server logs.',
        // En development, devolver más detalle:
        ...(process.env.NODE_ENV !== 'production' && {
          debug: unhandledError instanceof Error ? unhandledError.message : String(unhandledError),
        }),
      },
      { status: 500 }
    )
  }
}
