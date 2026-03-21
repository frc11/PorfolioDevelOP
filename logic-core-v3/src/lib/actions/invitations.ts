'use server'

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { Role } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base)
  let counter = 1
  while (true) {
    const existing = await prisma.organization.findFirst({ where: { slug } })
    if (!existing) return slug
    slug = `${slugify(base)}-${counter}`
    counter++
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type InviteClientState =
  | { type: 'error'; message: string }
  | { type: 'success'; message: string }
  | null

// ─── Action ───────────────────────────────────────────────────────────────────

export async function inviteClientAction(
  _prevState: InviteClientState,
  formData: FormData
): Promise<InviteClientState> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return { type: 'error', message: 'No autorizado.' }
  }

  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const companyName = (formData.get('companyName') as string | null)?.trim() ?? ''

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return { type: 'error', message: 'Email inválido.' }
  }
  if (!name) {
    return { type: 'error', message: 'El nombre del contacto es obligatorio.' }
  }
  if (!companyName) {
    return { type: 'error', message: 'El nombre de la empresa es obligatorio.' }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { type: 'error', message: 'Ya existe un usuario con ese email.' }
  }

  const slug = await uniqueSlug(companyName)

  // Crear usuario pendiente (sin contraseña, sin email verificado)
  const user = await prisma.user.create({
    data: {
      email,
      name,
      role: Role.ORG_MEMBER,
      // password: null  → el usuario la define al aceptar la invitación
      // emailVerified: null → se activa al aceptar
    },
  })

  // Crear organización y vincular como ADMIN
  const org = await prisma.organization.create({
    data: { companyName, slug },
  })
  await prisma.orgMember.create({
    data: { userId: user.id, organizationId: org.id, role: 'ADMIN' },
  })

  // Invalidar invitaciones previas sin usar para este usuario (safety)
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiresAt },
  })

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/accept-invite?token=${token}`

  // DEV: imprimir el link en consola en lugar de enviar email real
  console.log('\n📧 [DEV] Invitation link para:', email)
  console.log(inviteUrl)
  console.log('\n')

  revalidatePath('/admin/clients')

  return {
    type: 'success',
    message: `Invitación generada para ${email}. El link fue impreso en la consola del servidor.`,
  }
}
