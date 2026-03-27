'use server'

import crypto from 'crypto'
import * as React from 'react'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export type ForgotPasswordState =
  | { type: 'error'; message: string }
  | { type: 'success'; message: string }
  | null

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

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

  await sendEmail({
    to: user.email,
    subject: 'Restablecé tu contraseña de develOP',
    react: React.createElement(
      'div',
      {
        style: {
          fontFamily: 'Arial, sans-serif',
          color: '#111827',
          lineHeight: 1.6,
        },
      },
      React.createElement('h1', { style: { fontSize: '20px' } }, 'Restablecer contraseña'),
      React.createElement(
        'p',
        null,
        'Recibimos una solicitud para cambiar la contraseña de tu cuenta en develOP.'
      ),
      React.createElement(
        'p',
        null,
        React.createElement(
          'a',
          {
            href: resetUrl,
            style: {
              display: 'inline-block',
              padding: '12px 18px',
              background: '#06b6d4',
              color: '#ffffff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
            },
          },
          'Crear nueva contraseña'
        )
      ),
      React.createElement(
        'p',
        { style: { fontSize: '12px', color: '#6b7280' } },
        'Este enlace vence en 1 hora. Si no lo pediste, podés ignorar este mensaje.'
      )
    ),
  })

  console.log(`[auth] Reset password para ${user.email}: ${resetUrl}`)

  return { type: 'success', message: successMsg }
}
