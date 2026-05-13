import { streamText, type ModelMessage } from 'ai'
import { z } from 'zod'
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

  // ─── 2. Resolve bot ───────────────────────────────────────────
  const bot = await resolveBotBySlug(slug)
  if (!bot) {
    chatbotLog('chat.bot_not_found', { slug }, 'warn')
    return Response.json({ error: 'Bot not found or inactive' }, { status: 404 })
  }

  if (!bot.knowledgeBase) {
    chatbotLog('chat.bot_no_kb', { slug, botConfigId: bot.id }, 'error')
    return Response.json({ error: 'Bot misconfigured' }, { status: 500 })
  }

  // ─── 3. Rate limit ────────────────────────────────────────────
  const clientIp = extractClientIp(request)
  const ipHash = hashIp(clientIp)
  const rateLimit = checkRateLimit(`chat:${slug}:${ipHash}`)
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

  // ─── 4. Quota check ───────────────────────────────────────────
  const quota = await checkQuota(bot.id, bot.monthlyQuota)
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

  // ─── 5. Get/create conversation ───────────────────────────────
  const userAgent = request.headers.get('user-agent')?.slice(0, 500) ?? undefined
  const existingConvo = await prisma.conversation.findFirst({
    where: { botConfigId: bot.id, sessionId: body.sessionId },
    select: { id: true },
  })
  const isNewConversation = !existingConvo

  const conversation = await getOrCreateConversation({
    botConfigId: bot.id,
    sessionId: body.sessionId,
    currentPath: body.currentPath,
    referrer: body.referrer,
    visitorIpHash: ipHash,
    visitorUserAgent: userAgent,
  })

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

  // ─── 7. Build system prompt + tools ───────────────────────────
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

  const result = streamText({
    model,
    system: systemPrompt,
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
        }

        const tokensIn = usage.inputTokens ?? 0
        const tokensOut = usage.outputTokens ?? 0
        const costBreakdown = calculateCost(
          bot.llmProvider as LLMProviderName,
          bot.llmModel,
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
          botConfigId: bot.id,
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
      } catch (persistError) {
        chatbotLog(
          'chat.persist_error',
          {
            conversationId: conversation.id,
            error:
              persistError instanceof Error
                ? persistError.message
                : 'unknown',
          },
          'error'
        )
      }
    },
  })

  return result.toUIMessageStreamResponse()
}
