'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { type ActionResult, NotificationIdSchema } from './schemas'

function revalidateAll() {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/notificaciones')
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
