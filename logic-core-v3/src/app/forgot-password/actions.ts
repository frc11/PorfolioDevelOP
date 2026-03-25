'use server'

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export type ForgotPasswordState =
  | { type: 'error'; message: string }
  | { type: 'success'; message: string }
  | null

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = formData.get('email') as string

  if (!email || !email.includes('@') || email.length > 254) {
    return { type: 'error', message: 'Email inválido.' }
  }

  // Siempre devolver el mismo mensaje para evitar user enumeration
  const successMsg = 'Si el email existe en el sistema, recibirás un enlace en minutos.'

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { type: 'success', message: successMsg }

  // Invalidar tokens anteriores sin usar
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  return { type: 'success', message: successMsg }
}
