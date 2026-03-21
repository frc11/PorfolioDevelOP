'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export type ResetPasswordState =
  | { type: 'error'; message: string }
  | { type: 'success' }
  | null

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!token) {
    return { type: 'error', message: 'Token inválido o ausente.' }
  }
  if (!password || password.length < 8) {
    return { type: 'error', message: 'La contraseña debe tener al menos 8 caracteres.' }
  }
  if (password.length > 128) {
    return { type: 'error', message: 'Contraseña demasiado larga.' }
  }
  if (password !== confirm) {
    return { type: 'error', message: 'Las contraseñas no coinciden.' }
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!record) {
    return { type: 'error', message: 'Token inválido o expirado.' }
  }
  if (record.usedAt) {
    return { type: 'error', message: 'Este enlace ya fue utilizado. Solicitá uno nuevo.' }
  }
  if (record.expiresAt < new Date()) {
    return { type: 'error', message: 'El enlace expiró. Solicitá uno nuevo.' }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        password: hashedPassword,
        emailVerified: new Date(), // verificar email implícitamente al resetear
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() }, // marcar como usado (no borrar, para auditoría)
    }),
  ])

  return { type: 'success' }
}
