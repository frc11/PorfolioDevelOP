import { randomUUID } from 'node:crypto'
import { streamText, stepCountIs, wrapLanguageModel, type ModelMessage } from 'ai'
import * as Sentry from '@sentry/nextjs'
import { detectIntent } from '../intent'
import { getVerticalPack } from '../verticals'
import { forOrg } from '@/lib/isolation'
import { shouldSkipUserPersist } from './dedup'
// MS-E6.2 (costura A) — contrato de entrada del endpoint: schema del body y
// helpers que leen el request crudo. `requestBodySchema` se re-exporta abajo.
import {
  requestBodySchema,
  collectProactivePrompts,
  countRawMessages,
  extractClientIp,
  type RequestBody,
} from './requestSchema'
// MS-E6.2 (costura A) — respuesta de modo degradado + cap de dominios del plan.
import { degradedResponse, isOriginWithinPlanCap } from './degradedResponse'
// MS-E6.2 (costura A) — plomería de los hooks con techo de tiempo.
import { runHookOp } from './hookOps'

import {
  resolveBotBySlug,
  getOrCreateConversation,
} from '../conversation'
import { buildSystemPrompt, formatDateTimeArgentina } from '../prompts'
import { getTools } from '../tools'
import { normalizeLlmProvider, resolveEffectiveModel } from '../llm'
import {
  checkQuota,
  tryReserveConversation,
  compensateNewConversationReservation,
  triggerUpsellAlertIfFirst,
} from '../quota'
import { checkRateLimit } from '@/lib/rate-limit/limiter'
import { RATE_LIMIT_PRESETS } from '@/lib/rate-limit/presets'
import { hashIp } from '../safety'
import { chatbotLog } from '../logging'
import { chatbotDebug } from '../logging'
import { logChatbotEvent, logPersistFailure } from '../logging'
// LLMProviderName is used only through normalizeLlmProvider — no direct import needed here.
import { getPlanForOrg, type EffectivePlan } from '@/lib/plan'
import { HARD_CAP_MESSAGES } from '../../shared/historyPolicy'
// ONF-1 — reconcile transaccional del onFinish: decisiones puras (compensación
// de cupo, dedup del retry de persistencia, fallback de respuesta vacía).
import {
  shouldCompensateQuota,
  // MUDEZ (commit 3) — qué texto se persiste en onFinish (BUG-D).
  pickPersistedAssistantText,
  buildEmptyFallbackMessage,
  createEmptyResponseFallbackTransform,
  type CompensationTrigger,
  // DEADLINE-ONFINISH — presupuesto del hook de onError.
  QUOTA_COMPENSATION_DEADLINE_MS,
  computeHookBudgetMs,
  // STREAM-TIMEOUT — silencio máximo del provider. WATCHDOG — silencio máximo
  // en el borde de la respuesta antes de que cerremos nosotros.
  STREAM_WATCHDOG_IDLE_MS,
  STREAM_WATCHDOG_INITIAL_IDLE_MS,
  STREAM_WATCHDOG_TOOL_MAX_MS,
  // PROVIDER-CLOSE — ventanas del stream CRUDO del provider (aguas arriba del
  // watchdog del borde). Ver llm/providerStreamClose.ts.
  PROVIDER_STREAM_IDLE_MS,
  PROVIDER_STREAM_INITIAL_IDLE_MS,
} from './reconcile'
// PROVIDER-CLOSE — cierra el stream del provider para que el pipeline del SDK
// (tools, steps, onFinish, usage) pueda avanzar. Cerrar, nunca abortar.
import { createProviderStreamCloseMiddleware } from '../llm/providerStreamClose'
// DEADLINE-ONFINISH — techo de tiempo sobre cada await que bloquea el cierre
// del stream. Ver el encabezado de withDeadline.ts: abandona, NO cancela.
import { createBudget } from './withDeadline'
// PROBE-STREAM — instrumentación TEMPORAL de diagnóstico del tramo
// streamText() → tools → onFinish, gated por CHATBOT_STREAM_PROBE. Ver el
// encabezado de streamProbe.ts. Reversible: buscar `probe: 'stream'`.
import { createStreamProbe } from './streamProbe'
// Contador de chunks del provider — telemetría PERMANENTE (alimenta
// `chat.onfinish_phases`). H.3 lo separó del probe: ver chunkTally.ts.
import { createChunkTally } from './chunkTally'
// WATCHDOG — cierre del stream desde nuestro borde, sin depender del SDK.
// Ver el encabezado de streamWatchdog.ts para el porqué.
import { createStreamWatchdog, type StreamWatchdogController } from './streamWatchdog'
// MUDEZ (commit 2) — frames SSE del canned que el borde encola cuando el turno
// iba a terminar mudo. Forma ESTRICTA (el cliente valida con z.strictObject y
// el campo del delta se llama `delta`) — ver silenceFrames.ts.
import { buildSilenceTextFrames } from './silenceFrames'
// MS-E6.2 (costura B) — suspensión del watchdog mientras corren los tools.
import { createToolSuspensionController } from './toolSuspension'
// MS-E6.2 (costura C) — persistencia del turno (los 3 caminos que lo cierran).
import { createPersistTurn } from './persistTurn'


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
      // C0.1 — slug del bot para el gate de TOOLS_RESTRICTED_TO_AGENCY_BOT
      // (getTools.ts). `bot` viene de resolveBotBySlug con `include`, así que
      // el escalar ya está en contexto: cero query nueva.
      botSlug: bot.slug,
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

  // ─── PROVIDER-CLOSE — cerrar el stream CRUDO del provider cuando se calla ──
  // El stream de Gemini no termina nunca, y el SDK ejecuta el `flush()` de sus
  // transforms internos —donde emite `finish-step`, arranca el step siguiente y
  // dispara `onStepFinish`/`onFinish` con el `usage`— solo cuando el stream de
  // arriba TERMINA. Sin esto: `step_count: 0`, `onFinish` nunca dispara y el
  // costo queda en 0. El watchdog del borde no alcanza porque cierra hacia
  // ABAJO (la respuesta al cliente), no hacia arriba.
  //
  // Se envuelve ACÁ y no dentro de `resolveEffectiveModel` a propósito: esa
  // función está documentada como PURA y tiene dos invariantes que le inyectan
  // providers falsos — envolver ahí rompería su contrato. Acá el fallback de
  // provider ya está resuelto, así que el envoltorio lo cubre igual, y es
  // agnóstico del provider (Anthropic/OpenAI recibirían el mismo trato).
  const rawModel = effectiveModel.model
  const model =
    // `LanguageModel` es una unión (`string | V3 | V2`) y `wrapLanguageModel`
    // exige un V3. Se discrimina por `specificationVersion` en vez de castear.
    // Si algún día el modelo no fuera V3, se usa sin envolver (degradación
    // silenciosa: se pierde el cierre, no la respuesta) y queda el rastro.
    typeof rawModel === 'object' && rawModel.specificationVersion === 'v3'
      ? wrapLanguageModel({
          model: rawModel,
          middleware: createProviderStreamCloseMiddleware({
            idleMs: PROVIDER_STREAM_IDLE_MS,
            initialIdleMs: PROVIDER_STREAM_INITIAL_IDLE_MS,
            // H.3 — telemetría PERMANENTE (antes iba por el probe, gated).
            // Junto con `watchdog_settled` es la única señal de si el pipeline
            // cierra por sí mismo: `sawFinishChunk` dice si el provider manda
            // su chunk terminal (y con él el `usage`, o sea el costo).
            // `warn` solo cuando `reason: 'idle'` — el único caso en que
            // ACTUAMOS nosotros; `natural`/`cancelled` son el camino sano.
            onClose: (report) =>
              chatbotLog(
                'provider.stream_chunks',
                {
                  conversationId: conversation.id,
                  // `resolvedBot`, no `bot`: esto es un callback y el narrowing
                  // de un `let` no sobrevive al closure (ver :466).
                  botConfigId: resolvedBot.id,
                  botSlug: slug,
                  ...report,
                },
                report.reason === 'idle' ? 'warn' : 'info',
              ),
          }),
        })
      : rawModel
  if (typeof rawModel === 'object' && rawModel.specificationVersion !== 'v3') {
    streamProbe.mark('provider.stream_close_skipped', {
      specificationVersion: rawModel.specificationVersion,
    })
  }
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
  // Conteo de chunks por tipo. Su `snapshot()` viaja en `chat.onfinish_phases`
  // (permanente): si `chunks_total` siguió subiendo tras el fin del texto, el
  // provider seguía hablando. Ver chunkTally.ts.
  const chunkTally = createChunkTally()
  // STREAM-TIMEOUT (Fase 2) — Texto del asistente acumulado por nuestra cuenta.
  // Es la ÚNICA forma de tener el mensaje en el camino de abort: cuando el run
  // muere por timeout, el SDK no arma ni entrega el texto (no hay `finish-step`,
  // así que `steps[]` viene vacío y `onFinish` ni siquiera se invoca).
  let accumulatedAssistantText = ''

  // WATCHDOG-2 — `watchdogRef` es un holder mutable porque el controller del
  // watchdog recién existe DESPUÉS de que `streamText(...)` retorna (más abajo),
  // pero estos callbacks se PASAN como parte de la config de `streamText` antes
  // de eso. Por construcción (streamText es síncrono) el holder ya está poblado
  // para cuando el SDK pueda disparar el primer tool call, así que el optional
  // chaining de los consumidores es defensivo, no una carrera real.
  const watchdogRef: { current: StreamWatchdogController | null } = { current: null }

  // MS-E6.2 (costura B) — la suspensión por contador vive en su propio módulo.
  // Su estado (toolsInFlight, suspendedSinceAt, suspendedMsTotal, el timer del
  // techo) queda en el closure del factory: una instancia POR REQUEST, nunca a
  // nivel de módulo. Ver toolSuspension.ts.
  const suspension = createToolSuspensionController({
    watchdogRef,
    probe: streamProbe,
    toolMaxMs: STREAM_WATCHDOG_TOOL_MAX_MS,
  })
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

  // MS-E6.2 (costura C) — la persistencia del turno vive en su propio módulo.
  // `turnPersisted` (el guard de idempotencia) queda en el closure del factory:
  // una instancia por request, nunca a nivel de módulo.
  //
  // ⚠️ Los cuatro últimos son GETTERS, no valores, y es deliberado: el handler
  // MUTA esos bindings DESPUÉS de esta línea (`onChunk` setea `ttfbAt`,
  // `onStepFinish` incrementa `stepCount`, el transform marca
  // `emptyFallbackInjected`, y `conversationDiscarded` lo mueven
  // `discardNewConversation` y la compensación de cupo — que `persistTurn`
  // invoca él mismo). Congelarlos acá los dejaría en null/0/false/false para
  // siempre. Ver la tabla del encabezado de persistTurn.ts.
  const persistTurn = createPersistTurn({
    conversation,
    resolvedBot,
    slug,
    orgId,
    scope,
    startTime,
    llmStartAt,
    effectiveModel,
    emptyFallbackText,
    chunkTally,
    streamProbe,
    timings,
    mark,
    setStepStart: (value) => {
      stepStart = value
    },
    compensateReservedQuota,
    getTtfbAt: () => ttfbAt,
    getStepCount: () => stepCount,
    getEmptyFallbackInjected: () => emptyFallbackInjected,
    getConversationDiscarded: () => conversationDiscarded,
  })

  // MUDEZ (commit 1) — señal de abort PROPIA del run, POR REQUEST (nunca a
  // nivel de módulo). Hasta este commit el run no tenía NINGUNA señal externa:
  // no se pasaba `abortSignal` y el único abortador era el AbortController
  // interno de `chunkMs` (removido acá — ver reconcile.ts §1.c). Esta señal la
  // dispara el watchdog al actuar (onIdle) y ante la cancelación del cliente:
  // es lo único que mata un fetch de Vertex pendiente (la señal viaja a
  // `doStream`, ai/dist/index.js:7733-7743) — la cancelación del body NO llega
  // sola: muere en el tee del SDK (`teeStream`, :8219-8223, cancelar una rama
  // no cancela la fuente).
  const runAbortController = new AbortController()

  const result = streamText({
    model,
    abortSignal: runAbortController.signal,
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
    // MUDEZ (commit 1) — SIN `timeout`. `chunkMs` ("benigno") resultó ser la
    // causa raíz de la variante orig3 del turno mudo: su timer corre DURANTE la
    // ejecución de los tools (el SDK retiene el `finish` del provider hasta que
    // terminan, así que el gap es intra-step) y un capture_lead legítimo de >5s
    // abortaba el run entero en silencio — sin onError, sin onFinish con 0
    // steps, sin texto, sin persistencia. Ver reconcile.ts §1.c y la bitácora
    // del bloque MUDEZ. Los techos reales: silencio del provider →
    // providerStreamClose; tool colgado → STREAM_WATCHDOG_TOOL_MAX_MS +
    // watchdog; doStream pendiente / borde → watchdog. Recursos upstream → el
    // `abortSignal` de arriba, disparado por el watchdog.
    // WATCHDOG-2 — suspende/reanuda el watchdog del borde mientras un tool
    // ejecuta su `execute()` server-side (ver el bloque de arriba). Confirmado
    // contra el SDK instalado, con doc oficial: "Callback that is called right
    // after a tool's execute function completes (or errors)"
    // (ai/dist/index.d.ts:2881) — `onToolCallFinish` corre en AMBOS caminos
    // (éxito: ai/dist/index.js:3088-3097; error: :3065-3075), así que el
    // contador SIEMPRE se decrementa y el watchdog nunca queda suspendido por
    // culpa de un tool que falla (el `STREAM_WATCHDOG_TOOL_MAX_MS` de arriba
    // cubre el caso de un tool que ni falla ni resuelve — cuelga de verdad).
    experimental_onToolCallStart: suspension.onToolCallStart,
    experimental_onToolCallFinish: suspension.onToolCallFinish,
    // WATCHDOG-3 — el arranque en frío del provider es POR STEP, no por
    // stream: tras un tool, el modelo arranca un step NUEVO (llamada nueva al
    // provider) para generar el texto final, con su propio cold start. Sin
    // esto, `resume()` (disparado por `onToolCallFinish` cuando el contador
    // llega a 0) dejaba la ventana CORTA activa justo cuando hacía falta la
    // ventana larga — el watchdog cortaba antes de que llegara el primer token
    // del step 2 (el lead se guardaba, pero el bot nunca respondía nada).
    // Confirmado que corre ANTES de invocar al provider para ese step
    // (ai/dist/index.d.ts:1340, "before the provider is called"; runtime en
    // ai/dist/index.js:7661-7685, antes de `doStream` en :7690-7746) — incluido
    // el primer step, donde es redundante con el arranque de `start()` pero
    // inofensivo (mismo idempotente re-arm).
    experimental_onStepStart: () => {
      watchdogRef.current?.beginStep()
    },
    // ONF-1 — con texto útil el transform es passthrough puro (paridad del
    // camino feliz); solo inyecta la derivación canned en un run vacío.
    experimental_transform: createEmptyResponseFallbackTransform(emptyFallbackText, () => {
      emptyFallbackInjected = true
    }),
    // El conteo de steps viaja en `timings.step_count`
    // (`chat.llm_request_finished`), que es permanente.
    onStepFinish: () => {
      stepCount += 1
    },
    onChunk: ({ chunk }) => {
      // WATCHDOG-4 — LA señal de "el modelo empezó a responder de verdad".
      // El SDK invoca `onChunk` SOLO para chunks reales del modelo (text-delta,
      // reasoning-delta, source, tool-call, tool-result, tool-input-*, raw —
      // ai/dist/index.js:7105) y NUNCA para `start`/`start-step`/`finish-step`/
      // `finish`. El watchdog del borde opera sobre BYTES y no puede
      // distinguirlos: veía el frame `start` del SDK (encolado apenas se crea el
      // stream, antes de que el modelo genere nada) y se pasaba a la ventana
      // corta, matando respuestas que Vertex tardaba en arrancar. Con esto la
      // ventana la decide el contenido, no el transporte.
      watchdogRef.current?.markContent()
      // Capture timestamp of the first useful chunk (text or tool-call).
      // Other chunk types (reasoning-delta, raw, etc.) don't count as TTFB.
      if (
        ttfbAt === null &&
        (chunk.type === 'text-delta' || chunk.type === 'tool-call')
      ) {
        ttfbAt = Date.now()
      }
      // STREAM-TIMEOUT (Fase 2) — Acumular el texto que el visitante VE. Es lo
      // único que permite persistir el turno desde el camino de abort, donde el
      // SDK no nos entrega el texto armado. Nunca se loguea; solo se persiste.
      if (chunk.type === 'text-delta') {
        accumulatedAssistantText += chunk.text
      }
      // STREAM-TIMEOUT (Fase 2) — conteo + heartbeat (throttled). Solo TIPOS y
      // contadores, jamás contenido.
      chunkTally.record(chunk.type)
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
    onAbort: async ({ steps }) => {
      // PROBE-STREAM — primera línea: confirma si el hook llega a entrar.
      streamProbe.mark('onAbort_enter', {
        assistantTextLength: accumulatedAssistantText.length,
        stepCount: steps?.length ?? 0,
        ...chunkTally.snapshot(),
      })
      // ONF-1 (MH.2) — stream cortado (cliente desconectado / runtime abortó):
      // mismo criterio que onError — sin primer chunk útil, se devuelve el cupo.
      // Va PRIMERO: si compensa, descarta la fila de Conversation y deja
      // `conversationDiscarded` en true, que es justo lo que persistTurn mira
      // para no re-inflar lo que la compensación limpió.
      await compensateReservedQuota?.('stream_abort', {
        firstTokenDelivered: ttfbAt !== null,
        toolCallCount: 0,
      })

      // STREAM-TIMEOUT (Fase 2) — El visitante YA vio este texto: persistirlo es
      // lo único que evita que el turno se pierda. Sin texto acumulado no hay
      // nada que guardar (un abort antes del primer chunk no deja turno).
      //
      // ⚠️ BEST-EFFORT, sin garantía — el SDK invoca este hook SIN await
      // (`onAbort?.({ steps })` en ai/dist/index.js:7363, seguido inmediatamente
      // de `controller.close()`). En serverless la función se congela al cerrar
      // la respuesta, así que esta escritura CORRE CARRERA contra el freeze y
      // puede no completar. No hay forma de meterla en un camino que el SDK
      // espere: tras un abort no queda step registrado, así que el `flush` del
      // eventProcessor toma su early-return y nunca llama a `onFinish`. Si falla,
      // el rastro queda en `chat.onfinish_phases` / `chat.persist_abandoned`.
      if (accumulatedAssistantText.trim().length > 0) {
        const abortToolCalls = steps?.flatMap((s) => s.toolCalls ?? []) ?? []
        await persistTurn({
          source: 'onAbort',
          assistantText: accumulatedAssistantText,
          // No hay finishReason del provider: el run murió antes del terminal.
          finishReason: 'abort',
          toolCalls: abortToolCalls,
          // Sin `finish-step` no hay usage del provider. Se persiste 0 a
          // propósito (subreporte honesto) en vez de inventar una estimación.
          tokensIn: steps?.reduce((sum, s) => sum + (s.usage?.inputTokens ?? 0), 0) ?? 0,
          tokensOut: steps?.reduce((sum, s) => sum + (s.usage?.outputTokens ?? 0), 0) ?? 0,
        })
      }
    },
    onFinish: async ({ text, usage, finishReason, toolCalls, steps }) => {
      // MS-1: en multi-step (stopWhen=stepCountIs(3)), las propiedades top-level
      // del onFinish (toolCalls, usage) son SOLO del último step. Tenemos que
      // agregar manualmente desde `steps[]` para que el chatMessage final tenga:
      //   - todas las tool calls de todo el run (capture_lead step 1 + offer_handoff_options step 2)
      //   - tokens/cost reales del run completo (no solo del último step)
      const hasSteps = steps && steps.length > 0
      await persistTurn({
        source: 'onFinish',
        // MUDEZ (commit 3) — `text` es SOLO el último step: si cierra vacío
        // pero el visitante vio texto de steps anteriores (streameado en vivo),
        // se persiste el acumulado de onChunk — lo que la pantalla mostró.
        // Ver pickPersistedAssistantText en reconcile.ts (BUG-D).
        assistantText: pickPersistedAssistantText(text, accumulatedAssistantText),
        finishReason,
        toolCalls: hasSteps ? steps.flatMap((s) => s.toolCalls ?? []) : (toolCalls ?? []),
        tokensIn: hasSteps
          ? steps.reduce((sum, s) => sum + (s.usage?.inputTokens ?? 0), 0)
          : (usage?.inputTokens ?? 0),
        tokensOut: hasSteps
          ? steps.reduce((sum, s) => sum + (s.usage?.outputTokens ?? 0), 0)
          : (usage?.outputTokens ?? 0),
      })
    },
  })
  // ─── WATCHDOG — el cierre del stream, desde NUESTRO borde ───────────────────
  // Último eslabón bajo nuestro control antes de que la respuesta salga. Si el
  // body se queda mudo más de STREAM_WATCHDOG_IDLE_MS, persistimos el turno y
  // cerramos el readable nosotros: el cliente ve `done`, `useChat` pasa a
  // `ready` y el input se destraba. Cero dependencia de `abortSignal` o de que
  // corra algún `flush` del SDK — que es exactamente lo que falló dos veces.
  const streamed = result.toUIMessageStreamResponse()
  const watchdog = createStreamWatchdog({
    idleMs: STREAM_WATCHDOG_IDLE_MS,
    // WATCHDOG-2 — ventana generosa para el cold start (antes del primer
    // chunk); `idleMs` (más ajustado) aplica recién después. Ver reconcile.ts.
    initialIdleMs: STREAM_WATCHDOG_INITIAL_IDLE_MS,
    onIdle: async () => {
      // ESPERADO antes de cerrar: mientras el readable siga abierto la respuesta
      // no terminó y la función sigue viva. Acá la persistencia deja de ser la
      // carrera contra el freeze que sí era desde `onAbort` (donde el SDK ya
      // había llamado a `controller.close()`).
      //
      // Idempotente por el flag `turnPersisted`: si `onFinish` llegara a correr
      // igual, el segundo camino sale por su early-return — cero doble escritura
      // y cero doble conteo de cupo. `persistTurn` trae su propio techo de
      // tiempo (presupuesto de ONF-2), así que esta espera está acotada.
      //
      // MUDEZ (commit 2) — la red que HABLA. Con texto acumulado, se persiste
      // lo que el visitante vio (como siempre). Sin texto, el turno iba a
      // terminar mudo: se persiste la derivación canned (source
      // 'watchdog_canned', distinguible a propósito en telemetría) y se
      // DEVUELVEN sus frames — el watchdog los encola justo antes del
      // terminate, así el visitante ve la derivación en vez de silencio.
      // Decisión del bloque: se COBRA y se persiste (transcript > cupo).
      const spokeCanned = accumulatedAssistantText.trim().length === 0
      await persistTurn(
        spokeCanned
          ? {
              source: 'watchdog_canned',
              assistantText: emptyFallbackText,
              finishReason: 'watchdog_idle',
              toolCalls: [],
              tokensIn: 0,
              tokensOut: 0,
            }
          : {
              source: 'watchdog',
              assistantText: accumulatedAssistantText,
              // El run nunca emitió su chunk terminal: no hay finishReason real.
              finishReason: 'watchdog_idle',
              // Sin `finish-step` no hay tool calls agregadas ni `usage` del
              // provider. Se persisten 0 tokens a propósito (subreporte
              // auditable, con `source` en el log para reconciliar) en vez de
              // inventar una estimación en una tabla de costo.
              toolCalls: [],
              tokensIn: 0,
              tokensOut: 0,
            },
      )
      // MUDEZ (commit 1) — ⚠️ NO REORDENAR: el abort va DESPUÉS del persist.
      // Parecen dos pasos independientes y NO lo son — el drain que arranca acá
      // puede disparar `onAbort` → compensación de cupo, y esa compensación
      // borra la fila de Conversation dentro de su tx: si le gana la carrera al
      // persist de arriba, el turno (canned incluido) se queda sin fila donde
      // vivir. Persistir PRIMERO garantiza que el delete condicional de la
      // compensación ("solo si no hay ASSISTANT persistido") encuentre la fila
      // y no borre nada.
      //   1. abort: mata el fetch de Vertex pendiente (la causa de la variante
      //      C5: doStream sin headers por 31s que ningún timer cubría) y les
      //      avisa a los tools que respeten la señal.
      //   2. consumeStream: abre una rama NUEVA del tee del SDK y drena el
      //      pipeline congelado — es la ÚNICA forma de que el reconcile del SDK
      //      corra tras nuestro terminate (la cancelación del body muere en el
      //      tee). Con el drain, onAbort/onFinish SÍ corren: con ≥1 step
      //      registrado, onFinish recupera la contabilidad del turno
      //      (persistTurn es idempotente — el primero en llegar gana).
      runAbortController.abort()
      // `consumeStream()` devuelve PromiseLike (sin .catch propio): se envuelve.
      // El drain nunca debe tumbar el cierre — cualquier error suyo se traga
      // (el rastro del turno ya salió por los caminos de arriba).
      void Promise.resolve(result.consumeStream()).catch(() => {})
      return spokeCanned ? buildSilenceTextFrames(emptyFallbackText) : null
    },
    // MUDEZ (commit 2) — la red del CIERRE LIMPIO. El SDK puede cerrar el body
    // normal y rápido con CERO texto: un part de error (p.ej.
    // NoOutputGeneratedError) cierra vía closeStream — sin silencio no hay
    // idle, y sin chunk `finish` el fallback del transform no inyecta. Acá se
    // decide si el borde habla: solo si no hubo texto Y el fallback no habló.
    // El watchdog NUNCA lo invoca en `cancel` (visitante ido).
    onSilentClose: async () => {
      if (accumulatedAssistantText.trim().length > 0) return null
      if (emptyFallbackInjected) return null
      await persistTurn({
        source: 'watchdog_canned',
        assistantText: emptyFallbackText,
        finishReason: 'silent_close',
        toolCalls: [],
        tokensIn: 0,
        tokensOut: 0,
      })
      return buildSilenceTextFrames(emptyFallbackText)
    },
    onEvent: (info) => {
      if (info.reason === 'idle') {
        // MUDEZ (commit 2, premortem #13) — el disparo idle también suelta el
        // timer del techo de tools: antes solo lo soltaban closed/cancelled y
        // un timer huérfano de hasta 15s quedaba vivo tras el cierre (inocuo en
        // serverless por el freeze, leak menor en dev — cerrado acá).
        suspension.clearToolMaxTimer()
        // Contadores de la suspensión al momento del disparo (ver toolSuspension.ts:
        // `suspendedMsTotal` ya incluye cualquier suspensión todavía abierta).
        const { toolsInFlight, suspendedMsTotal } = suspension.snapshot()
        // El evento que importa: el watchdog tuvo que actuar. Va a stderr
        // SIEMPRE (no gated por el probe) porque es la señal de que el stream
        // de Gemini sigue sin cerrar. Longitudes y contadores, nunca contenido.
        chatbotLog(
          'chat.watchdog_fired',
          {
            conversationId: conversation.id,
            botConfigId: resolvedBot.id,
            botSlug: slug,
            reason: info.reason,
            chunks: info.chunks,
            // WATCHDOG-4 — los dos campos que habrían hecho este diagnóstico
            // inmediato: `window: "content"` con `contentChunks: 0` es una
            // contradicción evidente (el transporte arrancó, el modelo no).
            contentChunks: info.contentChunks,
            window: info.window,
            elapsedMs: info.elapsedMs,
            lastGapMs: info.lastGapMs,
            assistantTextLength: accumulatedAssistantText.length,
            toolsInFlight,
            suspendedMsTotal,
          },
          'warn',
        )
        return
      }
      // Cierre normal o cancelación del cliente: ya no hay nada que suspender.
      suspension.clearToolMaxTimer()
      // MUDEZ (commit 1) — el cliente se fue: matar el run (fetch de Vertex
      // incluido). Sin esto el pipeline queda congelado en el tee del SDK
      // quemando el fetch hasta el freeze de la función. En 'closed' (el SDK
      // terminó solo) el abort es innecesario y no se emite.
      if (info.reason === 'cancelled') {
        runAbortController.abort()
      }
      // H.3 — telemetría PERMANENTE (antes iba por el probe, gated). Es la
      // contraparte sana de `chat.watchdog_fired`: el stream cerró solo (o el
      // cliente canceló) y el watchdog NO tuvo que actuar. Sin esta línea, un
      // pipeline que dejara de cerrar por sí mismo se vería como silencio.
      // Nombre sin prefijo `chat.` a propósito: es el que ya se usa para
      // filtrar en los logs desde los sprints del watchdog.
      chatbotLog('watchdog_settled', {
        conversationId: conversation.id,
        botConfigId: resolvedBot.id,
        botSlug: slug,
        reason: info.reason,
        chunks: info.chunks,
        contentChunks: info.contentChunks,
        window: info.window,
        elapsedMs: info.elapsedMs,
        lastGapMs: info.lastGapMs,
      })
    },
  })
  // WATCHDOG-2 — recién acá existe el controller: los callbacks de tool call ya
  // están wireados en el streamText de arriba (referencian este mismo holder).
  watchdogRef.current = watchdog

  // `streamed.body` es null solo si no hubiera cuerpo; acá siempre lo hay
  // (toUIMessageStreamResponse arma un ReadableStream). El fallback devuelve la
  // respuesta intacta en vez de romper.
  if (streamed.body === null) return streamed

  // Se preservan status, statusText y headers: `route.ts` los vuelve a copiar
  // para los headers de CORS y no necesita ningún cambio (el body sigue siendo
  // un ReadableStream).
  return new Response(streamed.body.pipeThrough(watchdog.stream), {
    status: streamed.status,
    statusText: streamed.statusText,
    headers: streamed.headers,
  })

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
