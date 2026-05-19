import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { generateTempPassword } from '@/lib/security/generate-temp-password'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { welcomeClientEmail } from '@/lib/email/templates/welcome-client'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await params

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

  const tempPassword = generateTempPassword()
  const passwordHash = await bcrypt.hash(tempPassword, 10)

  await prisma.user.update({
    where: { id: userId },
    data: { password: passwordHash, passwordResetRequired: true },
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

  await logAdminAction({
    userId: session.user.id ?? 'unknown',
    userEmail: session.user.email,
    userName: session.user.name,
    actionType: 'CREDENTIALS_RESENT',
    action: `Reenvió credenciales a "${user.email}"`,
    targetType: 'User',
    targetId: userId,
    metadata: { emailSent: emailResult.ok, error: emailResult.ok ? null : emailResult.error },
  })

  return NextResponse.json({
    ok: true,
    emailSent: emailResult.ok,
    tempPassword: emailResult.ok ? null : tempPassword,
  })
}
