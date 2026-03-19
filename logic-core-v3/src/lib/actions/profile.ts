'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export type ProfileActionState = { ok: true } | { ok: false; error: string } | null

// ─── Update profile data ──────────────────────────────────────────────────────

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth()
  const clientId = session?.user?.clientId
  const userId = session?.user?.id
  if (!clientId || !userId) return { ok: false, error: 'Sesión inválida.' }

  const name = ((formData.get('name') as string | null) ?? '').trim()
  const companyName = ((formData.get('companyName') as string | null) ?? '').trim()
  const logoUrl = ((formData.get('logoUrl') as string | null) ?? '').trim() || null

  if (!name) return { ok: false, error: 'El nombre de contacto no puede estar vacío.' }
  if (!companyName) return { ok: false, error: 'El nombre de empresa no puede estar vacío.' }

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { name } }),
    prisma.client.update({ where: { id: clientId }, data: { companyName, logoUrl } }),
  ])

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
  return { ok: true }
}

// ─── Update password ──────────────────────────────────────────────────────────

export async function updatePasswordAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { ok: false, error: 'Sesión inválida.' }

  const currentPassword = ((formData.get('currentPassword') as string | null) ?? '').trim()
  const newPassword = ((formData.get('newPassword') as string | null) ?? '').trim()
  const confirmPassword = ((formData.get('confirmPassword') as string | null) ?? '').trim()

  if (!currentPassword) return { ok: false, error: 'Ingresá tu contraseña actual.' }
  if (!newPassword) return { ok: false, error: 'Ingresá la nueva contraseña.' }
  if (newPassword.length < 8)
    return { ok: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' }
  if (newPassword !== confirmPassword)
    return { ok: false, error: 'La nueva contraseña y la confirmación no coinciden.' }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  })
  if (!user?.password) return { ok: false, error: 'No se encontró contraseña registrada.' }

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) return { ok: false, error: 'La contraseña actual es incorrecta.' }

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

  return { ok: true }
}
