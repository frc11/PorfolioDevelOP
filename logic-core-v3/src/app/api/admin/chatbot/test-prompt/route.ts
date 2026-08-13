import { streamText, wrapLanguageModel, type ModelMessage } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { buildSystemPrompt, formatDateTimeArgentina } from '@/modules/chatbot/server/prompts'
import { getLLMProvider } from '@/modules/chatbot/server/llm'
// CARRERAS commit 2 — PROVIDER-CLOSE: mismo import directo que usa
// handleChatRequest (el middleware no forma parte del API público de llm/).
import { createProviderStreamCloseMiddleware } from '@/modules/chatbot/server/llm/providerStreamClose'
import {
  PROVIDER_STREAM_IDLE_MS,
  PROVIDER_STREAM_INITIAL_IDLE_MS,
} from '@/modules/chatbot/server/chat/reconcile'
import { chatbotLog, sanitizeErrorMessage } from '@/modules/chatbot/server/logging'
import { requireSuperAdmin } from '@/modules/chatbot/server/admin/requireSuperAdmin'

export const runtime = 'nodejs'
export const maxDuration = 30

const TestPromptSchema = z.object({
  message: z.string().min(1).max(500),
  kbDraft: z.record(z.string(), z.string()),
  botName: z.string().min(1),
  tone: z.string().default('informal_rioplatense'),
  companyName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  await requireSuperAdmin()

  const body = await req.json()
  const parsed = TestPromptSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Invalid input', details: parsed.error.format() },
      { status: 400 },
    )
  }

  const { message, kbDraft, botName, tone, companyName } = parsed.data

  try {
    const provider = getLLMProvider('google')

    // CARRERAS commit 2 — PROVIDER-CLOSE, mismo patrón que handleChatRequest
    // y demo-chat: sin esto el stream de Gemini deja la función colgada hasta
    // maxDuration (30s) en cada prueba de prompt. Guard por
    // specificationVersion en vez de castear. A PROPÓSITO sin watchdog,
    // rate-limit ni persistencia (ruta admin-only, no un segundo runtime).
    // El modelo hardcodeado NO se toca acá: decisión de producto, anotada.
    const rawModel = provider.getModel('gemini-2.5-flash')
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
                  { route: 'admin/test-prompt', ...report },
                  report.reason === 'idle' ? 'warn' : 'info',
                ),
            }),
          })
        : rawModel

    const result = streamText({
      model,
      system: buildSystemPrompt({
        botConfig: {
          botName,
          tone,
        },
        knowledgeBase: {
          businessInfo: kbDraft.businessInfo ?? '',
          servicesOrProducts: kbDraft.servicesOrProducts ?? '',
          faq: kbDraft.faq ?? '',
          policies: kbDraft.policies ?? '',
          salesGuidance: kbDraft.salesGuidance ?? '',
          toneExamples: kbDraft.toneExamples ?? '',
          forbiddenStatements: kbDraft.forbiddenStatements ?? '',
        },
        context: {
          companyName: companyName ?? botName,
          currentDateTime: formatDateTimeArgentina(),
          isFirstMessage: false,
        },
      }),
      messages: [
        {
          role: 'user',
          content: [{ type: 'text', text: message }],
        } satisfies ModelMessage,
      ],
      maxOutputTokens: 800,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    // CARRERAS commit 2 — la fuga: `details: String(error)` mandaba el error
    // interno crudo al cliente (regla del repo: nunca exponer errores
    // internos; aunque la ruta es SUPER_ADMIN-only, un error de provider
    // puede arrastrar URLs/ids de proyecto GCP). El detalle queda server-side
    // sanitizado; el cliente recibe solo el genérico.
    console.error('[test-prompt] LLM error', sanitizeErrorMessage(error))
    return NextResponse.json(
      { ok: false, error: 'LLM error' },
      { status: 500 },
    )
  }
}
