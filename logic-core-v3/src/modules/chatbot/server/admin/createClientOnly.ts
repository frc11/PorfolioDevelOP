'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { requireSuperAdmin } from './requireSuperAdmin'
import { generateTempPassword } from '@/lib/security/generate-temp-password'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { welcomeClientEmail } from '@/lib/email/templates/welcome-client'
import { slugify } from '@/lib/slugify'
import { normalizeWebsiteUrl, zodErrorToMessage } from '@/modules/chatbot/shared/field-normalize'

// Alta de cliente SIN chatbot: crea Organization + User admin + OrgMember.
// Espeja el bloque org+user de createClientWithBot (no se toca esa action), pero
// omite BotConfig/KnowledgeBase. Industria se omite a propósito: vive solo en
// BotConfig y un cliente sin bot no tiene dónde persistirla (decisión de producto).
const CreateClientOnlyInputSchema = z.object({
  orgName: z.string().min(2).max(100),
  city: z.string().min(2).max(60),
  websiteUrl: z.string().url().nullable(),
  userEmail: z.string().email(),
  userName: z.string().min(2).max(100),
  userPhone: z.string().optional().nullable(),
})

async function findUniqueSlug(base: string): Promise<string> {
  const safeBase = base || 'cliente'
  let candidate = safeBase
  let n = 0
  while (await prisma.organization.findUnique({ where: { slug: candidate } })) {
    n++
    candidate = `${safeBase}-${n}`
    if (n > 100) throw new Error('Cannot find unique slug')
  }
  return candidate
}

export async function createClientOnly(input: z.infer<typeof CreateClientOnlyInputSchema>) {
  const admin = await requireSuperAdmin()
  // Normaliza el dominio pelado (→ https://) antes de validar; errores de Zod a
  // mensaje legible, nunca el array crudo.
  const result = CreateClientOnlyInputSchema.safeParse({
    ...input,
    websiteUrl: normalizeWebsiteUrl(input.websiteUrl),
  })
  if (!result.success) throw new Error(zodErrorToMessage(result.error))
  const parsed = result.data

  const uniqueSlug = await findUniqueSlug(slugify(parsed.orgName))

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.userEmail },
    select: { id: true },
  })
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

    return { org, clientUser }
  }, { timeout: 30000 })

  await logAdminAction({
    userId: admin.id ?? 'unknown',
    userEmail: admin.email,
    userName: admin.name,
    actionType: 'CLIENT_CREATED',
    action: `Creó cliente "${created.org.companyName}" sin bot`,
    targetType: 'Organization',
    targetId: created.org.id,
    diff: {
      organization: { before: null, after: created.org },
    },
    metadata: {
      orgSlug: created.org.slug,
      userId: created.clientUser.id,
      userEmail: created.clientUser.email,
      withBot: false,
    },
  })

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://develop.com.ar'}/login`
  const emailContent = welcomeClientEmail({
    clientName: created.clientUser.name ?? parsed.userName,
    organizationName: created.org.companyName,
    email: created.clientUser.email,
    tempPassword,
    loginUrl,
    withBot: false,
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
    orgSlug: uniqueSlug,
    userName: created.clientUser.name ?? parsed.userName,
    userEmail: created.clientUser.email,
    orgName: created.org.companyName,
    emailSent: emailResult.ok,
  }
}
