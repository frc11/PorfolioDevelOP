'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  GetConversationSchema,
  MarkAsReadSchema,
  SendMessageSchema,
} from './message.schemas'

function revalidateMessagePaths(organizationId?: string) {
  revalidatePath('/admin/os/messages')

  if (organizationId) {
    revalidatePath(`/admin/os/messages/${organizationId}`)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/messages')
}

export async function listConversations(): Promise<
  ActionResult<
    Array<{
      organizationId: string
      companyName: string
      slug: string
      lastMessage: {
        id: string
        content: string
        fromAdmin: boolean
        read: boolean
        createdAt: string
      } | null
      unreadCount: number
      totalMessages: number
    }>
  >
> {
  try {
    await requireSuperAdmin()

    const organizations = await prisma.organization.findMany({
      where: {
        messages: {
          some: {},
        },
      },
      select: {
        id: true,
        companyName: true,
        slug: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            id: true,
            content: true,
            fromAdmin: true,
            read: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    const unreadCounts = organizations.length
      ? await prisma.message.groupBy({
          by: ['organizationId'],
          where: {
            organizationId: {
              in: organizations.map((organization) => organization.id),
            },
            fromAdmin: false,
            read: false,
          },
          _count: {
            _all: true,
          },
        })
      : []

    const unreadMap = new Map(
      unreadCounts.map((entry) => [entry.organizationId, entry._count._all])
    )

    const conversations = organizations
      .map((organization) => ({
        organizationId: organization.id,
        companyName: organization.companyName,
        slug: organization.slug,
        lastMessage: organization.messages[0]
          ? {
              id: organization.messages[0].id,
              content: organization.messages[0].content,
              fromAdmin: organization.messages[0].fromAdmin,
              read: organization.messages[0].read,
              createdAt: organization.messages[0].createdAt.toISOString(),
            }
          : null,
        unreadCount: unreadMap.get(organization.id) ?? 0,
        totalMessages: organization._count.messages,
      }))
      .sort((left, right) => {
        const leftDate = left.lastMessage ? new Date(left.lastMessage.createdAt).getTime() : 0
        const rightDate = right.lastMessage ? new Date(right.lastMessage.createdAt).getTime() : 0
        return rightDate - leftDate
      })

    return ok(conversations)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to list conversations')
  }
}

export async function getConversation(
  organizationId: string
): Promise<
  ActionResult<
    Array<{
      id: string
      content: string
      fromAdmin: boolean
      read: boolean
      createdAt: string
      organizationId: string
    }>
  >
> {
  try {
    await requireSuperAdmin()
    const parsedOrganizationId = GetConversationSchema.parse(organizationId)

    const messages = await prisma.message.findMany({
      where: {
        organizationId: parsedOrganizationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return ok(
      messages.map((message) => ({
        id: message.id,
        content: message.content,
        fromAdmin: message.fromAdmin,
        read: message.read,
        createdAt: message.createdAt.toISOString(),
        organizationId: message.organizationId,
      }))
    )
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to get conversation')
  }
}

export async function sendMessage(
  organizationId: string,
  content: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = SendMessageSchema.parse({ organizationId, content })

    const message = await prisma.message.create({
      data: {
        organizationId: parsed.organizationId,
        content: parsed.content.trim(),
        fromAdmin: true,
      },
      select: {
        id: true,
      },
    })

    revalidateMessagePaths(parsed.organizationId)
    return ok({ id: message.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to send message')
  }
}

export async function markAsRead(
  organizationId: string
): Promise<ActionResult<{ count: number }>> {
  try {
    await requireSuperAdmin()
    const parsedOrganizationId = MarkAsReadSchema.parse(organizationId)

    const result = await prisma.message.updateMany({
      where: {
        organizationId: parsedOrganizationId,
        fromAdmin: false,
        read: false,
      },
      data: {
        read: true,
      },
    })

    revalidateMessagePaths(parsedOrganizationId)
    return ok({ count: result.count })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to mark messages as read')
  }
}
