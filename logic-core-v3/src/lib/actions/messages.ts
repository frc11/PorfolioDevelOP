'use server'

import { auth } from '@/auth'
import { sendAgencyAlert } from '@/lib/alerts'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  type ActionResult,
  OrganizationIdSchema,
  SendMessageSchema,
} from './schemas'

type MessageActionResult = ActionResult

export async function sendMessageAction(
  _prevState: MessageActionResult | null,
  formData: FormData
): Promise<MessageActionResult> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'No autorizado.' }
  }

  const parsedOrganization = OrganizationIdSchema.safeParse({
    organizationId: formData.get('organizationId'),
  })
  if (!parsedOrganization.success) {
    return { success: false, error: parsedOrganization.error.issues[0]?.message }
  }

  const parsedMessage = SendMessageSchema.safeParse({
    content: formData.get('content'),
  })
  if (!parsedMessage.success) {
    return { success: false, error: parsedMessage.error.issues[0]?.message }
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id: parsedOrganization.data.organizationId },
      select: { id: true },
    })

    if (!org) {
      return { success: false, error: 'Cliente no encontrado.' }
    }

    await prisma.message.create({
      data: {
        organizationId: parsedOrganization.data.organizationId,
        content: parsedMessage.data.content,
        fromAdmin: true,
      },
    })

    revalidatePath(`/admin/messages/${parsedOrganization.data.organizationId}`)
    revalidatePath('/admin/messages')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('sendMessageAction error:', error)
    return { success: false, error: 'Error al enviar el mensaje. Intentá de nuevo.' }
  }
}

export async function markAdminMessagesAsReadAction(
  organizationId: string
): Promise<MessageActionResult> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'No autorizado.' }
  }

  const parsed = OrganizationIdSchema.safeParse({ organizationId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    await prisma.message.updateMany({
      where: {
        organizationId: parsed.data.organizationId,
        fromAdmin: false,
        read: false,
      },
      data: { read: true },
    })

    revalidatePath(`/admin/messages/${parsed.data.organizationId}`)
    revalidatePath('/admin/messages')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('markAdminMessagesAsReadAction error:', error)
    return { success: false, error: 'No se pudieron marcar los mensajes como leídos.' }
  }
}

export async function markMessagesAsReadAction(
  organizationId: string
): Promise<MessageActionResult> {
  return markAdminMessagesAsReadAction(organizationId)
}

export async function sendClientMessageAction(
  _prevState: MessageActionResult | null,
  formData: FormData
): Promise<MessageActionResult> {
  const session = await auth()
  const organizationId = session?.user?.organizationId
  const userId = session?.user?.id

  if (!organizationId || !userId) {
    return { success: false, error: 'Sesión inválida.' }
  }

  const parsedMessage = SendMessageSchema.safeParse({
    content: formData.get('content'),
  })
  if (!parsedMessage.success) {
    return { success: false, error: parsedMessage.error.issues[0]?.message }
  }

  try {
    await prisma.message.create({
      data: {
        organizationId,
        content: parsedMessage.data.content,
        fromAdmin: false,
      },
    })

    try {
      const [org, settings] = await Promise.all([
        prisma.organization.findUnique({
          where: { id: organizationId },
          select: { companyName: true },
        }),
        prisma.agencySettings.findFirst({
          orderBy: { updatedAt: 'desc' },
          select: { alertOnClientMessages: true },
        }),
      ])

      if (settings?.alertOnClientMessages && org) {
        sendAgencyAlert({
          type: 'MESSAGE_NEW',
          clientName: org.companyName,
          detail:
            parsedMessage.data.content.length > 160
              ? `${parsedMessage.data.content.slice(0, 160)}...`
              : parsedMessage.data.content,
          link: `/admin/messages/${organizationId}`,
        }).catch(() => {})
      }
    } catch (error) {
      console.error('sendClientMessageAction alert preload error:', error)
    }

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
            message:
              parsedMessage.data.content.length > 80
                ? `${parsedMessage.data.content.slice(0, 80)}…`
                : parsedMessage.data.content,
            userId: superAdmin.id,
            actionUrl: `/admin/messages/${organizationId}`,
          },
        })
      }
    } catch (error) {
      console.error('sendClientMessageAction notification error:', error)
    }

    revalidatePath('/dashboard/messages')
    revalidatePath(`/admin/messages/${organizationId}`)
    revalidatePath('/admin/messages')

    return { success: true }
  } catch (error) {
    console.error('sendClientMessageAction error:', error)
    return { success: false, error: 'Error al enviar el mensaje. Intentá de nuevo.' }
  }
}
