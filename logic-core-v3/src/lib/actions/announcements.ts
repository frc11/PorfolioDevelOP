'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { type ActionResult } from './schemas'

/**
 * Marca como vistas TODAS las novedades vigentes visibles para el cliente de la sesión.
 * Es lo que apaga el badge "al ver" (se dispara al abrir el feed). Idempotente: se apoya
 * en el unique (announcementId, userId) + skipDuplicates, así que reabrir no duplica.
 *
 * Org-scoped por la sesión (nunca por param del cliente) y espeja el where de visibilidad
 * del feed: sólo marca novedades ALL o de la propia org — un cliente no puede crear un
 * "visto" sobre una novedad segmentada de otra org (anti-IDOR).
 */
export async function markAnnouncementsSeenAction(): Promise<ActionResult> {
  const session = await auth()
  const userId = session?.user?.id
  const organizationId = session?.user?.organizationId

  if (!userId || !organizationId) {
    return { success: false, error: 'No autorizado.' }
  }

  try {
    const now = new Date()

    const visible = await prisma.panelAnnouncement.findMany({
      where: {
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          { OR: [{ audience: 'ALL' }, { audience: 'ORG', organizationId }] },
        ],
      },
      select: { id: true },
    })

    if (visible.length > 0) {
      await prisma.panelAnnouncementRead.createMany({
        data: visible.map((announcement) => ({ announcementId: announcement.id, userId })),
        skipDuplicates: true,
      })
    }

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('markAnnouncementsSeenAction error:', error)
    return { success: false, error: 'No se pudieron marcar las novedades como vistas.' }
  }
}
