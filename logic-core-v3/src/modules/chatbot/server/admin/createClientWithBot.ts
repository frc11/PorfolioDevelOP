'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { AVATAR_STYLE_SCHEMA } from '@/modules/chatbot/components/avatar'
import { requireSuperAdmin } from './requireSuperAdmin'
import { generateTempPassword } from '@/lib/security/generate-temp-password'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { welcomeClientEmail } from '@/lib/email/templates/welcome-client'
import { normalizeWebsiteUrl, normalizeWhatsapp, zodErrorToMessage } from '@/modules/chatbot/shared/field-normalize'

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

  // Paso 1: Usuario administrador
  userEmail: z.string().email(),
  userName: z.string().min(2).max(100),
  userPhone: z.string().optional().nullable(),

  // Paso 2: Bot identidad
  botName: z.string().min(2).max(60),
  welcomeMessage: z.string().min(10).max(500),
  tone: z.enum(['informal_rioplatense', 'formal', 'neutral']),

  // Paso 3: KB
  businessInfo: z.string().min(20),
  servicesOrProducts: z.string().min(20),
  faq: z.string().min(10),
  policies: z.string().min(10),
  salesGuidance: z.string().min(10),
  toneExamples: z.string().min(10),
  forbiddenStatements: z.string().min(10),

  // Paso 4: Apariencia
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  chatSurfaceTint: z.string().regex(/^#[0-9a-fA-F]{6}$/).nullable(),
  avatarStyle: AVATAR_STYLE_SCHEMA,
  avatarImageUrl: z.string().nullable(),
  avatarEmoji: z.string().max(8).nullable(),
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
    .replace(/[̀-ͯ]/g, '')
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
  const admin = await requireSuperAdmin()
  // Normaliza antes de validar (dominio pelado → https://, whatsapp → solo
  // dígitos) y mapea cualquier error de Zod a un mensaje legible, nunca el array crudo.
  const result = CreateClientInputSchema.safeParse({
    ...input,
    websiteUrl: normalizeWebsiteUrl(input.websiteUrl),
    whatsappNumber: normalizeWhatsapp(input.whatsappNumber),
  })
  if (!result.success) throw new Error(zodErrorToMessage(result.error))
  const parsed = result.data

  const baseSlug = slugify(parsed.orgName)
  const uniqueSlug = await findUniqueSlug(baseSlug)

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.userEmail }, select: { id: true } })
  if (existingUser) throw new Error(`El email ${parsed.userEmail} ya está registrado en el sistema.`)

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const created = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        companyName: parsed.orgName,
        slug: uniqueSlug,
        siteUrl: parsed.websiteUrl,
        onboardingCompleted: true,
      },
    })

    const clientUser = await tx.user.create({
      data: {
        email: parsed.userEmail,
        name: parsed.userName,
        phone: parsed.userPhone ?? null,
        role: 'ORG_MEMBER',
        password: passwordHash,
        passwordResetRequired: true,
        emailVerified: new Date(),
      },
    })

    await tx.orgMember.create({
      data: {
        organizationId: org.id,
        userId: clientUser.id,
        role: 'ADMIN',
      },
    })

    const bot = await tx.botConfig.create({
      data: {
        organizationId: org.id,
        slug: uniqueSlug,
        botName: parsed.botName,
        welcomeMessage: parsed.welcomeMessage,
        isActive: true,
        accentColor: parsed.accentColor,
        accentSecondary: parsed.accentSecondary,
        avatarStyle: parsed.avatarStyle,
        avatarImageUrl: parsed.avatarImageUrl,
        avatarEmoji: parsed.avatarEmoji,
        borderRadius: 'medium',
        surfaceStyle: 'glass',
        position: parsed.position,
        fontStyle: 'sans',
        bubbleStyle: 'rounded',
        intensityLevel: 'MEDIUM',
        tone: parsed.tone,
        quickReplies: parsed.quickReplies as unknown as object,
        proactivePrompts: {
          default: ['¿En qué puedo ayudarte?'],
        },
        routeColorMap: {},
        chatSurfaceTint: parsed.chatSurfaceTint,
        llmProvider: 'GOOGLE',
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

    return { org, bot, clientUser }
  }, { timeout: 30000 })

  await logAdminAction({
    userId: admin.id ?? 'unknown',
    userEmail: admin.email,
    userName: admin.name,
    actionType: 'CLIENT_CREATED',
    action: `Creó cliente "${created.org.companyName}" con bot "${created.bot.botName}"`,
    targetType: 'Organization',
    targetId: created.org.id,
    diff: {
      organization: { before: null, after: created.org },
      botConfig: { before: null, after: created.bot },
    },
    metadata: {
      botConfigId: created.bot.id,
      orgSlug: created.org.slug,
      userId: created.clientUser.id,
      userEmail: created.clientUser.email,
    },
  })

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://develop.com.ar'}/login`
  const emailContent = welcomeClientEmail({
    clientName: created.clientUser.name ?? parsed.userName,
    organizationName: created.org.companyName,
    email: created.clientUser.email,
    tempPassword,
    loginUrl,
  })

  const emailResult = await sendTransactionalEmail({
    to: { email: created.clientUser.email, name: created.clientUser.name ?? undefined },
    subject: emailContent.subject,
    htmlContent: emailContent.htmlContent,
    textContent: emailContent.textContent,
  })

  await logAdminAction({
    userId: admin.id ?? 'unknown',
    userEmail: admin.email,
    userName: admin.name,
    actionType: 'EMAIL_SENT',
    action: `Email de bienvenida ${emailResult.ok ? 'enviado' : 'fallido'} a "${created.clientUser.email}"`,
    targetType: 'User',
    targetId: created.clientUser.id,
    metadata: {
      emailType: 'welcome_client',
      success: emailResult.ok,
      messageId: emailResult.ok ? emailResult.messageId : null,
      error: emailResult.ok ? null : emailResult.error,
    },
  })

  return {
    ok: true as const,
    organizationId: created.org.id,
    userId: created.clientUser.id,
    tempPassword,
    botId: created.bot.id,
    botSlug: created.bot.slug,
    orgSlug: uniqueSlug,
    userName: created.clientUser.name ?? parsed.userName,
    userEmail: created.clientUser.email,
    orgName: created.org.companyName,
    emailSent: emailResult.ok,
  }
}
