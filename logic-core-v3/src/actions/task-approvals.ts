'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function requestTaskApproval(taskId: string) {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error('Unauthorized')

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  })

  if (!task || task.project.organizationId !== session.user.organizationId) {
    throw new Error('Not found or Unauthorized')
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      approvalStatus: 'PENDING_APPROVAL'
    }
  })

  // Here we could notify the client that an action is required
  // For now, it just sets the state.

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/project')
  revalidatePath(`/admin/projects/${task.projectId}`)
  
  return { success: true }
}

export async function approveTask(taskId: string) {
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
    // 1. Update task status
    await tx.task.update({
      where: { id: taskId },
      data: {
        approvalStatus: 'APPROVED'
      }
    })

    // 2. Create notification for the organization (admins)
    await tx.notification.create({
      data: {
        type: 'SUCCESS',
        title: 'Tarea Aprobada',
        message: `El cliente ha aprobado la tarea: ${task.title}`,
        userId: session.user.id!, // A quien le llegó la notif o quien originó
        organizationId: session.user.organizationId!,
        taskId: task.id,
        actionUrl: `/admin/projects/${task.projectId}`
      }
    })
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/project')
  
  return { success: true }
}

export async function rejectTask(taskId: string, reason: string) {
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
    // 1. Update task status with rejection reason
    await tx.task.update({
      where: { id: taskId },
      data: {
        approvalStatus: 'REJECTED',
        rejectionReason: reason
      }
    })

    // 2. Create notification for admins
    await tx.notification.create({
      data: {
        type: 'WARNING',
        title: 'Tarea Rechazada',
        message: `El cliente requirió cambios en: ${task.title} - Motivo: ${reason}`,
        userId: session.user.id!,
        organizationId: session.user.organizationId!,
        taskId: task.id,
        actionUrl: `/admin/projects/${task.projectId}`
      }
    })
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/project')
  
  return { success: true }
}
