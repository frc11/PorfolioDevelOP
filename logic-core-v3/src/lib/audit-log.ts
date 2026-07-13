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

/**
 * PA-4 — Batch de logAdminAction para bulk actions (updateMany + N filas de
 * auditoría en UN round-trip, en vez de N logAdminAction seriales). Obtiene
 * ipAddress/userAgent UNA sola vez (headers() es por-request, no por-fila) y
 * los aplica a todas las filas — paridad con el enriquecimiento de la versión
 * serial. No-op sobre lista vacía. Mismo swallow de error que logAdminAction:
 * un fallo de auditoría no rompe la acción llamante.
 */
export async function logAdminActionsBatch(inputs: LogActionInput[]): Promise<void> {
  if (inputs.length === 0) return
  try {
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const userAgent = headersList.get('user-agent')

    await prisma.adminAuditLog.createMany({
      data: inputs.map((input) => ({
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
      })),
    })
  } catch (error) {
    console.error('[audit-log] Failed to log actions (batch):', error)
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
