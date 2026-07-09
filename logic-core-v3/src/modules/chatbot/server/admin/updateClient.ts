'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { unsafeGlobalQuery } from '@/lib/isolation'
import { logAdminAction } from '@/lib/audit-log'
import { requireSuperAdmin } from './requireSuperAdmin'
import { avatarImageUrlSchema } from './avatarImageUrlSchema'
import { normalizeWebsiteUrl, zodErrorToMessage } from '@/modules/chatbot/shared/field-normalize'

// Edición de los datos de un cliente existente: Organization (companyName,
// city, internalNotes, avatar, siteUrl) + User administrador (email, name,
// phone). NO toca el bot ni la industria (se editan en la config del bot).
const UpdateClientInputSchema = z.object({
  organizationId: z.string().min(1),
  orgName: z.string().min(2).max(100),
  city: z.string().min(2).max(60).nullable(),
  internalNotes: z.string().max(5000).nullable(),
  avatarImageUrl: avatarImageUrlSchema,
  avatarEmoji: z.string().trim().max(8).nullable(),
  avatarInitials: z.string().trim().max(2).nullable(),
  websiteUrl: z.string().url().nullable(),
  userEmail: z.string().email(),
  userName: z.string().min(2).max(100),
  userPhone: z.string().optional().nullable(),
})

export async function updateClient(input: z.infer<typeof UpdateClientInputSchema>) {
  const admin = await requireSuperAdmin()

  // Normaliza (dominio pelado → https://) antes de validar; ZodError → mensaje
  // legible, nunca el array crudo.
  const result = UpdateClientInputSchema.safeParse({
    ...input,
    websiteUrl: normalizeWebsiteUrl(input.websiteUrl),
  })
  if (!result.success) throw new Error(zodErrorToMessage(result.error))
  const parsed = result.data

  // TENANT-MGMT: Organization + User admin (tenant raíz y su dueño, no cubiertos
  // por el helper) — edición de datos del cliente por super-admin.
  const org = await unsafeGlobalQuery(
    'TENANT-MGMT: lectura de org + user admin para editar datos del cliente (super-admin)',
    (c) =>
      c.organization.findUnique({
        where: { id: parsed.organizationId },
        select: {
          id: true,
          companyName: true,
          city: true,
          internalNotes: true,
          avatarImageUrl: true,
          avatarEmoji: true,
          avatarInitials: true,
          siteUrl: true,
          members: {
            where: { role: 'ADMIN' },
            orderBy: { joinedAt: 'asc' },
            take: 1,
            select: { user: { select: { id: true, email: true, name: true, phone: true } } },
          },
        },
      }),
  )
  if (!org) throw new Error('Cliente no encontrado.')

  const adminUser = org.members[0]?.user ?? null
  if (!adminUser) throw new Error('Este cliente no tiene un usuario administrador para editar.')

  // Email único: si cambia, no debe pisar el de otro usuario (User.email es @unique).
  const nextEmail = parsed.userEmail.toLowerCase()
  if (nextEmail !== adminUser.email.toLowerCase()) {
    const clash = await unsafeGlobalQuery(
      'TENANT-MGMT: chequeo de unicidad global de email de usuario (User.email @unique)',
      (c) => c.user.findUnique({ where: { email: nextEmail }, select: { id: true } }),
    )
    if (clash && clash.id !== adminUser.id) {
      throw new Error(`El email ${nextEmail} ya está registrado en otro usuario.`)
    }
  }

  const updated = await unsafeGlobalQuery(
    'TENANT-MGMT: tx de update de org + user admin del cliente (super-admin)',
    (client) => client.$transaction(async (tx) => {
    const nextOrg = await tx.organization.update({
      where: { id: org.id },
      data: {
        companyName: parsed.orgName,
        city: parsed.city,
        internalNotes: parsed.internalNotes,
        avatarImageUrl: parsed.avatarImageUrl,
        avatarEmoji: parsed.avatarEmoji,
        avatarInitials: parsed.avatarInitials,
        siteUrl: parsed.websiteUrl,
      },
      select: {
        id: true,
        companyName: true,
        city: true,
        internalNotes: true,
        avatarImageUrl: true,
        avatarEmoji: true,
        avatarInitials: true,
        siteUrl: true,
      },
    })
    const nextUser = await tx.user.update({
      where: { id: adminUser.id },
      data: {
        email: nextEmail,
        name: parsed.userName,
        phone: parsed.userPhone ?? null,
      },
      select: { id: true, email: true, name: true, phone: true },
    })
    return { nextOrg, nextUser }
    }, { timeout: 30000 }),
  )

  await logAdminAction({
    userId: admin.id ?? 'unknown',
    userEmail: admin.email,
    userName: admin.name,
    actionType: 'CLIENT_UPDATED',
    action: `Actualizó los datos del cliente "${updated.nextOrg.companyName}"`,
    targetType: 'Organization',
    targetId: org.id,
    diff: {
      companyName: { before: org.companyName, after: updated.nextOrg.companyName },
      city: { before: org.city, after: updated.nextOrg.city },
      internalNotes: { before: org.internalNotes, after: updated.nextOrg.internalNotes },
      // La imagen es un data URL base64 pesado: se loguea solo presencia, no el blob.
      avatarImageUrl: {
        before: org.avatarImageUrl ? '[imagen]' : null,
        after: updated.nextOrg.avatarImageUrl ? '[imagen]' : null,
      },
      avatarEmoji: { before: org.avatarEmoji, after: updated.nextOrg.avatarEmoji },
      avatarInitials: { before: org.avatarInitials, after: updated.nextOrg.avatarInitials },
      siteUrl: { before: org.siteUrl, after: updated.nextOrg.siteUrl },
      userEmail: { before: adminUser.email, after: updated.nextUser.email },
      userName: { before: adminUser.name, after: updated.nextUser.name },
      userPhone: { before: adminUser.phone, after: updated.nextUser.phone },
    },
    metadata: { userId: adminUser.id },
  })

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${org.id}`)

  return {
    ok: true as const,
    organizationId: org.id,
  }
}
