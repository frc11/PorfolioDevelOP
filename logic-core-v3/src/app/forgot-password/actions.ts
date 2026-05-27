'use server'

import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ForgotPasswordSchema } from '@/lib/actions/schemas'
import { sendTransactionalEmail } from '@/lib/email/brevo-service'
import { passwordResetEmail } from '@/lib/email/templates/password-reset'
import { applyAuthRateLimit, getClientIpHash } from '@/lib/security/auth-rate-limit'

export type ForgotPasswordState =
  | { type: 'error'; message: string }
  | { type: 'success'; message: string }
  | null

const TOKEN_EXPIRES_MINUTES = 45
const ANTI_ENUM_MESSAGE =
  'Si la cuenta existe, te mandamos un mail con instrucciones en los próximos minutos.'

// Hash dummy precomputado para igualar el costo cuando el usuario NO existe.
// Mitiga timing attack: bcrypt.compare contra un hash con el mismo cost (10).
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8/8DqWlqaA5jE0n6Z9Vp.NwcAk7Bru'

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  // 1) Validación Zod
  const parsed = ForgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return {
      type: 'error',
      message: parsed.error.issues[0]?.message ?? 'Email inválido.',
    }
  }

  const email = parsed.data.email

  // 2) Rate limit por IP — protege el endpoint completo
  const ipHash = await getClientIpHash()
  const ipLimit = applyAuthRateLimit({ scope: 'forgotPasswordPerIp', identifier: ipHash })
  if (!ipLimit.allowed) {
    // Mensaje idéntico al éxito: no revelamos el rate-limit (anti-enum / anti-recon).
    return { type: 'success', message: ANTI_ENUM_MESSAGE }
  }

  // 3) Rate limit por email — protege un inbox específico de ser inundado.
  const emailLimit = applyAuthRateLimit({
    scope: 'forgotPasswordPerEmail',
    identifier: email,
  })
  if (!emailLimit.allowed) {
    return { type: 'success', message: ANTI_ENUM_MESSAGE }
  }

  // 4) Resolver usuario
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  })

  // 5) Mitigación timing-attack: si el usuario no existe ejecutamos trabajo
  //    equivalente al hash que correría si existiera (cost 10, ~80ms).
  if (!user) {
    await bcrypt.compare(email, DUMMY_HASH)
    return { type: 'success', message: ANTI_ENUM_MESSAGE }
  }

  // 6) Invalidar tokens previos sin usar + crear uno nuevo (un-solo-uso, expiración corta).
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRES_MINUTES * 60_000)

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    }),
    prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    }),
  ])

  // 7) Email transaccional vía Brevo (mismo provider que welcome / resend-credentials).
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  const content = passwordResetEmail({
    clientName: user.name ?? 'Hola',
    resetUrl,
    expiresInMinutes: TOKEN_EXPIRES_MINUTES,
  })

  const result = await sendTransactionalEmail({
    to: { email: user.email, name: user.name ?? undefined },
    subject: content.subject,
    htmlContent: content.htmlContent,
    textContent: content.textContent,
  })

  // No logueamos el token ni el email en limpio. Sólo el outcome.
  if (!result.ok) {
    console.error('[forgot-password] email send failed', { reason: result.error })
  }

  // 8) Respuesta idéntica al caso "usuario no existe".
  return { type: 'success', message: ANTI_ENUM_MESSAGE }
}
