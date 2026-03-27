'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import {
  type ActionResult,
  TaskApprovalSchema,
  TaskRejectionSchema,
} from '@/lib/actions/schemas'

export async function approveTaskAction(taskId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id || !session.user.organizationId) {
    return { success: false, error: 'No autorizado.' }
  }
  const userId = session.user.id
  const organizationId = session.user.organizationId

  const parsed = TaskApprovalSchema.safeParse({ taskId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: parsed.data.taskId },
      include: { project: true },
    })

    if (!task || task.project.organizationId !== organizationId) {
      return { success: false, error: 'No encontramos esa entrega.' }
    }

    if (task.approvalStatus !== 'PENDING_APPROVAL') {
      return { success: false, error: 'La entrega ya no está pendiente de aprobación.' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: parsed.data.taskId },
        data: { approvalStatus: 'APPROVED' },
      })

      await tx.notification.create({
        data: {
          type: 'SUCCESS',
          title: `Entrega aprobada: ${task.title}`,
          message: `Aprobaste la entrega "${task.title}". El equipo fue notificado.`,
          userId,
          organizationId,
          taskId: task.id,
          actionUrl: '/dashboard/project',
        },
      })

      await tx.message.create({
        data: {
          content: `✓ Aprobé la entrega de "${task.title}". ¡Todo perfecto!`,
          fromAdmin: false,
          organizationId,
        },
      })
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/project')
    revalidatePath('/admin/messages')

    return { success: true }
  } catch (error) {
    console.error('approveTaskAction error:', error)
    return { success: false, error: 'No se pudo aprobar la entrega.' }
  }
}

export async function rejectTaskAction(
  taskId: string,
  reason: string
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id || !session.user.organizationId) {
    return { success: false, error: 'No autorizado.' }
  }
  const userId = session.user.id
  const organizationId = session.user.organizationId

  const parsed = TaskRejectionSchema.safeParse({ taskId, reason })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message }
  }

  try {
    const task = await prisma.task.findUnique({
      where: { id: parsed.data.taskId },
      include: { project: true },
    })

    if (!task || task.project.organizationId !== organizationId) {
      return { success: false, error: 'No encontramos esa entrega.' }
    }

    if (task.approvalStatus !== 'PENDING_APPROVAL') {
      return { success: false, error: 'La entrega ya no está pendiente de aprobación.' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: parsed.data.taskId },
        data: {
          approvalStatus: 'REJECTED',
          rejectionReason: parsed.data.reason,
        },
      })

      await tx.notification.create({
        data: {
          type: 'WARNING',
          title: `Cambios solicitados en: ${task.title}`,
          message: `Solicitaste cambios en "${task.title}". Motivo: ${parsed.data.reason}`,
          userId,
          organizationId,
          taskId: task.id,
          actionUrl: '/dashboard/project',
        },
      })

      await tx.message.create({
        data: {
          content: `✗ Solicité cambios en "${task.title}": ${parsed.data.reason}`,
          fromAdmin: false,
          organizationId,
        },
      })
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/project')
    revalidatePath('/admin/messages')

    return { success: true }
  } catch (error) {
    console.error('rejectTaskAction error:', error)
    return { success: false, error: 'No se pudieron enviar los cambios solicitados.' }
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.organizationId) {
    return { success: false, error: 'No autorizado.' }
  }

  if (!notificationId.trim()) {
    return { success: false, error: 'Notificación inválida.' }
  }

  try {
    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notif || notif.organizationId !== session.user.organizationId) {
      return { success: false, error: 'No encontramos esa notificación.' }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('markNotificationAsRead error:', error)
    return { success: false, error: 'No se pudo actualizar la notificación.' }
  }
}
