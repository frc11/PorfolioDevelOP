import { generateObject } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getLLMProvider } from '../llm'
import { chatbotDebug, chatbotError } from '../logging'

const InsightSchema = z.object({
  category: z.enum([
    'KB_GAP',
    'CONVERSION_LEAK',
    'CONTENT_OPPORTUNITY',
    'CONFIG_TWEAK',
    'COMPETITIVE_INTEL',
  ]),
  title: z.string().min(10).max(100),
  description: z.string().min(20).max(500),
  suggestedAction: z.string().min(20).max(500),
  evidenceCount: z.number().int().min(1),
})

const InsightsResponseSchema = z.object({
  insights: z.array(InsightSchema).min(0).max(5),
})

export async function generateInsightsForBot(botConfigId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const conversations = await prisma.conversation.findMany({
    where: {
      botConfigId,
      startedAt: { gte: thirtyDaysAgo },
    },
    include: {
      messages: {
        select: { role: true, content: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: 200,
  })

  if (conversations.length < 10) {
    return { insufficient: true, conversationCount: conversations.length }
  }

  const bot = await prisma.botConfig.findUnique({
    where: { id: botConfigId },
    include: { knowledgeBase: true, organization: true },
  })

  if (!bot || !bot.knowledgeBase) {
    return { ok: false, error: 'Bot or KB not found' }
  }

  const conversationsSummary = conversations
    .slice(0, 50)
    .map((conversation, index) => {
      const userMessages = conversation.messages
        .filter((message) => message.role === 'USER')
        .map((message) => message.content)
        .join(' | ')

      return `[Conv ${index + 1}, path=${conversation.currentPath ?? '/'}, leadCaptured=${conversation.leadCaptured}]: ${userMessages.slice(0, 400)}`
    })
    .join('\n')

  const totalLeads = conversations.filter((conversation) => conversation.leadCaptured).length
  const conversionRate = ((totalLeads / conversations.length) * 100).toFixed(1)

  const systemPrompt = `Sos un consultor de growth experto en chatbots de venta.
Analiza ${conversations.length} conversaciones reales del bot "${bot.botName}" de ${bot.organization.companyName}
(${bot.industry}, ${conversations.length} convs, ${totalLeads} leads, ${conversionRate}% conversion).

Tu objetivo: generar 3-5 insights ACCIONABLES y especificos. NO insights genericos.

Categorias:
- KB_GAP: el bot no sabe responder algo que la gente pregunta seguido
- CONVERSION_LEAK: donde se pierden leads (path, momento, tipo de pregunta)
- CONTENT_OPPORTUNITY: oportunidad de agregar contenido nuevo
- CONFIG_TWEAK: ajuste de configuracion (quick replies, welcomeMessage, etc.)
- COMPETITIVE_INTEL: menciones de competencia

Reglas:
- Cada insight debe basarse en evidencia concreta (X visitantes hicieron Y).
- "suggestedAction" debe ser especifico, no vago. Ej: NO "mejora la KB" sino "agrega una seccion 'Horarios de atencion' con: lunes a viernes 9 a 18hs"
- "evidenceCount" debe ser el numero real de visitantes/conversaciones que lo demuestran.
- NO inventes datos. Si no hay evidencia clara, no generes el insight.

KB actual (resumida):
${bot.knowledgeBase.businessInfo.slice(0, 500)}
${bot.knowledgeBase.faq.slice(0, 500)}

Quick replies actuales: ${JSON.stringify(bot.quickReplies)}`

  try {
    const provider = getLLMProvider('google')
    const model = provider.getModel('gemini-2.5-flash')

    const { object } = await generateObject({
      model,
      schema: InsightsResponseSchema,
      system: systemPrompt,
      prompt: `Conversaciones a analizar:\n\n${conversationsSummary}`,
      temperature: 0.3,
    })

    chatbotDebug('insights_generated', {
      botConfigId,
      count: object.insights.length,
      conversationsAnalyzed: conversations.length,
    })

    const created = await Promise.all(
      object.insights.map((insight) =>
        prisma.chatbotInsight.create({
          data: {
            botConfigId,
            category: insight.category,
            title: insight.title,
            description: insight.description,
            suggestedAction: insight.suggestedAction,
            evidenceCount: insight.evidenceCount,
            status: 'PENDING',
          },
        })
      )
    )

    return { ok: true, insights: created, conversationsAnalyzed: conversations.length }
  } catch (error) {
    chatbotError('insights_generation_failed', error, { botConfigId })
    return { ok: false, error: 'Failed to generate insights' }
  }
}
