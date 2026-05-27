import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { generateTempPassword } from '@/lib/security/generate-temp-password'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { welcomeClientEmail } from '@/lib/email/templates/welcome-client'
import { ResendCredentialsParamsSchema } from '@/lib/actions/schemas'
import { applyAuthRateLimit } from '@/lib/security/auth-rate-limit'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminId = session.user.id ?? 'unknown'

  // Rate limit por admin: protege contra spam involuntario (UI con doble click)
  // y abuso de cuenta admin comprometida.
  const adminLimit = await applyAuthRateLimit({
    scope: 'resendCredentialsPerAdmin',
    identifier: adminId,
  })
  if (!adminLimit.allowed) {
    return NextResponse.json(
      {
        error: 'TOO_MANY_REQUESTS',
        retryAfterSeconds: adminLimit.retryAfterSeconds,
      },
      { status: 429 },
    )
  }

  const rawParams = await params
  const parsed = ResendCredentialsParamsSchema.safeParse(rawParams)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
  }
  const { userId } = parsed.data

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orgMemberships: {
        include: { organization: { select: { companyName: true } } },
        take: 1,
      },
    },
  })

  if (!user || !user.email) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Generamos temp password en memoria. NUNCA se loguea ni se guarda en audit metadata.
  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: passwordHash,
      passwordResetRequired: true,
      // SEC-AUTH-03: invalidar sesiones activas del usuario target — la temp password
      // anterior queda inservible y los JWTs viejos también.
      sessionVersion: { increment: 1 },
    },
  })

  const orgName = user.orgMemberships[0]?.organization.companyName ?? 'tu cuenta'
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://develop.com.ar'}/login`
  const emailContent = welcomeClientEmail({
    clientName: user.name ?? user.email,
    organizationName: orgName,
    email: user.email,
    tempPassword,
    loginUrl,
  })

  const emailResult = await sendTransactionalEmail({
    to: { email: user.email, name: user.name ?? undefined },
    subject: emailContent.subject,
    htmlContent: emailContent.htmlContent,
    textContent: emailContent.textContent,
  })

  // Audit log: NO incluimos tempPassword en metadata. Sólo el outcome del envío.
  await logAdminAction({
    userId: adminId,
    userEmail: session.user.email,
    userName: session.user.name,
    actionType: 'CREDENTIALS_RESENT',
    action: `Reenvió credenciales a "${user.email}"`,
    targetType: 'User',
    targetId: userId,
    metadata: {
      emailSent: emailResult.ok,
      error: emailResult.ok ? null : emailResult.error,
    },
  })

  // Si Brevo falla, devolvemos tempPassword al admin como fallback (UI lo muestra
  // para copiar y enviar por otro canal). Si el envío fue OK no lo retornamos.
  return NextResponse.json({
    ok: true,
    emailSent: emailResult.ok,
    tempPassword: emailResult.ok ? null : tempPassword,
  })
}
