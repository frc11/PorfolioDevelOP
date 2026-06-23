'use server'

import { resolveOrgId } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
import { revalidateTag } from 'next/cache'

// Marca los mensajes de admin como leídos e invalida el unstable_cache del
// badge de mensajes no leídos en el layout del dashboard.
export async function markClientMessagesRead(): Promise<void> {
  const organizationId = await resolveOrgId()
  if (!organizationId) return

  await prisma.message.updateMany({
    where: { organizationId, fromAdmin: true, read: false },
    data: { read: true },
  })

  revalidateTag(`unread-messages:${organizationId}`, {})
}
