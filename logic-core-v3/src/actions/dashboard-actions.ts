'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function approveTaskAction(taskId: string) {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.organizationId) {
    throw new Error('Unauthorized')
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  })

  if (!task || task.project.organizationId !== session.user.organizationId) {
    throw new Error('Not found or Unauthorized')
  }

  if (task.approvalStatus !== 'PENDING_APPROVAL') {
    throw new Error('Task is not pending approval')
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { approvalStatus: 'APPROVED' }
    })

    await tx.notification.create({
      data: {
        type: 'SUCCESS',
        title: `Entrega aprobada: ${task.title}`,
        message: `Aprobaste la entrega "${task.title}". El equipo fue notificado.`,
        userId: session.user.id!,
        organizationId: session.user.organizationId!,
        taskId: task.id,
        actionUrl: `/dashboard/project`
      }
    })

    await tx.message.create({
      data: {
        content: `✓ Aprobé la entrega de "${task.title}". ¡Todo perfecto!`,
        fromAdmin: false,
        organizationId: session.user.organizationId!,
      }
    })
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/project')
  revalidatePath('/admin/messages')

  return { success: true }
}

export async function rejectTaskAction(taskId: string, reason: string) {
  const session = await auth()
  if (!session?.user?.id || !session?.user?.organizationId) {
    throw new Error('Unauthorized')
  }

  if (!reason || reason.trim() === '') {
    throw new Error('Reason is required')
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  })

  if (!task || task.project.organizationId !== session.user.organizationId) {
    throw new Error('Not found or Unauthorized')
  }

  if (task.approvalStatus !== 'PENDING_APPROVAL') {
    throw new Error('Task is not pending approval')
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: {
        approvalStatus: 'REJECTED',
        rejectionReason: reason
      }
    })

    await tx.notification.create({
      data: {
        type: 'WARNING',
        title: `Cambios solicitados en: ${task.title}`,
        message: `Solicitaste cambios en "${task.title}". Motivo: ${reason}`,
        userId: session.user.id!,
        organizationId: session.user.organizationId!,
        taskId: task.id,
        actionUrl: `/dashboard/project`
      }
    })

    await tx.message.create({
      data: {
        content: `✗ Solicité cambios en "${task.title}": ${reason}`,
        fromAdmin: false,
        organizationId: session.user.organizationId!,
      }
    })
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/project')
  revalidatePath('/admin/messages')

  return { success: true }
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.organizationId) {
    throw new Error('Unauthorized')
  }

  const notif = await prisma.notification.findUnique({
    where: { id: notificationId }
  })

  if (!notif || notif.organizationId !== session.user.organizationId) {
    throw new Error('Not found or Unauthorized')
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true }
  })

  revalidatePath('/dashboard')
  
  return { success: true }
}
