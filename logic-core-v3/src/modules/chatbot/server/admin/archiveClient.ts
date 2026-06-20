'use server'

import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { requireSuperAdmin } from './requireSuperAdmin'

// Archivar = soft-delete REVERSIBLE. Marca SOLO el Organization (deletedAt); NO
// toca lo que cuelga (bot, proyectos, tickets, leads, suscripción), que siguen
// vivos e intactos. Desarchivar revierte (deletedAt = null).
const ArchiveClientInputSchema = z.object({
  organizationId: z.string().min(1),
})

export async function archiveClient(input: z.infer<typeof ArchiveClientInputSchema>) {
  const admin = await requireSuperAdmin()

  const result = ArchiveClientInputSchema.safeParse(input)
  if (!result.success) throw new Error('Datos inválidos para archivar el cliente.')
  const { organizationId } = result.data

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, companyName: true, deletedAt: true },
  })
  if (!org) throw new Error('Cliente no encontrado.')
  if (org.deletedAt) throw new Error('El cliente ya está archivado.')

  await prisma.organization.update({
    where: { id: org.id },
    data: { deletedAt: new Date() },
  })

  await logAdminAction({
    userId: admin.id ?? 'unknown',
    userEmail: admin.email,
    userName: admin.name,
    actionType: 'CLIENT_UPDATED',
    action: `Archivó (soft-delete reversible) el cliente "${org.companyName}"`,
    targetType: 'Organization',
    targetId: org.id,
    metadata: { archived: true },
  })

  revalidateTag('admin-clients', {})
  revalidatePath('/admin/clients')

  return { ok: true as const, organizationId: org.id }
}

export async function unarchiveClient(input: z.infer<typeof ArchiveClientInputSchema>) {
  const admin = await requireSuperAdmin()

  const result = ArchiveClientInputSchema.safeParse(input)
  if (!result.success) throw new Error('Datos inválidos para desarchivar el cliente.')
  const { organizationId } = result.data

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, companyName: true, deletedAt: true },
  })
  if (!org) throw new Error('Cliente no encontrado.')
  if (!org.deletedAt) throw new Error('El cliente no está archivado.')

  await prisma.organization.update({
    where: { id: org.id },
    data: { deletedAt: null },
  })

  await logAdminAction({
    userId: admin.id ?? 'unknown',
    userEmail: admin.email,
    userName: admin.name,
    actionType: 'CLIENT_UPDATED',
    action: `Desarchivó el cliente "${org.companyName}"`,
    targetType: 'Organization',
    targetId: org.id,
    metadata: { archived: false },
  })

  revalidateTag('admin-clients', {})
  revalidatePath('/admin/clients')

  return { ok: true as const, organizationId: org.id }
}
