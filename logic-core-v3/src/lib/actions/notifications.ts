'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Notification } from '@prisma/client'
import { type ActionResult, NotificationIdSchema } from './schemas'

// Tope de filas para el historial completo del panel de notificaciones.
// Son system-generated y sin archivado → un fetch capeado alcanza; si algún
// org acumulara miles, se revisita con paginación.
const NOTIFICATION_HISTORY_LIMIT = 200

function revalidateAll() {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard')
}

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const session = await auth()
  const organizationId = session?.user?.organizationId

  if (!organizationId) {
    return { success: false, error: 'No autorizado.' }
  }

  const parsed = NotificationIdSchema.safeParse({ id })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    await prisma.notification.updateMany({
      where: { id: parsed.data.id, organizationId },
      data: { read: true },
    })

    revalidateAll()
    return { success: true }
  } catch (error) {
    console.error('markNotificationReadAction error:', error)
    return { success: false, error: 'No se pudo marcar la notificación como leída.' }
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await auth()
  const organizationId = session?.user?.organizationId

  if (!organizationId) {
    return { success: false, error: 'No autorizado.' }
  }

  try {
    await prisma.notification.updateMany({
      where: { organizationId, read: false },
      data: { read: true },
    })

    revalidateAll()
    return { success: true }
  } catch (error) {
    console.error('markAllNotificationsReadAction error:', error)
    return { success: false, error: 'No se pudieron marcar todas las notificaciones.' }
  }
}

/**
 * Historial completo de notificaciones del cliente, scopeado a la organización
 * de la SESIÓN (nunca por param del cliente). Read-only → sin revalidate.
 * Cubierto por @@index([organizationId, createdAt(sort: Desc)]) en schema.prisma.
 */
export async function getMyNotificationsAction(): Promise<ActionResult<Notification[]>> {
  const session = await auth()
  const organizationId = session?.user?.organizationId

  if (!organizationId) {
    return { success: false, error: 'No autorizado.' }
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: NOTIFICATION_HISTORY_LIMIT,
    })

    return { success: true, data: notifications }
  } catch (error) {
    console.error('getMyNotificationsAction error:', error)
    return { success: false, error: 'No se pudieron cargar las notificaciones.' }
  }
}
