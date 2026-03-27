'use server'

import { TicketStatus } from '@prisma/client'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  type ActionResult,
  TicketReplySchema,
  UpdateTicketStatusSchema,
} from './schemas'

export async function updateTicketStatusAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'No autorizado.' }
  }

  const parsed = UpdateTicketStatusSchema.safeParse({
    ticketId: formData.get('ticketId'),
    status: formData.get('status'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    await prisma.ticket.update({
      where: { id: parsed.data.ticketId },
      data: { status: parsed.data.status as TicketStatus },
    })

    revalidatePath(`/admin/tickets/${parsed.data.ticketId}`)
    revalidatePath('/admin/tickets')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('updateTicketStatusAction error:', error)
    return { success: false, error: 'No se pudo actualizar el estado del ticket.' }
  }
}

export async function replyToTicketAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId || session?.user?.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Sesión inválida.' }
  }

  const parsed = TicketReplySchema.safeParse({
    ticketId: formData.get('ticketId'),
    content: formData.get('content'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parsed.data.ticketId },
      select: { id: true, status: true },
    })

    if (!ticket) {
      return { success: false, error: 'Ticket no encontrado.' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticketMessage.create({
        data: {
          ticketId: parsed.data.ticketId,
          userId,
          content: parsed.data.content,
          isAdmin: true,
        },
      })

      if (ticket.status === 'OPEN') {
        await tx.ticket.update({
          where: { id: parsed.data.ticketId },
          data: { status: 'IN_PROGRESS' },
        })
      }
    })

    revalidatePath(`/admin/tickets/${parsed.data.ticketId}`)
    revalidatePath('/admin/tickets')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('replyToTicketAction error:', error)
    return { success: false, error: 'Error al enviar la respuesta. Intentá de nuevo.' }
  }
}

export async function markTicketResolvedAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'No autorizado.' }
  }

  const ticketId = (formData.get('ticketId') as string | null)?.trim() ?? ''
  if (!ticketId) {
    return { success: false, error: 'Ticket no especificado.' }
  }

  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'RESOLVED' },
    })

    revalidatePath(`/admin/tickets/${ticketId}`)
    revalidatePath('/admin/tickets')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('markTicketResolvedAction error:', error)
    return { success: false, error: 'No se pudo resolver el ticket.' }
  }
}
