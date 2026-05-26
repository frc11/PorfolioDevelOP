/**
 * B11.2 — Helpers de ownership tenant-scoped.
 *
 * Defense-in-depth para server actions que reciben un ID del cliente y mutan
 * un recurso. NUNCA confiar en que el ID vino de una lista pre-filtrada — un
 * atacante puede armar el POST con un ID arbitrario (ver `replyTicketAction`
 * IDOR confirmado en B11.0).
 *
 * Patrón:
 *   await assertTicketBelongsToOrg(ticketId, session.organizationId)
 *   await prisma.ticket.update({ where: { id: ticketId }, data: {...} })
 *
 * Tira `ResourceNotOwnedError` si el recurso no existe o pertenece a otra org.
 * El caller decide cómo serializar (típicamente: 404 + audit log, no 403, para
 * no leakear la existencia del recurso a otra org).
 */
import { prisma } from '@/lib/prisma'

export class ResourceNotOwnedError extends Error {
  readonly model: string
  readonly resourceId: string

  constructor(model: string, resourceId: string) {
    super(`${model}#${resourceId} not found or not owned by caller`)
    this.name = 'ResourceNotOwnedError'
    this.model = model
    this.resourceId = resourceId
  }
}

export async function assertTicketBelongsToOrg(
  ticketId: string,
  organizationId: string,
): Promise<void> {
  const found = await prisma.ticket.findFirst({
    where: { id: ticketId, organizationId },
    select: { id: true },
  })
  if (!found) {
    throw new ResourceNotOwnedError('Ticket', ticketId)
  }
}

export async function assertProjectBelongsToOrg(
  projectId: string,
  organizationId: string,
): Promise<void> {
  const found = await prisma.project.findFirst({
    where: { id: projectId, organizationId },
    select: { id: true },
  })
  if (!found) {
    throw new ResourceNotOwnedError('Project', projectId)
  }
}
