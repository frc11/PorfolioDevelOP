import { streamText, type ModelMessage } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeLlmProvider, resolveEffectiveModel } from '@/modules/chatbot/server/llm'
import { buildSystemPrompt, formatDateTimeArgentina } from '@/modules/chatbot/server/prompts'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/modules/chatbot/server/admin/requireSuperAdmin'

export const runtime = 'nodejs'
export const maxDuration = 30

const DemoChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(8000),
  })).min(1).max(30),
  currentPath: z.string().max(500).optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  await requireSuperAdmin()

  const { slug } = await params
  const body = await req.json()
  const parsed = DemoChatSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid input', details: parsed.error.format() },
      { status: 400 },
    )
  }

  const bot = await prisma.botConfig.findUnique({
    where: { slug },
    include: { organization: true, knowledgeBase: true },
  })

  if (!bot?.knowledgeBase) {
    return NextResponse.json({ ok: false, error: 'Bot or KB not found' }, { status: 404 })
  }

  // COST-2b — mismo patrón seguro que handleChatRequest.ts:694 (COST-1): sin
  // esto, bot.llmProvider llega en mayúsculas ('GOOGLE', valor real del enum
  // Prisma) y el cast `as` mentía al compilador — el switch de getLLMProvider
  // compara en minúsculas y caía al default, throw para el 100% de los bots.
  const effectiveModel = resolveEffectiveModel(normalizeLlmProvider(bot.llmProvider), bot.llmModel)
  const result = streamText({
    model: effectiveModel.model,
    system: buildSystemPrompt({
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
        currentPath: parsed.data.currentPath,
        currentDateTime: formatDateTimeArgentina(),
        isFirstMessage: parsed.data.messages.length === 1,
      },
    }),
    messages: parsed.data.messages.map((message): ModelMessage => ({
      role: message.role,
      content: [{ type: 'text', text: message.content }],
    })),
    temperature: bot.temperature,
    maxOutputTokens: bot.maxOutputTokens,
  })

  return result.toTextStreamResponse()
}
