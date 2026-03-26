'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TicketStatus } from '@prisma/client'

// ─── Update Status ─────────────────────────────────────────────────────────────

export async function updateTicketStatusAction(formData: FormData): Promise<void> {
  const ticketId = (formData.get('ticketId') as string | null) ?? ''
  const status = (formData.get('status') as string | null) as TicketStatus | null

  if (!ticketId || !status) return
  if (!Object.values(TicketStatus).includes(status)) return

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  })

  revalidatePath(`/admin/tickets/${ticketId}`)
  revalidatePath('/admin/tickets')
  revalidatePath('/admin')
}

// ─── Reply ─────────────────────────────────────────────────────────────────────

export async function replyToTicketAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return 'Sesión inválida.'

  const ticketId = (formData.get('ticketId') as string | null) ?? ''
  const content = ((formData.get('content') as string | null) ?? '').trim()

  if (!ticketId) return 'Ticket no especificado.'
  if (!content) return 'La respuesta no puede estar vacía.'

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
  if (!ticket) return 'Ticket no encontrado.'

  try {
    await prisma.ticketMessage.create({
      data: { ticketId, userId, content, isAdmin: true },
    })

    // Auto-move to IN_PROGRESS if still OPEN
    if (ticket.status === 'OPEN') {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' },
      })
    }
  } catch {
    return 'Error al enviar la respuesta. Intentá de nuevo.'
  }

  revalidatePath(`/admin/tickets/${ticketId}`)
  revalidatePath('/admin/tickets')
  revalidatePath('/admin')
  return null
}

// ─── Mark Resolved ─────────────────────────────────────────────────────────────

export async function markTicketResolvedAction(formData: FormData): Promise<void> {
  const ticketId = (formData.get('ticketId') as string | null) ?? ''
  if (!ticketId) return

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: 'RESOLVED' },
  })

  revalidatePath(`/admin/tickets/${ticketId}`)
  revalidatePath('/admin/tickets')
  revalidatePath('/admin')
}
