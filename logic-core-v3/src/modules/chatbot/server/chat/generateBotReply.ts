/**
 * B2-S1 — Superficie SINCRÓNICA del chatbot para el Motor (B2-S2).
 *
 * El widget responde SOLO en streaming (`handleChatRequest` →
 * `toUIMessageStreamResponse`); el texto completo del assistant solo existe
 * dentro del `onFinish`. El Motor necesita lo contrario: mensaje entrante →
 * texto completo de respuesta, en UNA llamada, sin HTTP.
 *
 * Esta función es esa superficie. NO expone endpoint: es una función interna
 * importable, y el ÚNICO punto por el que el Motor entra al chatbot es el barrel
 * `@/modules/chatbot/public-api` (frontera ESLint B0), que la re-exporta.
 *
 * Comparte el MISMO núcleo de generación que el widget (`runChatGeneration` en
 * ./core) — no duplica el pipeline. Las diferencias son de canal:
 *   - Perfil de tools `sync`: solo `capture_lead` (las otras 3 son UI del widget).
 *   - Sin origin, sin rate limit por IP (el rate limiting de WhatsApp vive en el
 *     webhook), sin gating de cuota/hard-cap (política de orquestación → B2-S2).
 *   - Historial DB-backed: el Motor manda un solo mensaje; el contexto se
 *     reconstruye desde la conversación persistida (el server es dueño del hilo).
 *   - Drenaje interno del stream hasta el texto completo (no un response HTTP).
 *
 * Persiste Conversation/ChatMessage igual que el widget (mismo onFinish/núcleo).
 */
import { forOrg } from '@/lib/isolation'
import { getPlanForOrg } from '@/lib/plan'
import type { LLMProvider } from '../llm'
import type { LLMProviderName } from '../../shared/types'
import { getOrCreateConversation } from '../conversation'
import { chatbotLog } from '../logging'
import { trimHistory, HISTORY_WINDOW_MESSAGES } from '../../shared/historyPolicy'
import { shouldSkipUserPersist } from './dedup'
import {
  runChatGeneration,
  type GenerationBot,
  type GenerationMessage,
  type GenerationPlan,
} from './core'
import { TimingRecorder } from './timing'

/** Error base de la superficie sincrónica (typed — el caller puede discriminar). */
export class GenerateBotReplyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GenerateBotReplyError'
  }
}

/**
 * El bot solicitado no pertenece a la organización del scope (o no existe).
 * Indistinguible de "no existe" a propósito — no filtra existencia cross-tenant,
 * mismo criterio que el helper de aislamiento. Se lanza ANTES de cualquier
 * escritura: un pedido cross-org no deja rastro en la DB.
 */
export class BotNotInOrgError extends GenerateBotReplyError {
  constructor(botConfigId: string, organizationId: string) {
    super(`Bot "${botConfigId}" no pertenece a la organización "${organizationId}".`)
    this.name = 'BotNotInOrgError'
  }
}

/**
 * El bot existe en la org pero no puede responder: inactivo o sin KnowledgeBase.
 * Se lanza también antes de generar (cero costo de LLM).
 */
export class BotUnavailableError extends GenerateBotReplyError {
  constructor(botConfigId: string, reason: 'inactive' | 'no_knowledge_base') {
    super(`Bot "${botConfigId}" no disponible para responder (${reason}).`)
    this.name = 'BotUnavailableError'
  }
}

export interface GenerateBotReplyInput {
  /** Org dueña del bot (fija el scope de aislamiento de toda la operación). */
  organizationId: string
  /** Bot que responde. Se valida que pertenezca a `organizationId`. */
  botConfigId: string
  /**
   * Identificador de la conversación en el canal sync. Namespaced por el caller
   * (ej. `wa:<waId>`), de modo que no colisiona con las sesiones del widget.
   */
  sessionId: string
  /** Mensaje entrante del contacto. */
  userMessageText: string
  /**
   * Inyección del resolvedor de provider (tests). Default: la factory real. Se
   * pasa tal cual al núcleo → `resolveEffectiveModel`.
   */
  getProvider?: (name: LLMProviderName) => LLMProvider
}

export interface GenerateBotReplyResult {
  /** Texto completo de la respuesta del bot (stream ya drenado). */
  text: string
  /** Conversación (existente o recién creada) donde quedó persistido el turno. */
  conversationId: string
  /** true si en este turno se capturó un lead (autoritativo desde la fila). */
  leadCaptured: boolean
}

/**
 * Genera la respuesta del bot para un mensaje entrante y devuelve el texto
 * completo, drenando el stream internamente. Persiste el turno (user + assistant)
 * igual que el widget.
 *
 * @throws {BotNotInOrgError}   si el bot no es de la org (cero escritura).
 * @throws {BotUnavailableError} si el bot está inactivo o sin KB (cero LLM).
 */
