'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { revalidatePath } from 'next/cache'
import { TicketCategory, TicketPriority } from '@prisma/client'
import { sendEmail } from '@/lib/email'
import { TicketReplyEmail } from '@/emails/TicketReplyEmail'

export async function createTicketAction({
  title,
  category,
  priority,
  message
}: {
  title: string
  category: TicketCategory
  priority: TicketPriority
  message: string
}) {
  const session = await auth()
  const organizationId = await resolveOrgId()
  const userId = session?.user?.id
  
  if (!userId || !organizationId) {
    return { success: false, error: 'No autorizado' }
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        category,
        priority,
        organizationId,
        userId,
        status: 'OPEN',
        messages: {
          create: {
            content: message,
            userId,
            isAdmin: false,
          }
        }
      }
    })

    revalidatePath('/dashboard/soporte')
    return { success: true, ticketId: ticket.id }
  } catch (error) {
    console.error('Error in createTicketAction:', error)
    return { success: false, error: 'Ocurrió un error al crear el ticket.' }
  }
}

export async function replyTicketAction({
  ticketId,
  content
}: {
  ticketId: string
  content: string
}) {
  const session = await auth()
  const organizationId = await resolveOrgId()
  const userId = session?.user?.id
  
  if (!userId || !organizationId) {
    return { success: false, error: 'No autorizado' }
  }

  // Determine if user is super admin (agency) or client
  const isAdmin = session.user.role === 'SUPER_ADMIN'

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Crear el mensaje
      await tx.ticketMessage.create({
        data: {
          content,
          ticketId,
          userId,
          isAdmin
        }
      })

      // 2. Actualizar estado del ticket si es necesario
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: isAdmin ? 'IN_PROGRESS' : 'OPEN', // Vuelve a OPEN si el cliente responde, IN_PROGRESS si la agencia responde
          updatedAt: new Date()
        }
      })
    })

    // 3. Fire and forget email IF it's an admin replying to a client
    if (isAdmin) {
      const ticketInfo = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { user: true }
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
            ticketUrl: `${baseUrl}/dashboard/soporte/${ticketInfo.id}`
          })
        }).catch(console.error)
      }
    }

    revalidatePath(`/dashboard/soporte/${ticketId}`)
    revalidatePath('/dashboard/soporte')
    return { success: true }
  } catch (error) {
    console.error('Error in replyTicketAction:', error)
    return { success: false, error: 'Ocurrió un error al enviar la respuesta.' }
  }
}
