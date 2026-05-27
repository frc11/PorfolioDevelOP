import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import { logAdminAction } from '@/lib/audit-log'
import { getTemplate } from '@/modules/chatbot/components/admin/onboarding/kb-templates'
import type { Industry } from '@/modules/chatbot/server/admin/createClientWithBot'

const KNOWN_INDUSTRIES: Industry[] = [
  'legal', 'contable', 'medico_odontologico', 'gimnasio', 'restaurant',
  'inmobiliaria', 'concesionaria', 'distribuidora', 'constructora', 'generico',
]

async function findUniqueBotSlug(base: string): Promise<string> {
  let candidate = base
  let n = 0
  while (await prisma.botConfig.findUnique({ where: { slug: candidate } })) {
    n++
    candidate = `${base}-${n}`
    if (n > 100) throw new Error('Cannot find unique bot slug')
  }
  return candidate
}

export interface CreateBotInput {
  organizationId: string
  botName: string
  industry: string
  accentColor?: string
  welcomeMessage?: string
  whatsappNumber?: string
  createdByUserId: string
  createdByUserEmail?: string | null
  createdByUserName?: string | null
}

export async function createBot(input: CreateBotInput) {
  const org = await prisma.organization.findUnique({
    where: { id: input.organizationId },
    select: { id: true, companyName: true },
  })
  if (!org) throw new Error('Organization no encontrada')

  const existingBot = await prisma.botConfig.findUnique({
    where: { organizationId: input.organizationId },
  })
  if (existingBot) throw new Error('Esta organización ya tiene un chatbot configurado')

  const resolvedIndustry: Industry = KNOWN_INDUSTRIES.includes(input.industry as Industry)
    ? (input.industry as Industry)
    : 'generico'

  const slug = await findUniqueBotSlug(slugify(input.botName))
  const template = getTemplate(resolvedIndustry)

  const bot = await prisma.$transaction(async (tx) => {
    const newBot = await tx.botConfig.create({
      data: {
        organizationId: input.organizationId,
        slug,
        botName: input.botName,
        industry: resolvedIndustry,
        accentColor: input.accentColor ?? '#06b6d4',
        accentSecondary: null,
        chatSurfaceTint: null,
        welcomeMessage:
          input.welcomeMessage ??
          `¡Hola! Soy ${input.botName}. ¿En qué te puedo ayudar hoy?`,
        isActive: false,
        avatarStyle: 'neuro',
        avatarImageUrl: null,
        avatarEmoji: null,
        borderRadius: 'medium',
        surfaceStyle: 'glass',
        position: 'bottom_right',
        fontStyle: 'sans',
        bubbleStyle: 'rounded',
        intensityLevel: 'MEDIUM',
        tone: 'informal_rioplatense',
        quickReplies: template.quickReplies as unknown as object,
        proactivePrompts: { default: ['¿En qué puedo ayudarte?'] },
        routeColorMap: {},
        llmProvider: 'GOOGLE',
        llmModel: 'gemini-2.5-flash',
        monthlyQuota: 1000,
        whatsappNumber: input.whatsappNumber || null,
      },
    })

    await tx.knowledgeBase.create({
      data: {
        botConfigId: newBot.id,
        businessInfo: template.businessInfo,
        servicesOrProducts: template.servicesOrProducts,
        faq: template.faq,
        policies: template.policies,
        salesGuidance: template.salesGuidance,
        toneExamples: template.toneExamples,
        forbiddenStatements: template.forbiddenStatements,
      },
    })

    return newBot
  })

  await logAdminAction({
    userId: input.createdByUserId,
    userEmail: input.createdByUserEmail,
    userName: input.createdByUserName,
    actionType: 'BOT_CREATED',
    action: `Creó chatbot "${bot.botName}" para organización "${org.companyName}"`,
    targetType: 'BotConfig',
    targetId: bot.id,
    metadata: {
      slug,
      organizationId: input.organizationId,
      industry: resolvedIndustry,
    },
  })

  return bot
}
