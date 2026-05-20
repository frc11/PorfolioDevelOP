'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/audit-log'

export async function toggleBotActiveAction(
  botId: string,
  newActive: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth()
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return { ok: false, error: 'Forbidden' }
  }
  const userId = session.user.id
  if (!userId) return { ok: false, error: 'Forbidden' }

  try {
    await prisma.botConfig.update({
      where: { id: botId },
      data: { isActive: newActive },
    })

    await logAdminAction({
      userId,
      userEmail: session.user.email,
      userName: session.user.name,
      actionType: newActive ? 'BOT_ACTIVATED' : 'BOT_DEACTIVATED',
      action: `${newActive ? 'Activó' : 'Pausó'} bot ${botId} desde la página de detalle`,
      targetType: 'BotConfig',
      targetId: botId,
      metadata: { source: 'detail_page' },
    })

    revalidatePath(`/admin/chatbots/${botId}`)
    revalidatePath('/admin/chatbots')

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'unknown',
    }
  }
}
