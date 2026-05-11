'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import type { OnboardingTaskStatus } from '@prisma/client'

export async function updateTaskStatus(taskId: string, status: OnboardingTaskStatus) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }

  const task = await prisma.onboardingTask.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === 'COMPLETED' ? new Date() : null,
      completedById: status === 'COMPLETED' ? session.user.id : null,
    },
  })

  // Si se completó, verificar si era la última tarea pendiente
  if (status === 'COMPLETED') {
    const remainingCount = await prisma.onboardingTask.count({
      where: {
        organizationId: task.organizationId,
        status: { notIn: ['COMPLETED', 'SKIPPED'] },
      },
    })

    if (remainingCount === 0) {
      await prisma.message.create({
        data: {
          content:
            '🎉 ¡Tu panel develOP está 100% configurado! Cualquier consulta, escribinos.',
          fromAdmin: true,
          organizationId: task.organizationId,
        },
      })
    }
  }

  revalidatePath(`/admin/clients/${task.organizationId}/onboarding`)
  revalidatePath('/dashboard')

  return task
}

export async function updateTaskNotes(taskId: string, internalNotes: string) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }

  const task = await prisma.onboardingTask.update({
    where: { id: taskId },
    data: { internalNotes },
  })

  revalidatePath(`/admin/clients/${task.organizationId}/onboarding`)

  return task
}
