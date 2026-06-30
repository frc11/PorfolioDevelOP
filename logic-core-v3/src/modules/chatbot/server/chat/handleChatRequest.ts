import { randomUUID } from 'node:crypto'
import { streamText, stepCountIs, type ModelMessage } from 'ai'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { detectIntent } from '../intent'
import { getVerticalPack } from '../verticals'
import { prisma } from '@/lib/prisma'

import {
  resolveBotBySlug,
  getOrCreateConversation,
} from '../conversation'
import { buildSystemPrompt, formatDateTimeArgentina } from '../prompts'
import { getTools } from '../tools'
import { getLLMProvider, normalizeLlmProvider } from '../llm'
import { calculateCost } from '../pricing'
import {
  checkQuota,
  incrementQuota,
  tryReserveConversation,
  triggerUpsellAlertIfFirst,
} from '../quota'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { hashIp, validateAssistantOutput } from '../safety'
import { chatbotLog } from '../logging'
import { chatbotDebug, chatbotError } from '../logging'
import { logChatbotEvent } from '../logging'
// LLMProviderName is used only through normalizeLlmProvider — no direct import needed here.
import { getPlanForOrg, type EffectivePlan } from '@/lib/plan'
import { originMatchesAllowed } from '@/lib/security/origin-matcher'

/**
 * Body schema for POST /api/chatbot/[slug]/chat.
 * Validates incoming requests from the frontend.
 */
const requestBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(8000),
      })
    )
    .min(1)
    .max(50),
  sessionId: z.string().min(1).max(200),
  currentPath: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  // Proactive teaser question the bot "asked" via the tooltip. Client-supplied →
  // VALIDATED server-side against the bot's configured proactivePrompts before it
  // is trusted into the system prompt. Never enters the conversation as a turn.
  proactiveOpener: z.string().max(500).optional(),
})

type RequestBody = z.infer<typeof requestBodySchema>

/**
 * Safely extracts the set of admin-configured proactive-prompt strings from the
 * `BotConfig.proactivePrompts` JSON (shape: Record<string, string[]>). Defensive
 * against malformed JSON. Used to validate a client-supplied `proactiveOpener`
 * before it is trusted into the system prompt — only an EXACT match with a
 * configured prompt is accepted, so a forged opener can never inject text.
 */
