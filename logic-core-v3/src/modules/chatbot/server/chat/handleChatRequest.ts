import { randomUUID } from 'node:crypto'
import { streamText, stepCountIs, type ModelMessage } from 'ai'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { detectIntent } from '../intent'
import { getVerticalPack } from '../verticals'
import { forOrg } from '@/lib/isolation'
import { sanitizeAttributionField } from '../../shared/attribution'
import { shouldSkipUserPersist } from './dedup'

import {
  resolveBotBySlug,
  getOrCreateConversation,
} from '../conversation'
import { buildSystemPrompt, formatDateTimeArgentina } from '../prompts'
import { getTools } from '../tools'
import { normalizeLlmProvider, resolveEffectiveModel } from '../llm'
import { calculateCost } from '../pricing'
import {
  checkQuota,
  incrementQuota,
  tryReserveConversation,
  compensateNewConversationReservation,
  triggerUpsellAlertIfFirst,
} from '../quota'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { hashIp, validateAssistantOutput } from '../safety'
import { chatbotLog } from '../logging'
import { chatbotDebug } from '../logging'
import { logChatbotEvent, logPersistFailure } from '../logging'
// LLMProviderName is used only through normalizeLlmProvider — no direct import needed here.
import { getPlanForOrg, type EffectivePlan } from '@/lib/plan'
import { originMatchesAllowed } from '@/lib/security/origin-matcher'
import {
  trimHistory,
  HISTORY_WINDOW_MESSAGES,
  MAX_MESSAGES_SHAPE,
  MAX_MESSAGE_CHARS,
  HARD_CAP_MESSAGES,
} from '../../shared/historyPolicy'
// ONF-1 — reconcile transaccional del onFinish: decisiones puras (compensación
// de cupo, dedup del retry de persistencia, fallback de respuesta vacía).
import {
  PERSIST_TX_MAX_ATTEMPTS,
  PERSIST_TX_RETRY_BACKOFF_MS,
  ASSISTANT_PERSIST_DEDUP_WINDOW_MS,
  shouldSkipAssistantPersist,
  shouldCompensateQuota,
  buildEmptyFallbackMessage,
  createEmptyResponseFallbackTransform,
  type CompensationTrigger,
  // DEADLINE-ONFINISH — presupuestos de tiempo de los hooks del stream.
  ONFINISH_TOTAL_BUDGET_MS,
  PERSIST_TX_DEADLINE_MS,
  EVENT_LOG_DEADLINE_MS,
  QUOTA_COMPENSATION_DEADLINE_MS,
  computeHookBudgetMs,
} from './reconcile'
// DEADLINE-ONFINISH — techo de tiempo sobre cada await que bloquea el cierre
// del stream. Ver el encabezado de withDeadline.ts: abandona, NO cancela.
import {
  createBudget,
  isDeadlineExceeded,
  withDeadline,
  DeadlineExceededError,
  type LateSettleInfo,
} from './withDeadline'
// PROBE-STREAM — instrumentación TEMPORAL de diagnóstico del tramo
// streamText() → tools → onFinish, gated por CHATBOT_STREAM_PROBE. Ver el
// encabezado de streamProbe.ts. Reversible: buscar `probe: 'stream'`.
import { createStreamProbe } from './streamProbe'

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

// ─── DEADLINE-ONFINISH — plomería de los hooks con techo de tiempo ───────────

/** Desenlace de una operación corrida con deadline. `ok:false` NO se lanza. */
type HookOpResult<T> =
  | { ok: true; value: T; ms: number }
  | { ok: false; error: unknown; timedOut: boolean; noBudget: boolean; ms: number }

/** Desenlace de una fase, para el log agregado `chat.onfinish_phases`. */
type PhaseOutcome = 'ok' | 'deadline' | 'error' | 'skipped' | 'no_budget'

interface PhaseRecord {
  ms: number
  outcome: PhaseOutcome
}

/**
 * Por qué NO se reintentó la persistencia. `null` = se reintentó (o no hizo
 * falta). Sin este campo, "no reintenté" y "reintenté y falló" serían
 * indistinguibles en el log — y son diagnósticos opuestos.
 */
type RetrySkipReason = 'deadline' | 'budget' | 'max_attempts' | null

/**
 * Corre una operación de hook con techo de tiempo y NUNCA lanza: devuelve el
 * desenlace para que el llamador decida. El bucle de persistencia necesita
 * distinguir `timedOut` (cuelgue abandonado → NO reintentar, ya retuvo una
 * conexión del pool) de un error real de Prisma (transitorio → sí reintentar).
 *
 * `deadlineMs <= 0` (presupuesto agotado) NO arranca la operación: disparar una
 * query para abandonarla en el mismo tick cuesta una conexión del pool a cambio
 * de nada.
 */
async function runHookOp<T>(
  label: string,
  deadlineMs: number,
  start: () => Promise<T>,
  onLateSettle?: (info: LateSettleInfo) => void,
): Promise<HookOpResult<T>> {
  if (deadlineMs <= 0) {
    return {
      ok: false,
      error: new DeadlineExceededError(label, 0),
      timedOut: true,
      noBudget: true,
      ms: 0,
    }
  }
  const startedAt = Date.now()
  try {
    const value = await withDeadline(
      start(),
      deadlineMs,
      label,
      onLateSettle ? { onLateSettle } : undefined,
    )
    return { ok: true, value, ms: Date.now() - startedAt }
  } catch (error) {
    return {
      ok: false,
      error,
      timedOut: isDeadlineExceeded(error),
      noBudget: false,
      ms: Date.now() - startedAt,
    }
  }
}

