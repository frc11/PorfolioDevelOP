import { streamText, type ModelMessage } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { buildSystemPrompt, formatDateTimeArgentina } from '@/modules/chatbot/server/prompts'
import { getLLMProvider } from '@/modules/chatbot/server/llm'
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
    const result = streamText({
      model: provider.getModel('gemini-2.5-flash'),
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
    return NextResponse.json(
      { ok: false, error: 'LLM error', details: String(error) },
      { status: 500 },
    )
  }
}
