import { streamText, type ModelMessage } from 'ai'
import { z } from 'zod'
import { detectIntent } from '../intent'
import { prisma } from '@/lib/prisma'

import {
  resolveBotBySlug,
  getOrCreateConversation,
} from '../conversation'
import { buildSystemPrompt, formatDateTimeArgentina } from '../prompts'
import { getTools } from '../tools'
import { getLLMProvider } from '../llm'
import { calculateCost } from '../pricing'
import { checkQuota, incrementQuota } from '../quota'
import { checkRateLimit } from '../rate-limit'
import { hashIp, validateAssistantOutput } from '../safety'
import { chatbotLog } from '../logging'
import { chatbotDebug, chatbotError } from '../logging'
import { logChatbotEvent } from '../logging'
import type { LLMProviderName } from '../../shared/types'

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
})

type RequestBody = z.infer<typeof requestBodySchema>

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
  const rateLimit = checkRateLimit(`chat:${slug}:${body.sessionId}`)
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

  // ─── 4 & 5. Quota check + conversation (parallel) ─────────────
  const userAgent = request.headers.get('user-agent')?.slice(0, 500) ?? undefined

  const [quota, { conversation, isNew: isNewConversation }] = await Promise.all([
    checkQuota(bot.id, bot.monthlyQuota),
    getOrCreateConversation({
      botConfigId: bot.id,
      sessionId: body.sessionId,
      currentPath: body.currentPath,
      referrer: body.referrer,
      visitorIpHash: ipHash,
      visitorUserAgent: userAgent,
    }),
  ])

  if (!quota.withinQuota) {
    chatbotLog(
      'chat.quota_exceeded',
      {
        slug,
        botConfigId: bot.id,
        conversationsUsed: quota.conversationsUsed,
        conversationsLimit: quota.conversationsLimit,
        period: `${quota.year}-${String(quota.month).padStart(2, '0')}`,
      },
      'warn'
    )
    return Response.json({
      mode: 'degraded',
      message:
        'Estamos atendiendo muchas consultas este mes. ¿Te ayudo por WhatsApp directamente?',
      ctaWhatsapp: true,
    })
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
      role: 'user',
      content: lastUserMessage.content,
    },
  })

  // ─── 7. Intent detection & Build system prompt ────────────────
  const intentResult = detectIntent(lastUserMessage.content)
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
    },
  })

  const tools = getTools({
    conversationId: conversation.id,
    botConfigId: bot.id,
    organizationId: bot.organization.id,
    visitorIpHash: ipHash,
    visitorUserAgent: userAgent,
  })

  // ─── 8. LLM call with streaming ───────────────────────────────
  const provider = getLLMProvider(bot.llmProvider as LLMProviderName)
  const model = provider.getModel(bot.llmModel)

  chatbotLog('chat.llm_request_start', {
    slug,
    botConfigId: bot.id,
    conversationId: conversation.id,
    isNewConversation,
    provider: bot.llmProvider,
    model: bot.llmModel,
    messageCount: body.messages.length,
  })

  chatbotDebug('llm_call_starting', {
    conversationId: conversation.id,
    systemPromptLength: systemPrompt.length,
    toolCount: Object.keys(tools).length,
  })

  const enrichedSystemPrompt = intentResult.guidance
    ? `${systemPrompt}\n\n---\n\n# CONTEXTO DEL TURNO ACTUAL\n\nIntención detectada: ${intentResult.intent}\n\n${intentResult.guidance}`
    : systemPrompt

  const result = streamText({
    model,
    system: enrichedSystemPrompt,
    messages: body.messages.map((m): ModelMessage => {
      if (m.role === 'user') {
        return { role: 'user', content: [{ type: 'text', text: m.content }] }
      }
      if (m.role === 'assistant') {
        return { role: 'assistant', content: [{ type: 'text', text: m.content }] }
      }
      return { role: 'system', content: m.content }
    }),
    tools,
    temperature: 0.7,
    onFinish: async ({ text, usage, finishReason, toolCalls, toolResults }) => {
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

        const tokensIn = usage.inputTokens ?? 0
        const tokensOut = usage.outputTokens ?? 0
        const costBreakdown = calculateCost(
          resolvedBot.llmProvider as LLMProviderName,
          resolvedBot.llmModel,
          tokensIn,
          tokensOut
        )

        // Persist assistant message + tool calls
        await prisma.chatMessage.create({
          data: {
            conversationId: conversation.id,
            role: 'assistant',
            content: text,
            tokensIn,
            tokensOut,
            toolCalls: toolCalls && toolCalls.length > 0
              ? (toolCalls as unknown as object)
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

        // Update QuotaUsage for current period
        await incrementQuota({
          botConfigId: resolvedBot.id,
          isNewConversation,
          messagesAdded: 2,
          tokensIn,
          tokensOut,
          costUsd: costBreakdown.totalUsd,
        })

        chatbotLog('chat.llm_request_finished', {
          conversationId: conversation.id,
          finishReason,
          tokensIn,
          tokensOut,
          costUsd: Number(costBreakdown.totalUsd.toFixed(6)),
          toolCallCount: toolCalls?.length ?? 0,
          warningCount: warnings.length,
          durationMs: Date.now() - startTime,
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
            toolCallCount: toolCalls?.length ?? 0,
            durationMs: Date.now() - startTime,
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
