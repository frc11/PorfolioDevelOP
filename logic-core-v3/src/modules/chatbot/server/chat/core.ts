/**
 * B2-S1 — Núcleo de generación del chatbot (compartido web + sync).
 *
 * ─── EL CORTE (núcleo vs cáscara) ────────────────────────────────────────────
 *
 * `handleChatRequest` mezclaba dos responsabilidades. Este sprint las separa sin
 * duplicar el pipeline: el streamText + su onFinish de persistencia viven UNA
 * sola vez, acá, y los dos canales (widget web, sync del Motor) los consumen.
 *
 * NÚCLEO (este archivo, `runChatGeneration`) — todo lo que es "generar la
 * respuesta del bot", idéntico para cualquier canal:
 *   - detección de intent + armado del system prompt (con la apertura proactiva
 *     y la guía de intent),
 *   - mapeo del historial a ModelMessage con spotlighting anti-inyección,
 *   - armado de tools (gating por plan × perfil del canal),
 *   - resolución del par (provider, modelo) efectivo,
 *   - la llamada a `streamText` (multi-step con tools),
 *   - la persistencia en `onFinish` (ChatMessage ASSISTANT + agregados de
 *     Conversation + QuotaUsage + eventos/telemetría).
 *
 * CÁSCARA (cada canal, fuera de acá) — lo que es propio del transporte:
 *   - web (`handleChatRequest`): parseo del Request, gate de origin + cap de
 *     dominios del plan, rate limit por IP/sesión, gating de cuota/hard-cap, y
 *     el shape del stream de respuesta (`toUIMessageStreamResponse`).
 *   - sync (`generateBotReply`): validación bot∈org, armado del historial desde
 *     la DB, drenaje interno del stream hasta el texto completo.
 *
 * El núcleo NO valida origin, NO aplica rate limit, NO hace gating de cuota: eso
 * es política del canal. El núcleo tampoco resuelve el bot ni persiste el
 * mensaje del visitante — recibe todo ya resuelto por la cáscara.
 *
 * ─── PRESERVACIÓN DEL COMPORTAMIENTO DEL WIDGET ──────────────────────────────
 *
 * El canal web debe producir el MISMO comportamiento observable que antes del
 * corte (contrato: suites ev1–ev5/ev3:golden/utm1). Por eso el núcleo replica la
 * lógica original al pie: mismas marcas de timing (compartidas vía el
 * `TimingRecorder` que la cáscara le pasa a medio camino), mismos logs, misma
 * persistencia, mismo `streamText`. La única diferencia parametrizada es el
 * PERFIL DE TOOLS por canal (web: las 4; sync: solo capture_lead) — y para web
 * el perfil es el catálogo completo, así que el set efectivo no cambia.
 */
import { randomUUID } from 'node:crypto'
import { streamText, stepCountIs, type ModelMessage } from 'ai'
import * as Sentry from '@sentry/nextjs'
import type { Conversation, LlmProvider } from '@prisma/client'
import { forOrg } from '@/lib/isolation'
import { detectIntent } from '../intent'
import { getVerticalPack } from '../verticals'
import { buildSystemPrompt, formatDateTimeArgentina } from '../prompts'
import { getTools } from '../tools'
import type { LLMProvider } from '../llm'
import type { LLMProviderName } from '../../shared/types'
import { normalizeLlmProvider, resolveEffectiveModel } from '../llm'
import { calculateCost } from '../pricing'
import { incrementQuota } from '../quota'
import { validateAssistantOutput } from '../safety'
import { chatbotLog, chatbotDebug, logChatbotEvent, logPersistFailure } from '../logging'
import { resolveChannelToolSlugs, type ChatChannel } from './channels'
import { TimingRecorder } from './timing'

/**
 * Subconjunto del `BotConfig` (+ relaciones) que el núcleo necesita para
 * generar. Desacoplado del tipo Prisma completo para que ambos canales puedan
 * armarlo desde su propia resolución (web: `resolveBotBySlug`; sync: lectura
 * scoped por id). `knowledgeBase` ya viene garantizado no-null por la cáscara.
 */
export interface GenerationBot {
  id: string
  slug: string
  botName: string
  tone: string
  verticalPack: string
  /** JSON de prompts proactivos configurados por el admin (validación del opener). */
  proactivePrompts: unknown
  /** Enum Prisma (mayúsculas); se normaliza vía `normalizeLlmProvider`. */
  llmProvider: LlmProvider
  knowledgeBase: {
    businessInfo: string
    servicesOrProducts: string
    faq: string
    policies: string
    salesGuidance: string
    toneExamples: string
    forbiddenStatements: string
  }
  organization: { companyName: string }
}

