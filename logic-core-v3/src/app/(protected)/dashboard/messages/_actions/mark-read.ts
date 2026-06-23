'use server'

import { resolveOrgId } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
import { revalidatePath, revalidateTag } from 'next/cache'

// Marca los mensajes de admin como leídos e invalida el badge del sidebar.
// revalidateTag busta el data cache (unstable_cache); revalidatePath busta el
// Router Cache del layout — necesario para que router.refresh() re-renderice el
// layout (no solo el page segment) y el badge desaparezca en el mismo ciclo.
export async function markClientMessagesRead(): Promise<void> {
  const organizationId = await resolveOrgId()
  if (!organizationId) return

  await prisma.message.updateMany({
    where: { organizationId, fromAdmin: true, read: false },
    data: { read: true },
  })

  revalidateTag(`unread-messages:${organizationId}`, {})
  revalidatePath('/dashboard/messages')
}
