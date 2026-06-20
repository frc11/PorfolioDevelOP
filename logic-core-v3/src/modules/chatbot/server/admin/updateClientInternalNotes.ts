'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit-log'
import { requireSuperAdmin } from './requireSuperAdmin'

// Edición INLINE de las notas internas desde el tab Overview. A diferencia de
// updateClient, toca SOLO internalNotes del Organization (no el User admin ni
// otros campos) — por eso es una action dedicada y no se enruta por updateClient.
const UpdateInternalNotesSchema = z.object({
  organizationId: z.string().min(1),
  internalNotes: z.string().max(5000).nullable(),
})

export async function updateClientInternalNotes(
  input: z.infer<typeof UpdateInternalNotesSchema>,
) {
  const admin = await requireSuperAdmin()

  const result = UpdateInternalNotesSchema.safeParse(input)
  if (!result.success) throw new Error('Datos inválidos para las notas internas.')
  const { organizationId, internalNotes } = result.data
  const nextNotes = internalNotes && internalNotes.trim() !== '' ? internalNotes : null

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, companyName: true, internalNotes: true },
  })
  if (!org) throw new Error('Cliente no encontrado.')

  await prisma.organization.update({
    where: { id: org.id },
    data: { internalNotes: nextNotes },
  })

  await logAdminAction({
    userId: admin.id ?? 'unknown',
    userEmail: admin.email,
    userName: admin.name,
    actionType: 'CLIENT_UPDATED',
    action: `Actualizó las notas internas de "${org.companyName}"`,
    targetType: 'Organization',
    targetId: org.id,
    diff: {
      internalNotes: { before: org.internalNotes, after: nextNotes },
    },
    metadata: { field: 'internalNotes' },
  })

  revalidatePath(`/admin/clients/${org.id}`)

  return { ok: true as const, internalNotes: nextNotes }
}