/** Datos del plan que el núcleo consume (gating de tools + modelo + telemetría). */
export interface GenerationPlan {
  tools: string[]
  llmModel: string
  key: string
  isFallback: boolean
}

/** Un turno del historial ya normalizado (rol lowercase, contenido crudo). */
export interface GenerationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface RunChatGenerationInput {
  /** Org del tenant (scope de aislamiento de toda la persistencia del núcleo). */
  organizationId: string
  bot: GenerationBot
  /** Fila de conversación YA resuelta por la cáscara (autoritativa). */
  conversation: Pick<
    Conversation,
    'id' | 'messageCount' | 'utmSource' | 'utmMedium' | 'utmCampaign'
  >
  isNewConversation: boolean
  plan: GenerationPlan
  /** Ventana de historial ya recortada, incluyendo el turno en curso. */
  messages: readonly GenerationMessage[]
  /** Contenido del último mensaje del visitante (intent + guardas del prompt). */
  lastUserMessageContent: string
  channel: ChatChannel
  /** Ruta donde se abrió el chat (widget). `undefined` en canales sin ruta. */
  currentPath?: string
  /** Apertura proactiva del widget (validada contra los prompts del admin). */
  proactiveOpener?: string
  visitorIpHash?: string
  visitorUserAgent?: string
  /**
   * Recorder de timings. La cáscara web pasa el suyo (con las marcas de pre-LLM
   * ya hechas); sync pasa uno fresco.
   */
  timing: TimingRecorder
  /**
   * Inyección del resolvedor de provider (tests). Default: la factory real vía
   * `resolveEffectiveModel`. Permite un `LLMProvider` mockeado sin credenciales.
   */
  getProvider?: (name: LLMProviderName) => LLMProvider
}

export interface ChatGenerationResult {
  /** Resultado de `streamText`. La cáscara decide cómo consumirlo. */
  result: ReturnType<typeof streamText>
  /**
   * Resuelve cuando la persistencia del `onFinish` terminó (éxito o error
   * atrapado). El canal web la ignora (fire-and-forget, igual que hoy); el
   * canal sync la espera para garantizar la escritura antes de devolver.
   */
  persisted: Promise<void>
}

/**
 * Extrae de forma defensiva el set de prompts proactivos configurados por el
 * admin (`BotConfig.proactivePrompts`, shape Record<string, string[]>). Solo un
 * match EXACTO con un prompt configurado se confía en el system prompt — un
 * opener forjado por el cliente nunca inyecta texto.
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
 * Corre el pipeline de generación (intent → prompt → tools → LLM → persistencia)
 * y devuelve el resultado de `streamText` sin consumirlo. La cáscara elige el
 * shape de consumo:
 *   - web  → `result.toUIMessageStreamResponse()` (stream al navegador).
 *   - sync → `await result.consumeStream()` + `await persisted` (texto completo).
 *
 * Es `async` solo por el log de degrade del modelo (best-effort, awaiteado antes
 * de `streamText` como en el original): `streamText` en sí es síncrono — el
 * stream se consume lazy después.
 */
