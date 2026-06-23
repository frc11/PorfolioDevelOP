'use server'

import { TicketStatus, type Role } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  GetTicketByIdSchema,
  ListTicketsSchema,
} from './ticket.schemas'

type TicketStatusFilter = TicketStatus | 'CLOSED' | null | undefined

function normalizeTicketStatus(status: TicketStatusFilter): TicketStatus | undefined {
  if (!status) {
    return undefined
  }

  if (status === 'CLOSED') {
    return TicketStatus.RESOLVED
  }

  return Object.values(TicketStatus).includes(status as TicketStatus)
    ? (status as TicketStatus)
    : undefined
}

export async function listTickets(filters?: {
  status?: TicketStatusFilter
  organizationId?: string | null
}): Promise<
  ActionResult<
    Array<{
      id: string
      title: string
      status: TicketStatus
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'OTHER'
      createdAt: string
      updatedAt: string
      organizationId: string
      organization: {
        companyName: string
      }
      _count: {
        messages: number
      }
    }>
  >
> {
  try {
    await requireSuperAdmin()
    const parsedFilters = ListTicketsSchema.parse({
      status: filters?.status,
      organizationId: filters?.organizationId ?? undefined,
    })
    const status = normalizeTicketStatus(parsedFilters.status)

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(parsedFilters.organizationId
          ? { organizationId: parsedFilters.organizationId }
          : {}),
      },
      include: {
        organization: {
          select: {
            companyName: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    })

    return ok(
      tickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        organizationId: ticket.organizationId,
        organization: ticket.organization,
        _count: ticket._count,
      }))
    )
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to list tickets')
  }
}

export async function getTicketById(
  id: string
): Promise<
  ActionResult<{
    id: string
    title: string
    status: TicketStatus
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    category: 'TECHNICAL' | 'BILLING' | 'FEATURE_REQUEST' | 'OTHER'
    createdAt: string
    updatedAt: string
    organizationId: string
    organization: {
      id: string
      companyName: string
      slug: string
      logoUrl: string | null
      siteUrl: string | null
      whatsapp: string | null
      createdAt: string
    }
    messages: Array<{
      id: string
      content: string
      createdAt: string
      isAdmin: boolean
      user: {
        name: string | null
        role: Role
      }
    }>
  }>
> {
  try {
    await requireSuperAdmin()
    const ticketId = GetTicketByIdSchema.parse(id)

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        organization: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
    })

    if (!ticket) {
      return fail('Ticket not found')
    }

    return ok({
      id: ticket.id,
      title: ticket.title,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      organizationId: ticket.organizationId,
      organization: {
        id: ticket.organization.id,
        companyName: ticket.organization.companyName,
        slug: ticket.organization.slug,
        logoUrl: ticket.organization.logoUrl,
        siteUrl: ticket.organization.siteUrl,
        whatsapp: ticket.organization.whatsapp,
        createdAt: ticket.organization.createdAt.toISOString(),
      },
      messages: ticket.messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        isAdmin: message.isAdmin,
        user: message.user,
      })),
    })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to get ticket')
  }
}