export async function generateBotReply(
  input: GenerateBotReplyInput,
): Promise<GenerateBotReplyResult> {
  const { organizationId, botConfigId, sessionId, userMessageText, getProvider } = input
  const scope = forOrg(organizationId)

  // ─── 1. Validar bot ∈ org (anti-IDOR de lectura; CERO escritura si falla) ──
  // findFirst scoped compone { organizationId } AND { id }: un bot de otra org
  // devuelve null. Se lanza el error tipado ANTES de tocar nada más.
  const bot = await scope.botConfig.findFirst({
    where: { id: botConfigId },
    include: {
      knowledgeBase: true,
      organization: { select: { companyName: true } },
    },
  })
  if (!bot) {
    throw new BotNotInOrgError(botConfigId, organizationId)
  }
  if (!bot.isActive) {
    throw new BotUnavailableError(botConfigId, 'inactive')
  }
  if (!bot.knowledgeBase) {
    throw new BotUnavailableError(botConfigId, 'no_knowledge_base')
  }

  // ─── 2. Plan efectivo (misma fuente que el widget) ────────────
  const plan = await getPlanForOrg(organizationId)
  const generationPlan: GenerationPlan = {
    tools: plan.tools,
    llmModel: plan.llmModel,
    key: plan.key,
    isFallback: plan.isFallback,
  }

  // ─── 3. Conversación (get-or-create por sessionId namespaced) ──
  const { conversation, isNew } = await getOrCreateConversation({
    organizationId,
    botConfigId,
    sessionId,
  })

  // ─── 4. Persistir el mensaje entrante (mismo dedupe INFRA.2 que el widget) ──
  const tail = await scope.chatMessage.findFirst({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'desc' },
    select: { role: true, content: true, createdAt: true },
  })
  if (!shouldSkipUserPersist(tail, userMessageText, new Date())) {
    await scope.chatMessage.create({
      conversationId: conversation.id,
      role: 'USER',
      content: userMessageText,
    })
  }

  // ─── 5. Historial canónico desde la DB (el server es dueño del hilo) ──
  // El Motor manda un solo mensaje; el contexto multi-turno lo reconstruye la
  // conversación persistida (que ya incluye el turno recién guardado). Se recorta
  // con la MISMA política del widget (ventana user-led, último 'user' preservado).
  const rows = await scope.chatMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: 'asc' },
    select: { role: true, content: true },
  })
  const history: GenerationMessage[] = rows.map((m) => ({
    role: m.role === 'ASSISTANT' ? 'assistant' : 'user',
    content: m.content,
  }))
  const messages = trimHistory(history, HISTORY_WINDOW_MESSAGES)

  // ─── 6. Núcleo compartido, perfil de tools `sync` ─────────────
  const generationBot: GenerationBot = {
    id: bot.id,
    slug: bot.slug,
    botName: bot.botName,
    tone: bot.tone,
    verticalPack: bot.verticalPack,
    proactivePrompts: bot.proactivePrompts,
    llmProvider: bot.llmProvider,
    knowledgeBase: {
      businessInfo: bot.knowledgeBase.businessInfo,
      servicesOrProducts: bot.knowledgeBase.servicesOrProducts,
      faq: bot.knowledgeBase.faq,
      policies: bot.knowledgeBase.policies,
      salesGuidance: bot.knowledgeBase.salesGuidance,
      toneExamples: bot.knowledgeBase.toneExamples,
      forbiddenStatements: bot.knowledgeBase.forbiddenStatements,
    },
    organization: { companyName: bot.organization.companyName },
  }

  const { result, persisted } = await runChatGeneration({
    organizationId,
    bot: generationBot,
    conversation,
    isNewConversation: isNew,
    plan: generationPlan,
    messages,
    lastUserMessageContent: userMessageText,
    channel: 'sync',
    timing: new TimingRecorder(Date.now()),
    getProvider,
  })

  // ─── 7. Drenaje interno hasta completar + garantía de persistencia ──
  // consumeStream drena el stream (ejecuta las tools, dispara el onFinish) y
  // resuelve incluso si el modelo falló — se traga el error. Por eso el orden
  // importa y NO es intercambiable:
  //   1) `result.text` PRIMERO: rechaza si el run falló antes de completar un
  //      step (ahí el SDK rechaza sus promesas internas y NUNCA llama al onFinish,
  //      con lo cual `persisted` quedaría pendiente para siempre). Materializarlo
  //      antes convierte ese fallo en un throw tipado — jamás un cuelgue.
  //   2) `persisted` DESPUÉS: solo se alcanza en el camino de éxito, donde el
  //      onFinish sí corre; garantiza que la escritura del assistant/agregados
  //      esté hecha antes de devolver (el onFinish es fire-and-forget para el
  //      widget, pero el caller sync necesita el estado consistente).
  let text: string
  try {
    // Ambas dentro del try: según cómo el SDK exponga el fallo, puede rechazar el
    // consumeStream o (más común) tragarlo y rechazar recién en `result.text`.
    // En cualquiera de los dos casos, sale como error tipado — nunca crudo ni cuelgue.
    await result.consumeStream()
    text = await result.text
  } catch (error) {
    throw new GenerateBotReplyError(
      `El modelo no pudo generar la respuesta: ${
        error instanceof Error ? error.message : 'error de stream'
      }`,
    )
  }
  await persisted

  // ─── 8. leadCaptured autoritativo desde la fila ya persistida ──
  // capture_lead marca Conversation.leadCaptured=true transaccionalmente durante
  // el stream; leer la fila (post-drenaje) es la fuente de verdad.
  const persistedConversation = await scope.conversation.findById(conversation.id)
  const leadCaptured = persistedConversation?.leadCaptured ?? false

  chatbotLog('chat.sync_reply_finished', {
    botConfigId: bot.id,
    conversationId: conversation.id,
    isNewConversation: isNew,
    sessionId,
    leadCaptured,
    replyChars: text.length,
  })

  return { text, conversationId: conversation.id, leadCaptured }
}
