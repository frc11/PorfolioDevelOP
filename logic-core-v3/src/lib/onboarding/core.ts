import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { generateTempPassword } from '@/lib/security/generate-temp-password'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { welcomeClientEmail } from '@/lib/email/templates/welcome-client'
import { getTemplate } from '@/modules/chatbot/components/admin/onboarding/kb-templates'
import type { Industry } from '@/modules/chatbot/server/admin/createClientWithBot'

const KNOWN_INDUSTRIES: Industry[] = [
  'legal', 'contable', 'medico_odontologico', 'gimnasio', 'restaurant',
  'inmobiliaria', 'concesionaria', 'distribuidora', 'constructora', 'generico',
]

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

export interface OnboardClientCoreInput {
  organizationName: string
  userEmail: string
  userName: string
  industry: string
  city: string
  whatsappNumber?: string | null
  website?: string | null
  userPhone?: string | null
  adminUserId?: string
  adminUserEmail?: string | null
  adminUserName?: string | null
}

export interface OnboardClientCoreResult {
  ok: true
  organizationId: string
  userId: string
  orgSlug: string
  emailSent: boolean
}

export async function onboardClientCore(
  input: OnboardClientCoreInput,
): Promise<OnboardClientCoreResult> {
  const resolvedIndustry: Industry = KNOWN_INDUSTRIES.includes(input.industry as Industry)
    ? (input.industry as Industry)
    : 'generico'

  const template = getTemplate(resolvedIndustry)
  const baseSlug = slugify(input.organizationName)
  const uniqueSlug = await findUniqueSlug(baseSlug)

  const existing = await prisma.user.findUnique({
    where: { email: input.userEmail },
    select: { id: true },
  })
  if (existing) throw new Error(`El email ${input.userEmail} ya está registrado en el sistema.`)

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  const created = await prisma.$transaction(
    async (tx) => {
      const org = await tx.organization.create({
        data: {
          companyName: input.organizationName,
          slug: uniqueSlug,
          siteUrl: input.website ?? null,
          onboardingCompleted: true,
        },
      })

      const clientUser = await tx.user.create({
        data: {
          email: input.userEmail,
          name: input.userName,
          phone: input.userPhone ?? null,
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
          botName: 'Asistente',
          welcomeMessage: `¡Hola! Soy el asistente virtual de ${input.organizationName}. ¿En qué te puedo ayudar hoy?`,
          isActive: true,
          accentColor: '#06b6d4',
          accentSecondary: null,
          avatarStyle: 'neuro',
          avatarImageUrl: null,
          avatarEmoji: null,
          borderRadius: 'medium',
          surfaceStyle: 'glass',
          position: 'bottom_right',
          fontStyle: 'sans',
          bubbleStyle: 'rounded',
          intensityLevel: 'medium',
          tone: 'informal_rioplatense',
          quickReplies: template.quickReplies as unknown as object,
          proactivePrompts: { default: ['¿En qué puedo ayudarte?'] },
          routeColorMap: {},
          chatSurfaceTint: null,
          llmProvider: 'google',
          llmModel: 'gemini-2.5-flash',
          monthlyQuota: 1000,
          whatsappNumber: input.whatsappNumber ?? null,
          industry: resolvedIndustry,
        },
      })

      await tx.knowledgeBase.create({
        data: {
          botConfigId: bot.id,
          businessInfo: template.businessInfo,
          servicesOrProducts: template.servicesOrProducts,
          faq: template.faq,
          policies: template.policies,
          salesGuidance: template.salesGuidance,
          toneExamples: template.toneExamples,
          forbiddenStatements: template.forbiddenStatements,
        },
      })

      return { org, bot, clientUser }
    },
    { timeout: 30000 },
  )

  if (input.adminUserId) {
    await logAdminAction({
      userId: input.adminUserId,
      userEmail: input.adminUserEmail,
      userName: input.adminUserName,
      actionType: 'CLIENT_CREATED',
      action: `Creó cliente "${created.org.companyName}" via bulk import`,
      targetType: 'Organization',
      targetId: created.org.id,
      metadata: {
        botConfigId: created.bot.id,
        orgSlug: created.org.slug,
        userId: created.clientUser.id,
        userEmail: created.clientUser.email,
        source: 'bulk_import',
      },
    })
  }

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://develop.com.ar'}/login`
  const emailContent = welcomeClientEmail({
    clientName: created.clientUser.name ?? input.userName,
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

  return {
    ok: true,
    organizationId: created.org.id,
    userId: created.clientUser.id,
    orgSlug: uniqueSlug,
    emailSent: emailResult.ok,
  }
}
