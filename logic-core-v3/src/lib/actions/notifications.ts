'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

function revalidateAll() {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/notificaciones')
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  if (!organizationId) throw new Error('Unauthorized')

  await prisma.notification.updateMany({
    where: { id, organizationId },
    data: { read: true },
  })

  revalidateAll()
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  if (!organizationId) throw new Error('Unauthorized')

  await prisma.notification.updateMany({
    where: { organizationId, read: false },
    data: { read: true },
  })

  revalidateAll()
}
