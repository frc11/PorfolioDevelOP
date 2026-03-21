'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AcceptInviteState =
  | { type: 'error'; message: string }
  | { type: 'success' }
  | null

// ─── Action ───────────────────────────────────────────────────────────────────

export async function acceptInviteAction(
  _prevState: AcceptInviteState,
  formData: FormData
): Promise<AcceptInviteState> {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!token) {
    return { type: 'error', message: 'Token de invitación inválido o ausente.' }
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
    include: { user: { select: { id: true, password: true, email: true } } },
  })

  if (!record) {
    return { type: 'error', message: 'Invitación inválida o expirada.' }
  }
  if (record.usedAt) {
    return {
      type: 'error',
      message: 'Esta invitación ya fue utilizada. Iniciá sesión normalmente.',
    }
  }
  if (record.expiresAt < new Date()) {
    return {
      type: 'error',
      message: 'La invitación expiró. Contactá al equipo develOP para obtener una nueva.',
    }
  }
  // Safety: solo aceptar invitaciones (usuarios sin contraseña)
  // Si el usuario ya tiene contraseña, este enlace no es una invitación válida
  if (record.user.password !== null) {
    return {
      type: 'error',
      message: 'Este enlace no corresponde a una invitación válida.',
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        password: hashedPassword,
        emailVerified: new Date(), // activar cuenta al aceptar invitación
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() }, // marcar como usado (no borrar, para auditoría)
    }),
  ])

  return { type: 'success' }
}
