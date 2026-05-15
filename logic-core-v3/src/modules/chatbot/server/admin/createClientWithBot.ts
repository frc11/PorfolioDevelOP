'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const INDUSTRIES = [
  'legal', 'contable', 'medico_odontologico', 'gimnasio', 'restaurant',
  'inmobiliaria', 'concesionaria', 'distribuidora', 'constructora', 'generico',
] as const

export type Industry = typeof INDUSTRIES[number]

const CreateClientInputSchema = z.object({
  // Paso 1: Empresa
  orgName: z.string().min(2).max(100),
  industry: z.enum(INDUSTRIES),
  city: z.string().min(2).max(60),
  websiteUrl: z.string().url().nullable(),

  // Paso 2: Bot identidad
  botName: z.string().min(2).max(60),
  welcomeMessage: z.string().min(10).max(500),
  tone: z.enum(['informal_rioplatense', 'formal', 'neutral']),

  // Paso 3: KB (en parte 1 usamos placeholders, en parte 2 vendrán de templates)
  businessInfo: z.string().min(20),
  servicesOrProducts: z.string().min(20),
  faq: z.string().min(10),
  policies: z.string().min(10),
  salesGuidance: z.string().min(10),
  toneExamples: z.string().min(10),
  forbiddenStatements: z.string().min(10),

  // Paso 4: Apariencia
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  avatarStyle: z.enum(['neuro', 'legacy_neuro', 'image', 'emoji']),
  position: z.enum(['bottom_right', 'bottom_left']),
  quickReplies: z.array(z.object({
    id: z.string(),
    label: z.string().min(1).max(40),
    prompt: z.string().min(1).max(200),
  })).max(6),

  // Operativo
  whatsappNumber: z.string().regex(/^\d{10,15}$/).nullable(),
})

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}

async function findUniqueSlug(base: string): Promise<string> {
  let candidate = base
  let n = 0
  while (await prisma.organization.findUnique({ where: { slug: candidate } })) {
    n++
    candidate = `${base}-${n}`
    if (n > 100) throw new Error('Cannot find unique slug')
  }
  return candidate
}

export async function createClientWithBot(input: z.infer<typeof CreateClientInputSchema>) {
  const parsed = CreateClientInputSchema.parse(input)

  const baseSlug = slugify(parsed.orgName)
  const uniqueSlug = await findUniqueSlug(baseSlug)

  // Transacción: crear todo en un solo commit
  await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        companyName: parsed.orgName,
        slug: uniqueSlug,
        siteUrl: parsed.websiteUrl,
      },
    })

    const bot = await tx.botConfig.create({
      data: {
        organizationId: org.id,
        slug: uniqueSlug,  // mismo slug para el bot
        botName: parsed.botName,
        welcomeMessage: parsed.welcomeMessage,
        isActive: true,
        accentColor: parsed.accentColor,
        accentSecondary: null,
        avatarStyle: parsed.avatarStyle,
        avatarImageUrl: null,
        avatarEmoji: null,
        borderRadius: 'medium',
        surfaceStyle: 'glass',
        position: parsed.position,
        fontStyle: 'sans',
        bubbleStyle: 'rounded',
        intensityLevel: 'medium',
        tone: parsed.tone,
        quickReplies: parsed.quickReplies as unknown as object, // Prisma JSON compatibility
        proactivePrompts: {
          default: ['¿En qué puedo ayudarte?'],
        },
        routeColorMap: {},
        chatSurfaceTint: null,
        llmProvider: 'google',
        llmModel: 'gemini-2.5-flash',
        monthlyQuota: 1000,
        whatsappNumber: parsed.whatsappNumber,
        industry: parsed.industry,
      },
    })

    await tx.knowledgeBase.create({
      data: {
        botConfigId: bot.id,
        businessInfo: parsed.businessInfo,
        servicesOrProducts: parsed.servicesOrProducts,
        faq: parsed.faq,
        policies: parsed.policies,
        salesGuidance: parsed.salesGuidance,
        toneExamples: parsed.toneExamples,
        forbiddenStatements: parsed.forbiddenStatements,
      },
    })
  })

  redirect(`/admin/clients/${uniqueSlug}/chatbot/overview`)
}
