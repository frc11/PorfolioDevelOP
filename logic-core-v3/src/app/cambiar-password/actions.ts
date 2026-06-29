'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { auth, unstable_update } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'

// Regla de password única en todo el producto (espejo de UpdatePasswordSchema de
// Mi Cuenta): 8 caracteres + una mayúscula + un número. Client validate() y este
// Zod quedan sincronizados.
const CambiarPasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
    .regex(/[A-Z]/, 'La nueva contraseña debe incluir al menos una mayúscula.')
    .regex(/[0-9]/, 'La nueva contraseña debe incluir al menos un número.'),
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
      // SEC-AUTH-03: invalidar JWTs activos en otros dispositivos. El unstable_update
      // de abajo refresca la sessionVersion del token actual, así el user que cambia
      // su password no se desloguea en esta pestaña.
      sessionVersion: { increment: 1 },
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

  // Force JWT cookie update so middleware sees passwordResetRequired: false immediately
  await unstable_update({ user: { passwordResetRequired: false } })

  return { ok: true }
}
