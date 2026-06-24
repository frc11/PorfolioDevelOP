'use server'

import { TicketStatus } from '@prisma/client'
import { auth } from '@/auth'
import { sendEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { resolveOrgId } from '@/lib/preview'
import { sendAgencyAlert } from '@/lib/alerts'
import { revalidatePath } from 'next/cache'
import { TicketReplyEmail } from '@/emails/TicketReplyEmail'
import {
  assertTicketBelongsToOrg,
  ResourceNotOwnedError,
} from '@/lib/auth/assert-ownership'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { ok, fail, type ActionResult } from '@/lib/action-utils'
import {
  CreateTicketSchema,
  TicketReplySchema,
  UpdateTicketStatusSchema,
} from './schemas'

function normalizeStatus(status: TicketStatus | 'CLOSED'): TicketStatus {
  return status === 'CLOSED' ? TicketStatus.RESOLVED : status
}

function revalidateTicketPaths(ticketId?: string) {
  revalidatePath('/admin/tickets')
  if (ticketId) {
    revalidatePath(`/admin/tickets/${ticketId}`)
    revalidatePath(`/dashboard/soporte/${ticketId}`)
  }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/soporte')
}

// Creates a new support ticket. Client-only — org-scoped.
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

  if (!userId || !organizationId) return fail('No autorizado.')

  const parsed = CreateTicketSchema.safeParse({
    title,
    category,
    priority,
    description: message,
  })
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Datos inválidos.')

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

    revalidateTicketPaths(ticket.id)
    return ok({ ticketId: ticket.id })
  } catch (error) {
    console.error('createTicketAction error:', error)
    return fail('Ocurrió un error al crear el ticket.')
  }
}

// Replies to a ticket. Role detected from session.
// CLIENT path: assertTicketBelongsToOrg anti-IDOR, isAdmin=false.
// SUPER_ADMIN path: requireSuperAdmin guard, isAdmin=true, sends email (B1).
// Neither path changes ticket status (A1).
export async function replyToTicketAction({
  ticketId,
  content,
}: {
  ticketId: string
  content: string
}): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return fail('No autorizado.')

  const parsed = TicketReplySchema.safeParse({ ticketId, content })
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Datos inválidos.')

  const isAdmin = session.user.role === 'SUPER_ADMIN'

  if (!isAdmin) {
    const organizationId = await resolveOrgId()
    if (!organizationId) return fail('No autorizado.')
    try {
      await assertTicketBelongsToOrg(parsed.data.ticketId, organizationId)
    } catch (error) {
      if (error instanceof ResourceNotOwnedError) {
        return fail('No encontramos ese ticket.')
      }
      throw error
    }
  }

  try {
    const message = await prisma.ticketMessage.create({
      data: {
        content: parsed.data.content,
        ticketId: parsed.data.ticketId,
        userId,
        isAdmin,
      },
      select: { id: true },
    })

    if (isAdmin) {
      const ticketInfo = await prisma.ticket.findUnique({
        where: { id: parsed.data.ticketId },
        include: { user: true },
      })
      if (ticketInfo?.user?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        sendEmail({
          to: ticketInfo.user.email,
          subject: `Actualización de Soporte: ${ticketInfo.title} - develOP`,
          react: TicketReplyEmail({
            clientName: ticketInfo.user.name ?? 'Cliente',
            ticketTitle: ticketInfo.title,
            ticketId: ticketInfo.id.slice(-6).toUpperCase(),
            ticketUrl: `${baseUrl}/dashboard/soporte/${ticketInfo.id}`,
          }),
        }).catch(console.error)
      }
    }

    revalidateTicketPaths(parsed.data.ticketId)
    return ok({ id: message.id })
  } catch (error) {
    console.error('replyToTicketAction error:', error)
    return fail('Ocurrió un error al enviar la respuesta.')
  }
}

// Changes ticket status. SUPER_ADMIN only. 'CLOSED' normalizes to RESOLVED.
export async function updateTicketStatusAction(
  ticketId: string,
  status: TicketStatus | 'CLOSED'
): Promise<ActionResult<{ id: string }>> {
  const parsed = UpdateTicketStatusSchema.safeParse({ ticketId, status })
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? 'Datos inválidos.')

  try {
    await requireSuperAdmin()
    const ticket = await prisma.ticket.update({
      where: { id: parsed.data.ticketId },
      data: { status: normalizeStatus(parsed.data.status) },
      select: { id: true },
    })
    revalidateTicketPaths(parsed.data.ticketId)
    return ok({ id: ticket.id })
  } catch (error) {
    console.error('updateTicketStatusAction error:', error)
    return fail('Error al actualizar el estado.')
  }
}

// Marks a ticket as resolved. Client-only — org-scope enforced at DB level.
export async function resolveTicketClientAction(
  ticketId: string
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  const organizationId = await resolveOrgId()
  if (!session?.user?.id || !organizationId) return fail('No autorizado.')
  if (!ticketId.trim()) return fail('Ticket inválido.')

  try {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId, organizationId },
      data: { status: 'RESOLVED' },
      select: { id: true },
    })
    revalidateTicketPaths(ticketId)
    return ok({ id: ticket.id })
  } catch (error) {
    console.error('resolveTicketClientAction error:', error)
    return fail('Error al marcar como resuelto.')
  }
}
