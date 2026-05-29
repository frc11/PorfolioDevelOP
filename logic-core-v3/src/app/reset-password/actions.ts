'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ResetPasswordSchema } from '@/lib/actions/schemas'
import { applyAuthRateLimit, getClientIpHash } from '@/lib/security/auth-rate-limit'
import { logAdminAction } from '@/lib/audit-log'

export type ResetPasswordState =
  | { type: 'error'; message: string }
  | { type: 'success' }
  | null

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  // 1) Rate limit por IP — protege contra brute-force del token.
  const ipHash = await getClientIpHash()
  const ipLimit = await applyAuthRateLimit({ scope: 'resetPasswordPerIp', identifier: ipHash })
  if (!ipLimit.allowed) {
    return {
      type: 'error',
      message: `Demasiados intentos. Reintentá en ${Math.ceil(ipLimit.retryAfterSeconds / 60)} minutos.`,
    }
  }

  // 2) Validación Zod (token + password + confirm).
  const parsed = ResetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirm: formData.get('confirm'),
  })

  if (!parsed.success) {
    return {
      type: 'error',
      message: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
    }
  }

  const { token, password } = parsed.data

  // 3) Resolver token. Mensaje genérico para no distinguir "no existe" de "expirado" de "usado".
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  })

  const tokenInvalid =
    !record || record.usedAt !== null || record.expiresAt < new Date()

  if (tokenInvalid || !record) {
    return {
      type: 'error',
      message: 'Este enlace no es válido o ya expiró. Solicitá uno nuevo.',
    }
  }

  // 4) Hash de la nueva contraseña + transacción atómica.
  const hashedPassword = await bcrypt.hash(password, 12)

  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        password: hashedPassword,
        passwordResetRequired: false,
        emailVerified: new Date(),
        // SEC-AUTH-03: invalidar JWTs anteriores al reset
        sessionVersion: { increment: 1 },
      },
      select: { id: true, email: true, name: true },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])

  // 5) Audit log — sin password, sin token. Solo el evento.
  await logAdminAction({
    userId: updatedUser.id,
    userEmail: updatedUser.email,
    userName: updatedUser.name,
    actionType: 'PASSWORD_CHANGED',
    action: 'Restableció su contraseña vía enlace de recuperación',
    targetType: 'User',
    targetId: updatedUser.id,
    metadata: { method: 'reset_token' },
  })

  return { type: 'success' }
}
