import { headers } from 'next/headers'
import type { AuditActionType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

interface LogActionInput {
  userId: string
  userEmail?: string | null
  userName?: string | null
  actionType: AuditActionType
  action: string
  targetType: string
  targetId: string
  diff?: object
  metadata?: object
}

export async function logAdminAction(input: LogActionInput): Promise<void> {
  try {
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = headersList.get('user-agent')

    await prisma.adminAuditLog.create({
      data: {
        userId: input.userId,
        userEmail: input.userEmail,
        userName: input.userName,
        actionType: input.actionType,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        diff: input.diff ?? {},
        metadata: input.metadata ?? {},
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    console.error('[audit-log] Failed to log action:', error)
  }
}

export function computeDiff<T extends Record<string, unknown>>(
  before: T,
  after: T,
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {}
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of allKeys) {
    const beforeValue = before[key]
    const afterValue = after[key]

    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      diff[key] = { before: beforeValue, after: afterValue }
    }
  }

  return diff
}

export function omitAuditNoise<T extends Record<string, unknown>>(input: T) {
  const { createdAt, updatedAt, ...rest } = input
  return rest
}