function collectProactivePrompts(raw: unknown): Set<string> {
  const out = new Set<string>()
  if (raw && typeof raw === 'object') {
    for (const value of Object.values(raw as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') out.add(item)
        }
      }
    }
  }
  return out
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
type DegradedReason = 'quota_exhausted' | 'domain_overflow'

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
  const startTime = Date.now()

  // Per-stage timing breakdown (B1.3). Each `mark(key)` records the time
  // elapsed since the previous mark and advances the cursor. Persisted in
  // metadata.timings of the chat.message_completed event.
  const timings: Record<string, number | null> = {}
  let stepStart = startTime
  const mark = (key: string): void => {
    const now = Date.now()
    timings[key] = now - stepStart
    stepStart = now
  }

  // ─── 1. Parse and validate body ───────────────────────────────
  let body: RequestBody
  try {
    const json = await request.json()
    body = requestBodySchema.parse(json)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'invalid body'
    chatbotLog('chat.bad_request', { slug, error: msg }, 'warn')
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }
  mark('validation_ms')

  chatbotDebug('request_parsed', {
    slug,
    messageCount: body.messages.length,
    sessionId: body.sessionId,
    currentPath: body.currentPath,
  })

  // ─── 2. Resolve bot ───────────────────────────────────────────
  bot = await resolveBotBySlug(slug)
  if (!bot) {
    chatbotLog('chat.bot_not_found', { slug }, 'warn')
    return Response.json({ error: 'Bot not found or inactive' }, { status: 404 })
  }
  const resolvedBot = bot; // non-null reference for callbacks

  if (!bot.knowledgeBase) {
    chatbotLog('chat.bot_no_kb', { slug, botConfigId: bot.id }, 'error')
    return Response.json({ error: 'Bot misconfigured' }, { status: 500 })
  }

  mark('bot_resolve_ms')

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

  mark('rate_limit_ms')

  // ─── 4 & 5. Plan + quota check + conversation (parallel) ──────
  // B4.2: getPlanForOrg() suma 1 DB lookup (cacheada 60s) en paralelo
  //       a las otras dos. La cuota del plan reemplaza bot.monthlyQuota
  //       como límite efectivo.
  const userAgent = request.headers.get('user-agent')?.slice(0, 500) ?? undefined

  const [plan, quota, { conversation, isNew: isNewConversation }] = await Promise.all([
    (async () => {
      const t = Date.now()
      const r: EffectivePlan = await getPlanForOrg(bot.organization.id)
      timings.plan_only_ms = Date.now() - t
      return r
    })(),
    (async () => {
      const t = Date.now()
      // Lectura optimista contra QuotaUsage. El cap real lo enforce el
      // tryReserveConversation atómico de abajo cuando aplica.
      const r = await checkQuota(bot.id, Number.MAX_SAFE_INTEGER)
      timings.quota_only_ms = Date.now() - t
      return r
    })(),
    (async () => {
      const t = Date.now()
      const r = await getOrCreateConversation({
        botConfigId: bot.id,
        sessionId: body.sessionId,
        currentPath: body.currentPath,
        referrer: body.referrer,
        visitorIpHash: ipHash,
        visitorUserAgent: userAgent,
      })
      timings.conv_only_ms = Date.now() - t
      return r
    })(),
  ])
  mark('db_pre_llm_ms')

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
    const reserve = await tryReserveConversation(bot.id, plan.quota)
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
    timings.quota_reserve_ms = Date.now() - stepStart
  }

  // ─── 6. Persist user message ──────────────────────────────────
  const lastUserMessage = [...body.messages]
    .reverse()
    .find((m) => m.role === 'user')

  if (!lastUserMessage) {
    chatbotLog('chat.no_user_message', { conversationId: conversation.id }, 'warn')
    return Response.json({ error: 'No user message found' }, { status: 400 })
  }

  await prisma.chatMessage.create({
    data: {
      conversationId: conversation.id,
      role: 'USER',
      content: lastUserMessage.content,
    },
  })
  mark('user_msg_persist_ms')

  // ─── 7. Intent detection & Build system prompt ────────────────
  // EV.4 — los patrones de intent salen del pack vertical del bot (mismo camino
  // que el scoring de EV.3). `bot` viene de resolveBotBySlug con `include`, así
  // que `verticalPack` ya está en contexto: cero query nueva. Clave desconocida
  // → pack `base` con warning (getVerticalPack nunca lanza).
  const verticalPack = getVerticalPack(bot.verticalPack)
  const intentResult = detectIntent(lastUserMessage.content, verticalPack.intents)
  mark('intent_ms')
  if (intentResult.intent !== 'unknown') {
    chatbotDebug('intent_detected', {
      intent: intentResult.intent,
      conversationId: conversation.id,
    })
  }

  const systemPrompt = buildSystemPrompt({
    botConfig: {
      botName: bot.botName,
      tone: bot.tone,
    },
    knowledgeBase: {
      businessInfo: bot.knowledgeBase.businessInfo,
      servicesOrProducts: bot.knowledgeBase.servicesOrProducts,
      faq: bot.knowledgeBase.faq,
      policies: bot.knowledgeBase.policies,
      salesGuidance: bot.knowledgeBase.salesGuidance,
      toneExamples: bot.knowledgeBase.toneExamples,
      forbiddenStatements: bot.knowledgeBase.forbiddenStatements,
    },
    context: {
      companyName: bot.organization.companyName,
      currentPath: body.currentPath,
      currentDateTime: formatDateTimeArgentina(),
      isFirstMessage: isNewConversation,
      // B4.5: soft-cap. messageCount cuenta user+assistant (~2 por turno);
      // dividimos para obtener turnos del visitante. Conversation nueva → 0.
      userTurnsCount: Math.floor((conversation.messageCount ?? 0) / 2),
    },
  })
  mark('prompt_build_ms')

  // B4.2 — Tools filtradas por plan.tools. Slugs desconocidos en
  // plan.tools se ignoran silenciosamente (getTools usa el catálogo
  // canónico). Si plan.tools quedara vacío (no debería en planes
  // sembrados), `tools` queda {} y el modelo no invoca ninguna.
  const tools = getTools(
    {
      conversationId: conversation.id,
      botConfigId: bot.id,
      organizationId: bot.organization.id,
      // EV.3 — pack vertical del bot (resolución de scoring en capture_lead).
      // `bot` viene de resolveBotBySlug con `include`, así que el escalar ya está
      // en contexto: cero query nueva.
      verticalPack: bot.verticalPack,
      visitorIpHash: ipHash,
      visitorUserAgent: userAgent,
    },
    plan.tools,
  )
  mark('llm_setup_ms')

  // ─── 8. LLM call with streaming ───────────────────────────────
  // B4.2 — Modelo viene del plan, no del BotConfig (legacy).
  //   plan.llmModel ya es 'gemini-2.5-flash' en los 3 planes sembrados.
  //   bot.llmProvider sigue siendo del BotConfig (no hay dimensión
  //   provider en Plan todavía — toda la flota usa 'google' hoy).
  const provider = getLLMProvider(normalizeLlmProvider(bot.llmProvider))
  const model = provider.getModel(plan.llmModel)

  chatbotLog('chat.llm_request_start', {
    slug,
    botConfigId: bot.id,
    conversationId: conversation.id,
    isNewConversation,
    provider: bot.llmProvider,
    model: plan.llmModel,
    planKey: plan.key,
    planIsFallback: plan.isFallback,
    toolSlugsEnabled: Object.keys(tools),
    messageCount: body.messages.length,
  })

  chatbotDebug('llm_call_starting', {
    conversationId: conversation.id,
    systemPromptLength: systemPrompt.length,
    toolCount: Object.keys(tools).length,
  })

  // SEC: el opener viene del cliente → solo se confía si coincide EXACTAMENTE con
  // un prompt proactivo configurado por el admin (config.proactivePrompts). Validado
  // así, es contenido de confianza y va como sección del system prompt (NO se
  // spotlightea como el input del visitante; el hardening SEC-LLM-01 sobre los
  // mensajes 'user' y las secciones del Bloque 1 quedan intactos).
  const validatedOpener = (() => {
    const opener = body.proactiveOpener?.trim()
    if (!opener) return null
    return collectProactivePrompts(bot.proactivePrompts).has(opener) ? opener : null
  })()

  const enrichedSystemPrompt = [
    systemPrompt,
    intentResult.guidance
      ? `# CONTEXTO DEL TURNO ACTUAL\n\nIntención detectada: ${intentResult.intent}\n\n${intentResult.guidance}`
      : null,
    validatedOpener
      ? `# APERTURA PROACTIVA\n\nVos (el asistente) abriste esta conversación enviándole proactivamente al visitante la pregunta: «${validatedOpener}». Su próximo mensaje responde a esa pregunta — continuá con coherencia y NO vuelvas a hacer la misma pregunta.`
      : null,
  ]
    .filter((section): section is string => section !== null)
    .join('\n\n---\n\n')

  // LLM call boundary — used to compute TTFB (first token from Vertex) and
  // separate Vertex time from post-LLM persistence time.
  const llmStartAt = Date.now()
  let ttfbAt: number | null = null

  // MS-1: stepCountIs(3) habilita multi-step.
  //   Step 1 — modelo invoca tool (ej. capture_lead).
  //   Step 2 — modelo lee toolResult y genera texto de confirmación + (opcionalmente)
  //            invoca otra tool (ej. offer_handoff_options).
  //   Step 3 — margen defensivo si el modelo decide encadenar algo más.
  //   Sin esto (default v6 = 1 step), una tool call termina el turn sin texto previo
  //   ni encadenamiento. H2/H3 documentados en bitácora B3.3-B3.6.
  let stepCount = 0

  // SEC-LLM-01 — Spotlighting del input no confiable del visitante.
  // Cada mensaje del visitante se envuelve en <vmsg_{nonce}>…</vmsg_{nonce}>
  // con un nonce aleatorio por request: el visitante no lo conoce, así que no
  // puede cerrar el delimitador para "escaparse" e inyectar instrucciones.
  // La regla que le dice al modelo que ese contenido es DATO (no órdenes) vive
  // en la sección 6 del system prompt (buildAntiHallucination).
  const visitorTag = `vmsg_${randomUUID().replace(/-/g, '').slice(0, 12)}`
  const wrapUntrusted = (text: string): string => {
    // Anti delimiter-escape: removemos cualquier intento del visitante de
    // inyectar la etiqueta (con o sin el nonce real) antes de envolver.
    const stripped = text.replace(/<\/?vmsg_[a-z0-9]*>/gi, '')
    return `<${visitorTag}>\n${stripped}\n</${visitorTag}>`
  }

  const result = streamText({
    model,
    system: enrichedSystemPrompt,
    messages: body.messages.map((m): ModelMessage => {
      // El historial del asistente (sus propios outputs) va tal cual. Todo lo
      // demás —mensajes 'user' y, defensivamente, cualquier 'system' que un
      // cliente intente colar— se trata como input NO confiable y se envuelve
      // con spotlighting. Así el delimitador no es esquivable mandando role:system.
      if (m.role === 'assistant') {
        return { role: 'assistant', content: [{ type: 'text', text: m.content }] }
      }
      return { role: 'user', content: [{ type: 'text', text: wrapUntrusted(m.content) }] }
    }),
    tools,
    temperature: 0.7,
    stopWhen: stepCountIs(3),
    onStepFinish: () => {
      stepCount += 1
    },
    onChunk: ({ chunk }) => {
      // Capture timestamp of the first useful chunk (text or tool-call).
      // Other chunk types (reasoning-delta, raw, etc.) don't count as TTFB.
      if (
        ttfbAt === null &&
        (chunk.type === 'text-delta' || chunk.type === 'tool-call')
      ) {
        ttfbAt = Date.now()
      }
    },
    onFinish: async ({ text, usage, finishReason, toolCalls, toolResults, steps }) => {
      const llmDoneAt = Date.now()
      timings.llm_ttfb_ms = ttfbAt !== null ? ttfbAt - llmStartAt : null
      timings.llm_stream_ms = ttfbAt !== null ? llmDoneAt - ttfbAt : null
      timings.llm_total_ms = llmDoneAt - llmStartAt
      timings.step_count = stepCount

      // MS-1: en multi-step (stopWhen=stepCountIs(3)), las propiedades top-level
      // del onFinish (toolCalls, usage) son SOLO del último step. Tenemos que
      // agregar manualmente desde `steps[]` para que el chatMessage final tenga:
      //   - todas las tool calls de todo el run (capture_lead step 1 + offer_handoff_options step 2)
      //   - tokens/cost reales del run completo (no solo del último step)
      const hasSteps = steps && steps.length > 0
      const allToolCalls = hasSteps ? steps.flatMap((s) => s.toolCalls ?? []) : toolCalls ?? []
      const totalIn = hasSteps
        ? steps.reduce((sum, s) => sum + (s.usage?.inputTokens ?? 0), 0)
        : (usage?.inputTokens ?? 0)
      const totalOut = hasSteps
        ? steps.reduce((sum, s) => sum + (s.usage?.outputTokens ?? 0), 0)
        : (usage?.outputTokens ?? 0)
      stepStart = llmDoneAt
      try {
        // Validate output (capa 4)
        const warnings = validateAssistantOutput(text)
        if (warnings.length > 0) {
          chatbotLog(
            'chat.validation_warnings',
            {
              conversationId: conversation.id,
              warnings: warnings.map((w) => ({
                patternId: w.patternId,
                severity: w.severity,
              })),
            },
            'warn'
          )
          await logChatbotEvent({
            botConfigId: resolvedBot.id,
            type: 'chat.validation_warnings',
            level: 'warn',
            message: `${warnings.length} validation warning(s) en respuesta`,
            conversationId: conversation.id,
            metadata: { warnings: warnings.map((w) => w.patternId) },
          })
        }

        // MS-1: tokens y tool calls agregados desde todos los steps (ver bloque arriba).
        const tokensIn = totalIn
        const tokensOut = totalOut
        const costBreakdown = calculateCost(
          normalizeLlmProvider(resolvedBot.llmProvider),
          resolvedBot.llmModel,
          tokensIn,
          tokensOut
        )

        // Persist assistant message + tool calls (all steps).
        await prisma.chatMessage.create({
          data: {
            conversationId: conversation.id,
            role: 'ASSISTANT',
            content: text,
            tokensIn,
            tokensOut,
            toolCalls: allToolCalls.length > 0
              ? (allToolCalls as unknown as object)
              : undefined,
          },
        })

        // Update Conversation aggregate metrics
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            messageCount: { increment: 2 },  // user + assistant
            tokensIn: { increment: tokensIn },
            tokensOut: { increment: tokensOut },
            estimatedCostUsd: { increment: costBreakdown.totalUsd },
            lastMessageAt: new Date(),
          },
        })

        // Update QuotaUsage for current period.
        // B4.2: `conversationsCount` ya se incrementó atómicamente vía
        // tryReserveConversation cuando isNewConversation=true. Acá pasamos
        // false siempre para evitar double-count del counter. Tokens y cost
        // se siguen acumulando normalmente.
        await incrementQuota({
          botConfigId: resolvedBot.id,
          isNewConversation: false,
          messagesAdded: 2,
          tokensIn,
          tokensOut,
          costUsd: costBreakdown.totalUsd,
        })
        mark('post_persist_ms')
        const totalMs = Date.now() - startTime
        timings.total_ms = totalMs

        chatbotLog('chat.llm_request_finished', {
          conversationId: conversation.id,
          finishReason,
          tokensIn,
          tokensOut,
          costUsd: Number(costBreakdown.totalUsd.toFixed(6)),
          toolCallCount: allToolCalls.length,
          warningCount: warnings.length,
          durationMs: totalMs,
          timings,
        })

        await logChatbotEvent({
          botConfigId: resolvedBot.id,
          type: 'chat.message_completed',
          level: 'info',
          message: `Respuesta enviada (${tokensIn} in / ${tokensOut} out)`,
          conversationId: conversation.id,
          metadata: {
            tokensIn,
            tokensOut,
            costUsd: costBreakdown.totalUsd,
            toolCallCount: allToolCalls.length,
            durationMs: totalMs,
            latencyMs: totalMs,
            timings,
          },
        })
      } catch (persistError) {
        chatbotError('chat.persist_error', persistError, { conversationId: conversation.id })
        await logChatbotEvent({
          botConfigId: resolvedBot.id,
          type: 'chat.persist_error',
          level: 'error',
          message: persistError instanceof Error ? persistError.message : 'unknown',
          conversationId: conversation.id,
        })
        // B14.5 — Sentry para errores inesperados del runtime del bot.
        // El scrub-pii del beforeSend limpia antes de mandar.
        Sentry.captureException(persistError, {
          tags: { module: 'chatbot', stage: 'persist' },
          extra: { conversationId: conversation.id, botSlug: slug },
        })
      }
    },
  })

  return result.toUIMessageStreamResponse()

  } catch (unhandledError) {
    chatbotError('chat.unhandled_error', unhandledError, { slug })
    if (bot) {
      await logChatbotEvent({
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
