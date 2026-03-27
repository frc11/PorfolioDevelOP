'use server'

import { TicketStatus } from '@prisma/client'
import { auth } from '@/auth'
import { sendEmail } from '@/lib/email'
import {
  type ActionResult,
  CreateTicketSchema,
  TicketReplySchema,
} from '@/lib/actions/schemas'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { sendAgencyAlert } from '@/lib/alerts'
import { revalidatePath } from 'next/cache'
import { TicketReplyEmail } from '@/emails/TicketReplyEmail'

export async function createTicketAction({
  title,
  category,
  priority,
  message,
}: {
  title: string
  category: string
  priority: string
  message: string
}): Promise<ActionResult<{ ticketId: string }>> {
  const session = await auth()
  const organizationId = await resolveOrgId()
  const userId = session?.user?.id

  if (!userId || !organizationId) {
    return { success: false, error: 'No autorizado.' }
  }

  const parsed = CreateTicketSchema.safeParse({
    title,
    category,
    priority,
    description: message,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    const [ticket, organization] = await Promise.all([
      prisma.ticket.create({
        data: {
          title: parsed.data.title,
          category: parsed.data.category,
          priority: parsed.data.priority,
          organizationId,
          userId,
          status: 'OPEN',
          messages: {
            create: {
              content: parsed.data.description,
              userId,
              isAdmin: false,
            },
          },
        },
      }),
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { companyName: true },
      }),
    ])

    if (parsed.data.priority === 'HIGH' || parsed.data.priority === 'URGENT') {
      sendAgencyAlert({
        type: 'TICKET_URGENT',
        clientName: organization?.companyName || session.user.name || 'Cliente',
        detail: ticket.title,
        priority: parsed.data.priority,
        link: `/admin/tickets/${ticket.id}`,
      }).catch(() => {})
    }

    revalidatePath('/dashboard/soporte')
    return { success: true, data: { ticketId: ticket.id } }
  } catch (error) {
    console.error('createTicketAction error:', error)
    return { success: false, error: 'Ocurrió un error al crear el ticket.' }
  }
}

export async function replyTicketAction({
  ticketId,
  content,
}: {
  ticketId: string
  content: string
}): Promise<ActionResult> {
  const session = await auth()
  const organizationId = await resolveOrgId()
  const userId = session?.user?.id

  if (!userId || !organizationId) {
    return { success: false, error: 'No autorizado.' }
  }

  const parsed = TicketReplySchema.safeParse({ ticketId, content })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  const isAdmin = session.user.role === 'SUPER_ADMIN'

  try {
    await prisma.$transaction(async (tx) => {
      await tx.ticketMessage.create({
        data: {
          content: parsed.data.content,
          ticketId: parsed.data.ticketId,
          userId,
          isAdmin,
        },
      })

      await tx.ticket.update({
        where: { id: parsed.data.ticketId },
        data: {
          status: isAdmin ? 'IN_PROGRESS' : 'OPEN',
          updatedAt: new Date(),
        },
      })
    })

    if (isAdmin) {
      const ticketInfo = await prisma.ticket.findUnique({
        where: { id: parsed.data.ticketId },
        include: { user: true },
      })

      if (ticketInfo?.user?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        sendEmail({
          to: ticketInfo.user.email,
          subject: `Actualización de Soporte: ${ticketInfo.title} - develOP`,
          react: TicketReplyEmail({
            clientName: ticketInfo.user.name || 'Cliente',
            ticketTitle: ticketInfo.title,
            ticketId: ticketInfo.id.slice(-6).toUpperCase(),
            ticketUrl: `${baseUrl}/dashboard/soporte/${ticketInfo.id}`,
          }),
        }).catch(console.error)
      }
    }

    revalidatePath(`/dashboard/soporte/${parsed.data.ticketId}`)
    revalidatePath('/dashboard/soporte')
    return { success: true }
  } catch (error) {
    console.error('replyTicketAction error:', error)
    return { success: false, error: 'Ocurrió un error al enviar la respuesta.' }
  }
}

export async function resolveTicketClientAction(
  ticketId: string
): Promise<ActionResult> {
  const session = await auth()
  const organizationId = await resolveOrgId()
  const userId = session?.user?.id

  if (!userId || !organizationId) {
    return { success: false, error: 'No autorizado.' }
  }

  if (!ticketId.trim()) {
    return { success: false, error: 'Ticket inválido.' }
  }

  try {
    await prisma.ticket.update({
      where: { id: ticketId, organizationId },
      data: { status: 'RESOLVED' },
    })

    revalidatePath(`/dashboard/soporte/${ticketId}`)
    revalidatePath('/dashboard/soporte')
    return { success: true }
  } catch (error) {
    console.error('resolveTicketClientAction error:', error)
    return { success: false, error: 'Error al marcar como resuelto.' }
  }
}

export async function updateTicketStatusDashboardAction(
  ticketId: string,
  status: TicketStatus
): Promise<ActionResult> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'No autorizado.' }
  }

  if (!ticketId.trim()) {
    return { success: false, error: 'Ticket inválido.' }
  }

  if (!Object.values(TicketStatus).includes(status)) {
    return { success: false, error: 'Estado inválido.' }
  }

  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    })

    revalidatePath(`/dashboard/soporte/${ticketId}`)
    revalidatePath('/dashboard/soporte')
    revalidatePath(`/admin/tickets/${ticketId}`)
    revalidatePath('/admin/tickets')
    return { success: true }
  } catch (error) {
    console.error('updateTicketStatusDashboardAction error:', error)
    return { success: false, error: 'Error al actualizar el estado.' }
  }
}
