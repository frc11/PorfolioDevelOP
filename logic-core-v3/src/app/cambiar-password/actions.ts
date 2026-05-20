'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'

const CambiarPasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Debe tener letras')
    .regex(/[0-9]/, 'Debe tener números'),
})

export async function cambiarPasswordAction(input: {
  oldPassword: string
  newPassword: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'No autenticado' }
  }

  const parsed = CambiarPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? 'Datos inválidos' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  })

  if (!user || !user.password) {
    return { ok: false, error: 'Usuario sin contraseña configurada' }
  }

  const isValid = await bcrypt.compare(input.oldPassword, user.password)
  if (!isValid) {
    return { ok: false, error: 'Contraseña actual incorrecta' }
  }

  const newHash = await bcrypt.hash(input.newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newHash,
      passwordResetRequired: false,
    },
  })

  await logAdminAction({
    userId: user.id,
    actionType: 'PASSWORD_CHANGED',
    action: 'Usuario cambió su contraseña',
    targetType: 'User',
    targetId: user.id,
    metadata: { selfChange: true, wasForced: session.user.passwordResetRequired },
  })

  return { ok: true }
}
