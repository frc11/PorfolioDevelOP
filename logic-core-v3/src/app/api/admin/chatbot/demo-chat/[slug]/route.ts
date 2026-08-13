import { streamText, wrapLanguageModel, type ModelMessage } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeLlmProvider, resolveEffectiveModel } from '@/modules/chatbot/server/llm'
// CARRERAS commit 2 — PROVIDER-CLOSE: mismo import directo que usa
// handleChatRequest (el middleware no forma parte del API público de llm/).
import { createProviderStreamCloseMiddleware } from '@/modules/chatbot/server/llm/providerStreamClose'
import {
  PROVIDER_STREAM_IDLE_MS,
  PROVIDER_STREAM_INITIAL_IDLE_MS,
} from '@/modules/chatbot/server/chat/reconcile'
import { chatbotLog } from '@/modules/chatbot/server/logging'
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

  // CARRERAS commit 2 — PROVIDER-CLOSE, mismo patrón que handleChatRequest:
  // el stream de Gemini no cierra solo, y sin esto la función queda colgada
  // hasta maxDuration (30s) en cada demo. Cerrar, nunca abortar (ver el
  // encabezado de llm/providerStreamClose.ts). Guard por specificationVersion
  // en vez de castear: si el modelo no fuera V3 se usa sin envolver
  // (degradación silenciosa: se pierde el cierre, no la respuesta). A
  // PROPÓSITO sin watchdog, rate-limit ni persistencia: esta ruta es un demo
  // admin-only, no un segundo runtime.
  const rawModel = effectiveModel.model
  const model =
    typeof rawModel === 'object' && rawModel.specificationVersion === 'v3'
      ? wrapLanguageModel({
          model: rawModel,
          middleware: createProviderStreamCloseMiddleware({
            idleMs: PROVIDER_STREAM_IDLE_MS,
            initialIdleMs: PROVIDER_STREAM_INITIAL_IDLE_MS,
            onClose: (report) =>
              chatbotLog(
                'provider.stream_chunks',
                { route: 'admin/demo-chat', botSlug: slug, ...report },
                report.reason === 'idle' ? 'warn' : 'info',
              ),
          }),
        })
      : rawModel

  const result = streamText({
    model,
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