export async function runChatGeneration(
  input: RunChatGenerationInput,
): Promise<ChatGenerationResult> {
  const {
    organizationId: orgId,
    bot,
    conversation,
    isNewConversation,
    plan,
    messages,
    lastUserMessageContent,
    channel,
    currentPath,
    proactiveOpener,
    visitorIpHash,
    visitorUserAgent,
    timing,
    getProvider,
  } = input

  const scope = forOrg(orgId)
  const slug = bot.slug

  // ─── 7. Intent detection & Build system prompt ────────────────
  // EV.4 — los patrones de intent salen del pack vertical del bot (mismo camino
  // que el scoring de EV.3). Clave desconocida → pack `base` con warning
  // (getVerticalPack nunca lanza).
  const verticalPack = getVerticalPack(bot.verticalPack)
  const intentResult = detectIntent(lastUserMessageContent, verticalPack.intents)
  timing.mark('intent_ms')
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
      currentPath,
      currentDateTime: formatDateTimeArgentina(),
      isFirstMessage: isNewConversation,
      // B4.5: soft-cap. messageCount cuenta user+assistant (~2 por turno);
      // dividimos para obtener turnos del visitante. Conversation nueva → 0.
      userTurnsCount: Math.floor((conversation.messageCount ?? 0) / 2),
    },
  })
  timing.mark('prompt_build_ms')

  // B4.2 — Tools filtradas por plan.tools × perfil del canal (B2-S1). Slugs
  // desconocidos se ignoran silenciosamente (getTools usa el catálogo canónico).
  // Para el canal web el perfil es el catálogo completo → set idéntico al de hoy;
  // para sync solo queda `capture_lead`.
  const enabledTools = resolveChannelToolSlugs(channel, plan.tools)
  const tools = getTools(
    {
      conversationId: conversation.id,
      botConfigId: bot.id,
      organizationId: orgId,
      // EV.3 — pack vertical del bot (resolución de scoring en capture_lead).
      verticalPack: bot.verticalPack,
      visitorIpHash,
      visitorUserAgent,
      // UTM.1 — desde la fila YA resuelta de `conversation` (autoritativa),
      // NUNCA desde el body del request: en un mensaje #2+ de una conversación
      // existente, ese body puede traer UTMs distintos que el resolver ignora.
      utmSource: conversation.utmSource ?? undefined,
      utmMedium: conversation.utmMedium ?? undefined,
      utmCampaign: conversation.utmCampaign ?? undefined,
    },
    enabledTools,
  )
  timing.mark('llm_setup_ms')

  // ─── 8. LLM call with streaming ───────────────────────────────
  // B4.2 — Modelo viene del plan, no del BotConfig (legacy). bot.llmProvider
  // sigue siendo del BotConfig (no hay dimensión provider en Plan todavía).
  // COST-1 — par (provider, modelo) efectivo resuelto UNA vez; se reusa en
  // calculateCost más abajo.
  const effectiveModel = resolveEffectiveModel(
    normalizeLlmProvider(bot.llmProvider),
    plan.llmModel,
    getProvider,
  )
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
    channel,
    toolSlugsEnabled: Object.keys(tools),
    messageCount: messages.length,
  })

  chatbotDebug('llm_call_starting', {
    conversationId: conversation.id,
    systemPromptLength: systemPrompt.length,
    toolCount: Object.keys(tools).length,
  })

  // SEC: el opener viene del cliente → solo se confía si coincide EXACTAMENTE con
  // un prompt proactivo configurado por el admin. Validado así, va como sección
  // del system prompt (el hardening SEC-LLM-01 sobre 'user'/'system' queda intacto).
  const validatedOpener = (() => {
    const opener = proactiveOpener?.trim()
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

  // LLM call boundary — TTFB (primer token de Vertex) vs. tiempo post-LLM.
  const llmStartAt = Date.now()
  let ttfbAt: number | null = null

  // MS-1: stepCountIs(3) habilita multi-step (tool → texto de confirmación →
  // margen). Sin esto (default v6 = 1 step) una tool call termina el turn sin
  // texto previo ni encadenamiento.
  let stepCount = 0

  // SEC-LLM-01 — Spotlighting del input no confiable del visitante. Cada mensaje
  // del visitante se envuelve en <vmsg_{nonce}>…</vmsg_{nonce}> con un nonce
  // aleatorio por request: el visitante no lo conoce, así que no puede cerrar el
  // delimitador para inyectar instrucciones. La regla que marca ese contenido
  // como DATO vive en la sección 6 del system prompt (buildAntiHallucination).
  const visitorTag = `vmsg_${randomUUID().replace(/-/g, '').slice(0, 12)}`
  const wrapUntrusted = (text: string): string => {
    const stripped = text.replace(/<\/?vmsg_[a-z0-9]*>/gi, '')
    return `<${visitorTag}>\n${stripped}\n</${visitorTag}>`
  }

  // Deferred de persistencia: el onFinish lo resuelve en su `finally`. El canal
  // web lo ignora (no lo observa → sin unhandled rejection; el onFinish atrapa sus
  // errores y esta promesa nunca rechaza). El canal sync lo espera SOLO tras
  // materializar `result.text` — que rechaza si el run falló antes de completar un
  // step (ahí el SDK ni llama al onFinish, así que `persisted` quedaría pendiente).
  // De ese modo un fallo del modelo es un throw en sync, jamás un cuelgue.
  let resolvePersisted!: () => void
  const persisted = new Promise<void>((resolve) => {
    resolvePersisted = resolve
  })

  const result = streamText({
    model,
    system: enrichedSystemPrompt,
    messages: messages.map((m): ModelMessage => {
      // El historial del asistente va tal cual. Todo lo demás —'user' y,
      // defensivamente, cualquier 'system' colado— se trata como input NO
      // confiable y se envuelve con spotlighting.
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
      if (
        ttfbAt === null &&
        (chunk.type === 'text-delta' || chunk.type === 'tool-call')
      ) {
        ttfbAt = Date.now()
      }
    },
    onError: ({ error }) => {
      // INFRA.1 — falla mid-stream: sink off-Neon garantizado (stderr) + Sentry.
      logPersistFailure('chat.stream_error', error, {
        conversationId: conversation.id,
        botSlug: slug,
        botConfigId: bot.id,
      })
      Sentry.captureException(error, {
        tags: { module: 'chatbot', stage: 'stream' },
        extra: { conversationId: conversation.id, botSlug: slug },
      })
    },
    onFinish: async ({ text, usage, finishReason, toolCalls, steps }) => {
      const llmDoneAt = Date.now()
      timing.timings.llm_ttfb_ms = ttfbAt !== null ? ttfbAt - llmStartAt : null
      timing.timings.llm_stream_ms = ttfbAt !== null ? llmDoneAt - ttfbAt : null
      timing.timings.llm_total_ms = llmDoneAt - llmStartAt
      timing.timings.step_count = stepCount

      // MS-1: en multi-step las propiedades top-level del onFinish son SOLO del
      // último step. Agregamos manualmente desde `steps[]` (todas las tool calls
      // del run + tokens/cost reales del run completo).
      const hasSteps = steps && steps.length > 0
      const allToolCalls = hasSteps ? steps.flatMap((s) => s.toolCalls ?? []) : toolCalls ?? []
      const totalIn = hasSteps
        ? steps.reduce((sum, s) => sum + (s.usage?.inputTokens ?? 0), 0)
        : (usage?.inputTokens ?? 0)
      const totalOut = hasSteps
        ? steps.reduce((sum, s) => sum + (s.usage?.outputTokens ?? 0), 0)
        : (usage?.outputTokens ?? 0)
      timing.setCursor(llmDoneAt)
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
            'warn',
          )
          await logChatbotEvent({
            organizationId: orgId,
            botConfigId: bot.id,
            type: 'chat.validation_warnings',
            level: 'warn',
            message: `${warnings.length} validation warning(s) en respuesta`,
            conversationId: conversation.id,
            metadata: { warnings: warnings.map((w) => w.patternId) },
          })
        }

        // MS-1: tokens y tool calls agregados desde todos los steps.
        const tokensIn = totalIn
        const tokensOut = totalOut
        // COST-1 — mismo par efectivo que ejecutó la respuesta.
        const costBreakdown = calculateCost(
          effectiveModel.provider,
          effectiveModel.modelId,
          tokensIn,
          tokensOut,
        )

        // Persist assistant message + tool calls (all steps).
        await scope.chatMessage.create({
          conversationId: conversation.id,
          role: 'ASSISTANT',
          content: text,
          tokensIn,
          tokensOut,
          toolCalls: allToolCalls.length > 0
            ? (allToolCalls as unknown as object)
            : undefined,
        })

        // Update Conversation aggregate metrics
        await scope.conversation.update(conversation.id, {
          messageCount: { increment: 2 }, // user + assistant
          tokensIn: { increment: tokensIn },
          tokensOut: { increment: tokensOut },
          estimatedCostUsd: { increment: costBreakdown.totalUsd },
          lastMessageAt: new Date(),
        })

        // Update QuotaUsage for current period.
        // B4.2: `conversationsCount` ya se incrementó (o no) en la cáscara —
        // acá pasamos isNewConversation=false SIEMPRE para no double-contar el
        // counter. Tokens y cost se acumulan normalmente.
        await incrementQuota({
          organizationId: orgId,
          botConfigId: bot.id,
          isNewConversation: false,
          messagesAdded: 2,
          tokensIn,
          tokensOut,
          costUsd: costBreakdown.totalUsd,
        })
        timing.mark('post_persist_ms')
        const totalMs = Date.now() - timing.startTime
        timing.timings.total_ms = totalMs

        chatbotLog('chat.llm_request_finished', {
          conversationId: conversation.id,
          finishReason,
          tokensIn,
          tokensOut,
          costUsd: Number(costBreakdown.totalUsd.toFixed(6)),
          toolCallCount: allToolCalls.length,
          warningCount: warnings.length,
          durationMs: totalMs,
          timings: timing.timings,
        })

        await logChatbotEvent({
          organizationId: orgId,
          botConfigId: bot.id,
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
            timings: timing.timings,
          },
        })
      } catch (persistError) {
        // INFRA.1 — Sink off-Neon PRIMERO, antes de cualquier write a Neon.
        logPersistFailure('chat.persist_failed', persistError, {
          conversationId: conversation.id,
          botSlug: slug,
          botConfigId: bot.id,
          turnIndex: Math.floor((conversation.messageCount ?? 0) / 2),
        })
        // Best-effort: si Neon se recuperó, dejar el row en chatbot_events.
        await logChatbotEvent({
          organizationId: orgId,
          botConfigId: bot.id,
          type: 'chat.persist_error',
          level: 'error',
          message: persistError instanceof Error ? persistError.message : 'unknown',
          conversationId: conversation.id,
        })
        Sentry.captureException(persistError, {
          tags: { module: 'chatbot', stage: 'persist' },
          extra: { conversationId: conversation.id, botSlug: slug },
        })
      } finally {
        // La cáscara sync espera esto antes de leer leadCaptured/devolver.
        resolvePersisted()
      }
    },
  })

  return { result, persisted }
}
