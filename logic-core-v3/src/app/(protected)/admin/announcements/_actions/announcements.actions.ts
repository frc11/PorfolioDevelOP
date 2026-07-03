'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { ok, fail, toErrorMessage, type ActionResult } from '@/lib/action-utils'
import { CreateAnnouncementSchema, type CreateAnnouncementInput } from './announcements.schemas'

/**
 * Publica una novedad del panel. Admin-only (requireSuperAdmin — verificación de rol en
 * la action, no solo en el layout). ALL = broadcast (sin org); ORG = segmentada a una org
 * existente. Cero migraciones (el schema ya existe).
 */
export async function createAnnouncementAction(
  input: CreateAnnouncementInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = CreateAnnouncementSchema.parse(input)

    // ALL nunca lleva organizationId; ORG exige una org existente.
    let organizationId: string | null = null
    if (parsed.audience === 'ORG') {
      if (!parsed.organizationId) return fail('Elegí la organización para una novedad segmentada.')
      const org = await prisma.organization.findUnique({
        where: { id: parsed.organizationId },
        select: { id: true },
      })
      if (!org) return fail('La organización elegida no existe.')
      organizationId = org.id
    }

    // yyyy-mm-dd → fin del día (inclusivo). '' / ausente = sin caducidad.
    let expiresAt: Date | null = null
    if (parsed.expiresOn) {
      const candidate = new Date(`${parsed.expiresOn}T23:59:59.999Z`)
      if (Number.isNaN(candidate.getTime())) return fail('Fecha de caducidad inválida.')
      expiresAt = candidate
    }

    const created = await prisma.panelAnnouncement.create({
      data: {
        title: parsed.title,
        body: parsed.body,
        audience: parsed.audience,
        organizationId,
        expiresAt,
      },
      select: { id: true },
    })

    revalidatePath('/admin/announcements')
    revalidatePath('/dashboard')
    return ok({ id: created.id })
  } catch (error) {
    return fail(toErrorMessage(error, 'No se pudo publicar la novedad.'))
  }
}

/**
 * Retira una novedad. deleteMany (no explota si ya no existe); las lecturas asociadas se
 * borran en cascada (onDelete: Cascade). Admin-only.
 */
export async function deleteAnnouncementAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    if (!id?.trim()) return fail('Novedad inválida.')

    await prisma.panelAnnouncement.deleteMany({ where: { id } })

    revalidatePath('/admin/announcements')
    revalidatePath('/dashboard')
    return ok({ id })
  } catch (error) {
    return fail(toErrorMessage(error, 'No se pudo retirar la novedad.'))
  }
}
