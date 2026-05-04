import { prisma } from '@/lib/prisma'
import { notifyClientOfNewMessage } from '@/lib/email/notify-message'

type QueueAdminMessageEmailParams = {
  organizationId: string
  senderName: string
  messageContent: string
}

function getFirstTwoLines(content: string) {
  return content
    .trim()
    .split(/\r?\n/)
    .slice(0, 2)
    .join('\n')
    .trim()
}

export function queueAdminMessageEmail(params: QueueAdminMessageEmailParams) {
  void (async () => {
    try {
      const primaryMember =
        (await prisma.orgMember.findFirst({
          where: {
            organizationId: params.organizationId,
            role: 'ADMIN',
          },
          orderBy: { joinedAt: 'asc' },
          select: { userId: true },
        })) ??
        (await prisma.orgMember.findFirst({
          where: { organizationId: params.organizationId },
          orderBy: { joinedAt: 'asc' },
          select: { userId: true },
        }))

      if (!primaryMember) {
        console.log('[admin-message-notification] Organization has no members, skipping')
        return
      }

      await notifyClientOfNewMessage({
        recipientUserId: primaryMember.userId,
        senderName: params.senderName,
        messagePreview: getFirstTwoLines(params.messageContent),
        organizationId: params.organizationId,
      })
    } catch (error) {
      console.error('[admin-message-notification] Failed to queue email:', error)
    }
  })()
}