/** Traduce el desenlace de una operación a la etiqueta que va al log de fases. */
function phaseOutcome<T>(result: HookOpResult<T>): PhaseOutcome {
  if (result.ok) return 'ok'
  if (result.noBudget) return 'no_budget'
  return result.timedOut ? 'deadline' : 'error'
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
  // ONF-1 (MH.2) — Compensador de la reserva de cupo del request. Se ARMA solo
  // si hubo reserva atómica (conversación nueva + tryReserveConversation OK) y
  // se dispara desde los puntos donde el turno muere sin entregar respuesta
  // (onError/onAbort sin primer chunk útil, respuesta vacía sin tools, 400
  // post-reserva, catch externo). Hoisted acá para que el catch externo lo
  // alcance. null = no hubo reserva → no hay nada que compensar.
  let compensateReservedQuota:
    | ((
        trigger: CompensationTrigger,
        ctx: { firstTokenDelivered: boolean; toolCallCount: number },
      ) => Promise<void>)
    | null = null
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
  mark('validation_ms')

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
  const resolvedBot = bot; // non-null reference for callbacks
  // B0-S3 — org del tenant (BotConfig.organizationId, ya incluido por
  // resolveBotBySlug). Fija el scope de aislamiento de todo el request.
  const orgId = resolvedBot.organization.id
  const scope = forOrg(orgId)

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
      const r = await checkQuota(orgId, bot.id, Number.MAX_SAFE_INTEGER)
      timings.quota_only_ms = Date.now() - t
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

  // ONF-1 (MH.2) — Una conversación RECIÉN creada cuyo request termina
  // degradado o inválido se descarta: la fila todavía no tiene mensajes (el
  // USER se persiste en la sección 6, después de todos los gates) y solo
  // inflaría las métricas de conversaciones del tenant. Borrado scoped
  // best-effort: si falla, se loguea y la respuesta degradada sale igual.
  // ChatbotEvent.conversationId es onDelete: SetNull → los eventos ya
  // logueados sobreviven al borrado. Conversaciones EXISTENTES (p.ej. el gate
  // conversation_limit, que solo aplica a existentes) jamás se tocan.
  //
  // Guard anti-carrera (hallazgo del review): el delete es condicional a que
  // la conversación siga SIN ningún ASSISTANT persistido — si otro request
  // del mismo sessionId ya entregó un turno en esta fila, no se borra nada
  // (count 0). Nunca se arrastra historia entregada por el cascade.
  let conversationDiscarded = false
  const discardNewConversation = async (reason: string): Promise<void> => {
    if (!isNewConversation || conversationDiscarded) return
    try {
      const del = await scope.conversation.deleteMany({
        id: conversation.id,
        messages: { none: { role: 'ASSISTANT' } },
      })
      if (del.count === 1) {
        conversationDiscarded = true
        chatbotDebug('degraded_conversation_discarded', {
          conversationId: conversation.id,
          reason,
        })
      } else {
        chatbotDebug('degraded_conversation_kept', {
          conversationId: conversation.id,
          reason,
        })
      }
    } catch (discardError) {
      logPersistFailure('chat.degraded_discard_failed', discardError, {
        conversationId: conversation.id,
        botSlug: slug,
        reason,
      })
    }
  }

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
    await discardNewConversation('domain_overflow')
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
    await discardNewConversation('quota_exhausted')
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
      await discardNewConversation('quota_reserve_failed')
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

    // ONF-1 (MH.2) — La reserva atómica ya consumió 1 cupo del mes. Si el
    // turno muere sin entregar respuesta, este compensador devuelve el cupo Y
    // descarta la fila de Conversation en UNA transacción
    // (compensateNewConversationReservation): release con el patrón atómico
    // espejo de la reserva (UPDATE conditional + guard de org — NUNCA un
    // decrement suelto) + delete condicional a "sin ASSISTANT persistido".
    // Van JUNTOS a propósito (hallazgo del review): un release con fila viva
    // dejaría que el retry del widget (INFRA.2) reviva la conversación con
    // isNew=false → sin re-reserva → conversación entera gratis (undercount).
    // Descartada, el retry recrea y VUELVE a reservar: accounting exacto.
    // La decisión de CUÁNDO compensar vive en shouldCompensateQuota
    // (reconcile.ts, pura). year/month del RESULTADO de la reserva: una
    // compensación que cruza el borde de mes devuelve el cupo al período que
    // se reservó. En onAbort este compensador es best-effort (ai@6.0.214 no
    // espera la promesa del hook): si el freeze lo corta, la tx hace rollback
    // completo → cobrado + fila viva = comportamiento pre-sprint, que con el
    // retry del widget también termina en exactamente 1 cobro.
    let reserveCompensated = false
    compensateReservedQuota = async (trigger, ctx) => {
      if (
        !shouldCompensateQuota({
          alreadyCompensated: reserveCompensated,
          trigger,
          firstTokenDelivered: ctx.firstTokenDelivered,
          toolCallCount: ctx.toolCallCount,
        })
      ) {
        return
      }
      // El flag se marca ANTES del await: los hooks del request corren en el
      // mismo event loop, así ningún segundo hook re-entra a la compensación.
      // La atomicidad CROSS-request la dan la tx y el UPDATE condicional.
      reserveCompensated = true
      try {
        const result = await compensateNewConversationReservation({
          organizationId: orgId,
          botConfigId: resolvedBot.id,
          conversationId: conversation.id,
          year: reserve.year,
          month: reserve.month,
        })
        if (result.compensated) conversationDiscarded = true
        chatbotLog(
          'chat.quota_compensated',
          {
            slug,
            botConfigId: resolvedBot.id,
            conversationId: conversation.id,
            trigger,
            compensated: result.compensated,
            conversationsUsed: result.conversationsUsed,
          },
          'warn',
        )
        await logChatbotEvent({
          organizationId: orgId,
          botConfigId: resolvedBot.id,
          type: 'chat.quota_compensated',
          level: 'warn',
          message: result.compensated
            ? `Cupo devuelto (${trigger}): el turno no entregó respuesta — conversación descartada`
            : `Compensación (${trigger}) omitida: la conversación ya tiene un turno entregado — el cobro queda`,
          // Si se compensó, la fila ya no existe: el id va solo en metadata
          // (el FK del evento fallaría el parentCheck contra una fila borrada).
          conversationId: result.compensated ? undefined : conversation.id,
          metadata: {
            trigger,
            compensated: result.compensated,
            conversationId: conversation.id,
            year: reserve.year,
            month: reserve.month,
          },
        })
      } catch (compensationError) {
        // Best-effort: si la tx falla, queda cobrado + fila viva (rollback
        // total — comportamiento pre-sprint, 1 solo cobro vía retry). NO se
        // reintenta desde otro hook — el flag queda en true a propósito:
        // preferimos un cupo de más a devolverlo dos veces.
        logPersistFailure('chat.quota_compensation_failed', compensationError, {
          conversationId: conversation.id,
          botSlug: slug,
          botConfigId: resolvedBot.id,
          trigger,
        })
      }
    }
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
    // ONF-1 — este 400 corre DESPUÉS de la reserva atómica (5.b): sin
    // compensación, un body inválido dejaría 1 cupo consumido sin respuesta.
    // Compensar ANTES de descartar la fila (el evento de compensación
    // referencia conversationId mientras todavía existe).
    await compensateReservedQuota?.('no_user_message', {
      firstTokenDelivered: false,
      toolCallCount: 0,
    })
    await discardNewConversation('no_user_message')
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

  // PROBE-STREAM — instrumentación TEMPORAL de diagnóstico (gated por
  // CHATBOT_STREAM_PROBE; no-op y cero overhead si la env var no está en '1').
  // Creado ACÁ (antes de `getTools`) y no "justo después de chat.llm_request_start"
  // como en el enunciado del sprint: `getTools` arma el contexto de cada tool
  // ANTES de ese log, y el probe tiene que existir para poder pasarlo en ese
  // mismo contexto (ver `ToolCallContext.probe`, tools/types.ts). Mismo
  // `conversation.id`/`startTime` que se hubiera usado más abajo — el reordenamiento
  // es puramente de esta instrumentación nueva, no toca código existente.
  const streamProbe = createStreamProbe(conversation.id, startTime)

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
      // UTM.1 — desde la fila YA resuelta de `conversation` (autoritativa),
      // NUNCA desde `body.utm*`: en un mensaje #2+ de una conversación
      // existente, el body de ESE request puede traer UTMs distintos (u
      // ninguno) que el resolver ignora — usar `body.*` acá filtraría
      // atribución incorrecta hacia capture_lead.
      utmSource: conversation.utmSource ?? undefined,
      utmMedium: conversation.utmMedium ?? undefined,
      utmCampaign: conversation.utmCampaign ?? undefined,
      // PROBE-STREAM — ver comentario arriba.
      probe: streamProbe,
    },
    plan.tools,
  )
  mark('llm_setup_ms')

  // ─── 8. LLM call with streaming ───────────────────────────────
  // B4.2 — Modelo viene del plan, no del BotConfig (legacy).
  //   plan.llmModel ya es 'gemini-2.5-flash' en los 3 planes sembrados.
  //   bot.llmProvider sigue siendo del BotConfig (no hay dimensión
  //   provider en Plan todavía — toda la flota usa 'google' hoy).
  // COST-1 — par (provider, modelo) efectivo resuelto UNA vez; se reusa
  // más abajo en calculateCost (antes el costo leía resolvedBot.llmModel
  // por su lado y podía divergir de lo que esta línea ejecuta).
  const effectiveModel = resolveEffectiveModel(normalizeLlmProvider(bot.llmProvider), plan.llmModel)
  const model = effectiveModel.model
  if (effectiveModel.degraded) {
    await logChatbotEvent({
      organizationId: orgId,
      botConfigId: bot.id,
      type: 'chat.cost_model_unknown',
      level: 'warn',
      message:
        `Provider/modelo solicitado "${effectiveModel.requestedProvider}/${effectiveModel.requestedModel}" ` +
        `no disponible — degradando a "${effectiveModel.provider}/${effectiveModel.modelId}"`,
      conversationId: conversation.id,
      metadata: {
        requestedProvider: effectiveModel.requestedProvider,
        requestedModel: effectiveModel.requestedModel,
        effectiveProvider: effectiveModel.provider,
        effectiveModel: effectiveModel.modelId,
        planKey: plan.key,
      },
    })
  }

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
  // PROBE-STREAM — flag para emitir el mark `firstChunk` una sola vez.
  let firstChunkProbed = false

  // ONF-1 — Fallback de respuesta vacía: si el run termina sin texto útil, el
  // transform (experimental_transform de abajo) inyecta este mensaje de
  // derivación al stream — el visitante lo ve EN VIVO como texto normal del
  // assistant, sin cambios en el widget — y marca el flag para que onFinish
  // no cuente el turno como respuesta entregada. Ver reconcile.ts.
  const emptyFallbackText = buildEmptyFallbackMessage(bot.whatsappNumber)
  let emptyFallbackInjected = false

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

  // PROBE-STREAM — streamText() en sí es síncrono (devuelve el
  // DefaultStreamTextResult de una, el trabajo real es todo dentro de sus
  // callbacks/promesas internas), así que este par enter/exit debería ser
  // siempre ~0ms. Sirve de ancla: si ALGÚN DÍA esto no cierra, el cuelgue está
  // en la construcción misma, no en la ejecución del stream.
  streamProbe.probe('streamText_construct', 'enter')
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
    // ONF-1 — con texto útil el transform es passthrough puro (paridad del
    // camino feliz); solo inyecta la derivación canned en un run vacío.
    experimental_transform: createEmptyResponseFallbackTransform(emptyFallbackText, () => {
      emptyFallbackInjected = true
    }),
    onStepFinish: (step) => {
      stepCount += 1
      // PROBE-STREAM — el SDK no expone un chunk `finish` a `onChunk` (solo
      // text-delta/reasoning-delta/source/tool-call/tool-result/tool-input-*/raw
      // — ver ai/dist/index.js, eventProcessor.transform), así que no hay un
      // "textDone" literal disponible ahí. `onStepFinish` es el hook más cercano
      // con `finishReason` real por step — cubre la misma necesidad diagnóstica
      // (¿llegó el modelo a terminar de generar ESTE step?) sin inventar un punto
      // que no corresponde a ningún callback real del SDK.
      streamProbe.mark('onStepFinish', {
        stepNumber: step.stepNumber,
        finishReason: step.finishReason,
        toolCallCount: step.toolCalls.length,
        textLength: step.text.length,
      })
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
      // PROBE-STREAM — una sola vez, el primer chunk de CUALQUIER tipo (no solo
      // los que cuentan para TTFB). NO se loguea contenido, solo el tipo.
      if (!firstChunkProbed) {
        firstChunkProbed = true
        streamProbe.mark('firstChunk', { chunkType: chunk.type })
      }
    },
    onError: async ({ error }) => {
      // PROBE-STREAM — primera línea: confirma si el hook llega a entrar.
      streamProbe.mark('onError_enter')
      // INFRA.1 — falla mid-stream (Vertex, throw en un tool): hoy la enmascara
      // toUIMessageStreamResponse() como 200 y queda invisible server-side.
      // Sink off-Neon garantizado (stderr) + Sentry best-effort.
      logPersistFailure('chat.stream_error', error, {
        conversationId: conversation.id,
        botSlug: slug,
        botConfigId: resolvedBot.id,
      })
      Sentry.captureException(error, {
        tags: { module: 'chatbot', stage: 'stream' },
        extra: { conversationId: conversation.id, botSlug: slug },
      })
      // ONF-1 (MH.2) — el stream murió: si al visitante no le llegó ni un
      // chunk útil (ttfbAt null), la reserva de cupo se devuelve (atómico,
      // once-only por request). Con entrega parcial, el cupo se cobra.
      //
      // DEADLINE-ONFINISH — este hook TAMBIÉN bloquea el cierre del stream: el
      // SDK lo invoca con `await onError({ error })` dentro del `transform` del
      // eventProcessor. Es la segunda vía de cuelgue del mismo síntoma, así que
      // la compensación va con su propio techo de tiempo. (`onAbort` en cambio
      // NO lo necesita: el SDK lo invoca sin `await` — no bloquea nada.)
      const compensate = compensateReservedQuota
      if (compensate) {
        const errorHookBudget = createBudget(computeHookBudgetMs(Date.now() - startTime))
        const compensation = await runHookOp(
          'onerror_quota_compensation',
          errorHookBudget.clamp(QUOTA_COMPENSATION_DEADLINE_MS),
          () =>
            compensate('stream_error', {
              firstTokenDelivered: ttfbAt !== null,
              toolCallCount: 0,
            }),
          (info) => {
            chatbotLog(
              'chat.hook_late_settlement',
              {
                conversationId: conversation.id,
                botConfigId: resolvedBot.id,
                botSlug: slug,
                phase: info.label,
                deadlineMs: info.deadlineMs,
                elapsedMs: info.elapsedMs,
                settled: info.settled,
              },
              'warn',
            )
          },
        )
        if (!compensation.ok) {
          // El cupo queda cobrado (comportamiento pre-sprint ante fallo de
          // compensación). Rastro off-Neon garantizado; nunca relanza.
          logPersistFailure('chat.onerror_compensation_incomplete', compensation.error, {
            conversationId: conversation.id,
            botSlug: slug,
            botConfigId: resolvedBot.id,
            timedOut: compensation.timedOut,
            noBudget: compensation.noBudget,
            elapsedMs: compensation.ms,
          })
        }
      }
    },
    onAbort: async () => {
      // PROBE-STREAM — primera línea: confirma si el hook llega a entrar.
      streamProbe.mark('onAbort_enter')
      // ONF-1 (MH.2) — stream cortado (cliente desconectado / runtime abortó):
      // mismo criterio que onError — sin primer chunk útil, se devuelve el cupo.
      await compensateReservedQuota?.('stream_abort', {
        firstTokenDelivered: ttfbAt !== null,
        toolCallCount: 0,
      })
    },
    onFinish: async ({ text, usage, finishReason, toolCalls, toolResults, steps }) => {
      // PROBE-STREAM — primera línea, literal. Es el chequeo central de este
      // sprint: si esto NUNCA aparece en un log donde sí aparece `firstChunk` o
      // algún `tool:*:enter`, el cuelgue está confirmado aguas arriba de acá.
      streamProbe.mark('onFinish_enter', { textLength: text.length, finishReason })
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
      // ONF-1 — hoisted fuera del try: el catch INFRA.1 reporta cuántos
      // intentos de persistencia se agotaron.
      let persistAttempt = 0

      // ─── DEADLINE-ONFINISH — techo de tiempo del hook ─────────────────────
      // Este callback corre DENTRO del flush() del stream (el SDK lo invoca con
      // `await`): hasta que no retorna, el readable no llega a `done`, el
      // cliente no pasa a `status:'ready'` y el input del widget sigue trabado.
      // Por eso TODO await que toque la DB va con deadline, y el conjunto con un
      // presupuesto global — techado también contra el `maxDuration` de la ruta,
      // así un LLM lento no vuelve a empujar el hook contra el kill de 30s.
      const hookStartedAt = Date.now()
      const requestElapsedMsAtHookStart = hookStartedAt - startTime
      const budget = createBudget(computeHookBudgetMs(requestElapsedMsAtHookStart))
      let retrySkipped: RetrySkipReason = null
      // Longitud —NUNCA contenido— del mensaje del assistant. Hoisted para que
      // el registro de abandono la alcance desde el catch.
      let assistantMessageLength = 0

      // Todas las fases arrancan en 'skipped' para que el log salga SIEMPRE con
      // la misma forma: una fase condicional que no corrió queda distinguible de
      // una que corrió y falló, sin tener que cruzar el log contra el código.
      const phases: Record<string, PhaseRecord> = {
        validation_warnings_event: { ms: 0, outcome: 'skipped' },
        empty_fallback_event: { ms: 0, outcome: 'skipped' },
        quota_compensation: { ms: 0, outcome: 'skipped' },
        completed_event: { ms: 0, outcome: 'skipped' },
        persist_error_event: { ms: 0, outcome: 'skipped' },
      }
      for (let attempt = 1; attempt <= PERSIST_TX_MAX_ATTEMPTS; attempt += 1) {
        phases[`persist_tx_${attempt}`] = { ms: 0, outcome: 'skipped' }
      }

      // Rastro del settlement TARDÍO de una operación ya abandonada: es el
      // discriminador socket-vs-lock. Si la tx commitea a los 18s → conexión
      // viva pero lenta (lock / cold start). Si nunca aparece → socket muerto.
      // Caveat: Netlify puede congelar el contenedor al cerrar la respuesta, así
      // que su AUSENCIA no prueba nada; su PRESENCIA sí es concluyente.
      const reportLateSettlement = (info: LateSettleInfo): void => {
        chatbotLog(
          'chat.hook_late_settlement',
          {
            conversationId: conversation.id,
            botConfigId: resolvedBot.id,
            botSlug: slug,
            phase: info.label,
            deadlineMs: info.deadlineMs,
            elapsedMs: info.elapsedMs,
            settled: info.settled,
          },
          'warn',
        )
      }

      /** Corre una fase con deadline (techado al presupuesto) y la registra. */
      const runPhase = async <T>(
        phase: string,
        phaseBudgetMs: number,
        start: () => Promise<T>,
      ): Promise<HookOpResult<T>> => {
        const result = await runHookOp(
          phase,
          budget.clamp(phaseBudgetMs),
          start,
          reportLateSettlement,
        )
        phases[phase] = { ms: result.ms, outcome: phaseOutcome(result) }
        return result
      }

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
          await runPhase('validation_warnings_event', EVENT_LOG_DEADLINE_MS, () =>
            logChatbotEvent({
              organizationId: orgId,
              botConfigId: resolvedBot.id,
              type: 'chat.validation_warnings',
              level: 'warn',
              message: `${warnings.length} validation warning(s) en respuesta`,
              conversationId: conversation.id,
              metadata: { warnings: warnings.map((w) => w.patternId) },
            }),
          )
        }

        // ONF-1 — Turno fallback: el modelo devolvió vacío y el transform
        // inyectó la derivación canned al stream. Se persiste el mensaje que
        // el visitante VIO (nunca un turno mudo), pero NO se cuenta como
        // respuesta entregada: sin tools ejecutadas, la reserva de cupo se
        // devuelve. `assistantContent` cae al canned explícito si el texto
        // transformado no llegara al onFinish (belt-and-suspenders).
        const assistantContent =
          emptyFallbackInjected && text.trim().length === 0 ? emptyFallbackText : text
        assistantMessageLength = assistantContent.length
        if (emptyFallbackInjected) {
          chatbotLog(
            'chat.empty_response_fallback',
            {
              conversationId: conversation.id,
              finishReason,
              toolCallCount: allToolCalls.length,
            },
            'warn',
          )
          await runPhase('empty_fallback_event', EVENT_LOG_DEADLINE_MS, () =>
            logChatbotEvent({
              organizationId: orgId,
              botConfigId: resolvedBot.id,
              type: 'chat.empty_response_fallback',
              level: 'warn',
              message: 'Respuesta vacía del modelo — turno degradado con derivación canned',
              conversationId: conversation.id,
              metadata: { finishReason, toolCallCount: allToolCalls.length },
            }),
          )
          // Se captura en un const para que el narrowing sobreviva al closure
          // (`compensateReservedQuota` es un `let` del scope externo).
          const compensate = compensateReservedQuota
          if (compensate) {
            await runPhase('quota_compensation', QUOTA_COMPENSATION_DEADLINE_MS, () =>
              compensate('empty_response', {
                firstTokenDelivered: ttfbAt !== null,
                toolCallCount: allToolCalls.length,
              }),
            )
          }
        }

        // ONF-1 — Si la compensación descartó la conversación (nueva, sin
        // ASSISTANT entregado: cupo devuelto + fila borrada en una tx), no hay
        // fila donde persistir el turno — y persistirlo re-inflaría lo que la
        // compensación limpió. El rastro queda en chat.empty_response_fallback
        // + chat.quota_compensated y en este log de cierre.
        if (conversationDiscarded) {
          mark('post_persist_ms')
          timings.total_ms = Date.now() - startTime
          chatbotLog('chat.llm_request_finished', {
            conversationId: conversation.id,
            finishReason,
            turnDiscarded: true,
            emptyFallback: emptyFallbackInjected,
            durationMs: timings.total_ms,
            timings,
          })
          return
        }

        // MS-1: tokens y tool calls agregados desde todos los steps (ver bloque arriba).
        const tokensIn = totalIn
        const tokensOut = totalOut
        // COST-1 — mismo par efectivo que ejecutó la respuesta (arriba), no
        // resolvedBot.llmProvider/llmModel (legacy, podía divergir de plan.llmModel).
        const costBreakdown = calculateCost(
          effectiveModel.provider,
          effectiveModel.modelId,
          tokensIn,
          tokensOut
        )

        // ONF-1 (RB.3) — Los tres writes del turno son UNA transacción scoped
        // (mismo patrón que capture_lead): entran los tres o ninguno.
        // Orden dentro de la tx: mensaje → conversación → cupo.
        //   - mensaje primero: fila nueva, sin contención;
        //   - conversación después: único lock compartido con la tx de
        //     capture_lead (lead → conversación) — un solo recurso en común
        //     entre ambas transacciones → sin ciclo de deadlock posible;
        //   - cupo al final: la fila QuotaUsage del mes es la de mayor
        //     contención del tenant — se lockea a lo último para achicar su
        //     sección crítica.
        // Ante un corte de Netlify (~10s) a mitad de la transacción, la
        // conexión muere sin COMMIT → Postgres hace rollback: nunca queda
        // estado parcial (cupo movido sin mensaje, o mensaje sin contadores).
        // El turno cortado lo recupera el retry del widget (INFRA.2: la cola
        // USER sin responder no se duplica).
        //
        // Caso "respuesta YA entregada + persistencia falla" (decisión ONF-1):
        // retry acotado (PERSIST_TX_MAX_ATTEMPTS, retry de APLICACIÓN — no el
        // retry de conexión de INFRA.3, que sigue NO activo) con guard de
        // idempotencia: si el COMMIT del intento anterior entró pero el ack se
        // perdió (error post-commit), el reintento ve la cola ASSISTANT
        // idéntica y NO duplica — como los tres writes son atómicos, si el
        // mensaje está, los contadores también entraron. Si el último intento
        // también falla: INFRA.1 (catch de abajo) y se acepta la pérdida del
        // registro con evento claro — la respuesta ya salió y no es
        // re-enviable; preferimos un turno sin registrar a contadores dobles.
        const persistedAt = new Date()
        for (;;) {
          persistAttempt += 1
          const attempt = await runPhase(
            `persist_tx_${persistAttempt}`,
            PERSIST_TX_DEADLINE_MS,
            () =>
              scope.$transaction(async (tx) => {
                if (persistAttempt > 1) {
                  // Query DIRIGIDA al ASSISTANT idéntico dentro de la ventana —
                  // no a la cola (hallazgo del review): un USER interleaved de
                  // otro request del mismo sessionId desplazaría la cola y
                  // taparía el commit fantasma del intento 1.
                  const committedCandidate = await tx.chatMessage.findFirst({
                    where: {
                      conversationId: conversation.id,
                      role: 'ASSISTANT',
                      content: assistantContent,
                      createdAt: { gte: new Date(Date.now() - ASSISTANT_PERSIST_DEDUP_WINDOW_MS) },
                    },
                    orderBy: { createdAt: 'desc' },
                    select: { role: true, content: true, createdAt: true },
                  })
                  if (shouldSkipAssistantPersist(committedCandidate, assistantContent, new Date())) {
                    return
                  }
                }

                // Persist assistant message + tool calls (all steps).
                await tx.chatMessage.create({
                  conversationId: conversation.id,
                  role: 'ASSISTANT',
                  content: assistantContent,
                  tokensIn,
                  tokensOut,
                  toolCalls: allToolCalls.length > 0
                    ? (allToolCalls as unknown as object)
                    : undefined,
                })

                // Update Conversation aggregate metrics
                await tx.conversation.update(conversation.id, {
                  messageCount: { increment: 2 },  // user + assistant
                  tokensIn: { increment: tokensIn },
                  tokensOut: { increment: tokensOut },
                  estimatedCostUsd: { increment: costBreakdown.totalUsd },
                  lastMessageAt: persistedAt,
                })

                // Update QuotaUsage for current period.
                // B4.2: `conversationsCount` ya se incrementó atómicamente vía
                // tryReserveConversation cuando isNewConversation=true. Acá pasamos
                // false siempre para evitar double-count del counter. Tokens y cost
                // se siguen acumulando normalmente — también en un turno fallback
                // (el modelo se consumió igual; lo que se devuelve es el CUPO).
                await incrementQuota(
                  {
                    organizationId: orgId,
                    botConfigId: resolvedBot.id,
                    isNewConversation: false,
                    messagesAdded: 2,
                    tokensIn,
                    tokensOut,
                    costUsd: costBreakdown.totalUsd,
                  },
                  tx,
                )
              }),
          )
          if (attempt.ok) break

          // ── Gate del retry (DEADLINE-ONFINISH) ────────────────────────────
          // El retry de ONF-1 se diseñó para el transitorio CORTO de Neon: un
          // error real y rápido que el 2º intento supera. Un DEADLINE es otra
          // cosa — la operación quedó abandonada pero VIVA, reteniendo su
          // conexión del pool (withDeadline abandona, no cancela). Reintentar
          // ahí retendría una segunda conexión: en un contenedor caliente eso
          // envenena el pool para los requests siguientes (P2024) a cambio de
          // nada, porque el cuelgue no se va a destrabar en 300ms. El valor
          // diagnóstico ya quedó capturado por `onLateSettle` del intento 1.
          if (persistAttempt >= PERSIST_TX_MAX_ATTEMPTS) {
            retrySkipped = 'max_attempts'
            throw attempt.error
          }
          if (attempt.timedOut) {
            retrySkipped = 'deadline'
            throw attempt.error
          }
          // El techo global gana siempre: si no entra un intento COMPLETO más el
          // evento de cierre, no se reintenta — así el reporte de abandono
          // conserva su presupuesto y el stream cierra igual.
          if (
            !budget.hasRoomFor(
              PERSIST_TX_RETRY_BACKOFF_MS + PERSIST_TX_DEADLINE_MS + EVENT_LOG_DEADLINE_MS,
            )
          ) {
            retrySkipped = 'budget'
            throw attempt.error
          }
          // Primer intento fallido: rastro off-Neon YA (si el retry también
          // muere, este log es lo que sobrevive), backoff corto y reintento.
          logPersistFailure('chat.persist_retry', attempt.error, {
            conversationId: conversation.id,
            botSlug: slug,
            botConfigId: resolvedBot.id,
            attempt: persistAttempt,
          })
          await new Promise<void>((resolve) => setTimeout(resolve, PERSIST_TX_RETRY_BACKOFF_MS))
        }
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
          // ONF-1 — 1 = camino feliz; >1 = el retry acotado recuperó el turno.
          persistAttempts: persistAttempt,
          emptyFallback: emptyFallbackInjected,
          timings,
        })

        await runPhase('completed_event', EVENT_LOG_DEADLINE_MS, () =>
          logChatbotEvent({
            organizationId: orgId,
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
          }),
        )
      } catch (persistError) {
        // INFRA.1 — Sink off-Neon PRIMERO, antes de cualquier write a Neon.
        // stderr estructurado con .code/.cause: el rastro que sobrevive a la
        // conexión muerta (Netlify Function Logs). Reemplaza al chatbotError
        // previo, que solo registraba name/message/stack (sin .code/.cause).
        logPersistFailure('chat.persist_failed', persistError, {
          conversationId: conversation.id,
          botSlug: slug,
          botConfigId: resolvedBot.id,
          turnIndex: Math.floor((conversation.messageCount ?? 0) / 2),
          // ONF-1 — intentos agotados del $transaction (retry acotado incluido).
          // El rollback garantiza que NO quedó estado parcial: se perdió el
          // registro del turno completo, no un pedazo.
          attempts: persistAttempt,
          // DEADLINE-ONFINISH — por qué no hubo (o no hubo más) reintentos.
          retrySkipped,
        })

        // DEADLINE-ONFINISH — Registro de RECONCILIACIÓN, distinto del de arriba.
        // `chat.persist_failed` cubre "Postgres falló y garantizó rollback: el
        // turno se perdió, punto". Esto cubre el caso nuevo: el turno se ABANDONÓ
        // por deadline, así que su desenlace es DESCONOCIDO — puede commitear más
        // tarde (ver `chat.hook_late_settlement`). Es la línea a partir de la
        // cual se puede reconciliar a mano lo que falta. Solo identificadores,
        // contadores y LONGITUDES: nunca contenido de mensajes.
        const abandoned = isDeadlineExceeded(persistError) || retrySkipped === 'budget'
        if (abandoned) {
          chatbotLog(
            'chat.persist_abandoned',
            {
              conversationId: conversation.id,
              botConfigId: resolvedBot.id,
              botSlug: slug,
              phase: isDeadlineExceeded(persistError)
                ? persistError.label
                : `persist_tx_${persistAttempt}`,
              elapsedMs: Date.now() - hookStartedAt,
              assistantMessageLength,
              finishReason,
              attempts: persistAttempt,
              retrySkipped,
            },
            'error',
          )
        }

        // Best-effort: si Neon se recuperó, dejar también el row en chatbot_events.
        // logChatbotEvent traga su propio fallo (persistentLogger) y nunca relanza;
        // DEADLINE-ONFINISH le agrega el techo de tiempo y traga también el
        // deadline — el rastro autoritativo ya salió a stderr arriba, y esta
        // escritura puede quedar starved por la conexión que retuvo la tx
        // abandonada. El orden (stderr PRIMERO, DB después) es deliberado: el
        // reporte del fallo no puede depender del recurso que está fallando.
        await runPhase('persist_error_event', EVENT_LOG_DEADLINE_MS, () =>
          logChatbotEvent({
            organizationId: orgId,
            botConfigId: resolvedBot.id,
            type: 'chat.persist_error',
            level: 'error',
            message: persistError instanceof Error ? persistError.message : 'unknown',
            conversationId: conversation.id,
          }),
        )
        // B14.5 — Sentry best-effort (no-op sin NEXT_PUBLIC_SENTRY_DSN → [FALTA:sentry-dsn]).
        // El scrub-pii del beforeSend limpia antes de mandar.
        Sentry.captureException(persistError, {
          tags: { module: 'chatbot', stage: 'persist' },
          extra: { conversationId: conversation.id, botSlug: slug },
        })
      } finally {
        // ─── DEADLINE-ONFINISH (instrumentación) ────────────────────────────
        // UN log agregado, off-Neon, en TODOS los caminos (éxito, fallo, early
        // return del turno descartado). Es el entregable que cierra el
        // diagnóstico: la próxima corrida en prod dice exactamente qué await
        // cuelga y cuánto. Nunca contenido de mensajes — solo fases, duraciones,
        // desenlaces y longitudes.
        //
        // Cómo leerlo:
        //   - `persist_tx_1: deadline` con las fases previas en 'skipped'/'ok'
        //     rápidas → cuelga la transacción (socket muerto o lock).
        //   - un `*_event: deadline` ANTES de la tx → el problema es la conexión,
        //     no un lock de la tx. Ojo: esas fases son condicionales y en tráfico
        //     normal quedan en 'skipped', así que no siempre está disponible.
        //   - un `chat.hook_late_settlement` posterior con la misma `phase` →
        //     la operación SÍ terminó, tarde: conexión viva pero lenta.
        //   - `budgetExhausted: true` → el techo cortó el hook (lo esperado
        //     mientras la causa raíz siga abierta).
        const anomalous = Object.values(phases).some(
          (p) => p.outcome === 'deadline' || p.outcome === 'error' || p.outcome === 'no_budget',
        )
        chatbotLog(
          'chat.onfinish_phases',
          {
            conversationId: conversation.id,
            botConfigId: resolvedBot.id,
            botSlug: slug,
            finishReason,
            assistantMessageLength,
            phases,
            retrySkipped,
            attempts: persistAttempt,
            totalMs: Date.now() - hookStartedAt,
            budgetMs: budget.totalMs,
            budgetExhausted: budget.remainingMs() === 0,
            // Cuánto llevaba el request al entrar al hook: si el presupuesto
            // salió recortado por debajo de ONFINISH_TOTAL_BUDGET_MS, fue por
            // acá (LLM lento empujando contra el maxDuration de la ruta).
            requestElapsedMsAtHookStart,
            budgetCapMs: ONFINISH_TOTAL_BUDGET_MS,
          },
          // Nivel según desenlace: un turno sano no ensucia el carril de error,
          // y uno anómalo sale por stderr junto al resto del rastro off-Neon.
          anomalous ? 'warn' : 'info',
        )
      }
    },
  })
  // PROBE-STREAM — cierra el enter de arriba (streamText() es síncrono: esto
  // debería salir siempre a ~0ms del enter).
  streamProbe.probe('streamText_construct', 'exit')

  // PROBE-STREAM — último punto ANTES de devolver el Response. streamText() ya
  // devolvió (es síncrono); esto solo confirma que el tramo de setup previo al
  // return no colgó por su cuenta.
  streamProbe.mark('beforeStreamResponse')
  return result.toUIMessageStreamResponse()

  } catch (unhandledError) {
    // INFRA.1 — Sink off-Neon PRIMERO (mismo patrón silencioso: el logChatbotEvent
    // de abajo también moriría con Neon caída). Reemplaza al chatbotError previo.
    logPersistFailure('chat.unhandled_failed', unhandledError, {
      botSlug: slug,
      botConfigId: bot?.id ?? null,
      stage: 'unhandled',
    })
    // ONF-1 (MH.2) — si hubo reserva de cupo y el request murió ANTES de
    // devolver el stream (este catch solo alcanza fallos pre-return), el
    // visitante no recibió nada: devolver la reserva (atómico, best-effort).
    await compensateReservedQuota?.('unhandled_error', {
      firstTokenDelivered: false,
      toolCallCount: 0,
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
