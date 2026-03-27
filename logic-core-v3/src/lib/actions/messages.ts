'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── Admin: Send ──────────────────────────────────────────────────────────────

export async function sendMessageAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const organizationId = (formData.get('organizationId') as string | null) ?? ''
  const content = ((formData.get('content') as string | null) ?? '').trim()

  if (!organizationId) return 'Cliente no especificado.'
  if (!content) return 'El mensaje no puede estar vacío.'

  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org) return 'Cliente no encontrado.'

  try {
    await prisma.message.create({
      data: { organizationId, content, fromAdmin: true },
    })
  } catch {
    return 'Error al enviar el mensaje. Intentá de nuevo.'
  }

  revalidatePath(`/admin/messages/${organizationId}`)
  revalidatePath('/admin/messages')
  revalidatePath('/admin')
  return null
}

// ─── Mark as read ─────────────────────────────────────────────────────────────

export async function markMessagesAsReadAction(organizationId: string): Promise<void> {
  if (!organizationId) return

  await prisma.message.updateMany({
    where: { organizationId, fromAdmin: false, read: false },
    data: { read: true },
  })

  revalidatePath(`/admin/messages/${organizationId}`)
  revalidatePath('/admin/messages')
  revalidatePath('/admin')
}

// ─── Client: Send ─────────────────────────────────────────────────────────────

export async function sendClientMessageAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  const userId = session?.user?.id
  if (!organizationId || !userId) return 'Sesión inválida.'

  const content = ((formData.get('content') as string | null) ?? '').trim()
  if (!content) return 'El mensaje no puede estar vacío.'

  await prisma.message.create({
    data: { organizationId, content, fromAdmin: false },
  })

  // Notify SUPER_ADMIN — non-blocking
  try {
    const [org, superAdmin] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { companyName: true },
      }),
      prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true },
      }),
    ])

    if (superAdmin && org) {
      await prisma.notification.create({
        data: {
          type: 'INFO',
          title: `Nuevo mensaje de ${org.companyName}`,
          message: content.length > 80 ? content.slice(0, 80) + '…' : content,
          userId: superAdmin.id,
          actionUrl: `/admin/messages/${organizationId}`,
        },
      })
    }
  } catch {
    // non-critical
  }

  revalidatePath('/dashboard/messages')
  revalidatePath(`/admin/messages/${organizationId}`)
  revalidatePath('/admin/messages')
  return null
}
