'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { AssetType } from '@prisma/client'
import { sendEmail } from '@/lib/email'
import { ActionRequiredEmail } from '@/emails/ActionRequiredEmail'

export async function getAgencyClients() {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }

  const clients = await prisma.organization.findMany({
    include: {
      projects: {
        where: { status: 'IN_PROGRESS' },
        include: {
          tasks: {
            where: { approvalStatus: 'PENDING_APPROVAL' }
          }
        }
      },
      clientAssets: {
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return clients
}

export async function createTaskForClientAction(
  projectId: string,
  organizationId: string,
  data: { title: string; description: string; dueDate?: Date }
) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }

  const result = await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        projectId,
        status: 'TODO',
        approvalStatus: 'PENDING_APPROVAL'
      }
    })

    const orgMembers = await tx.orgMember.findMany({
      where: { organizationId },
      include: { user: true }
    })

    const notifications = orgMembers.map(member => ({
      type: 'ACTION_REQUIRED' as const,
      title: 'Petición de Aprobación',
      message: `DevelOP ha solicitado tu aprobación para el entregable: ${task.title}`,
      userId: member.userId,
      organizationId,
      taskId: task.id,
      actionUrl: `/dashboard/project`
    }))

    if (notifications.length > 0) {
      await tx.notification.createMany({
        data: notifications
      })
    }
    
    // Store data to send emails after transaction
    return { task, orgMembers, notifications }
  })

  // Fire and forget emails to each user
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  for (const member of result.orgMembers) {
    if (member.user.email) {
      sendEmail({
        to: member.user.email,
        subject: `Acción Requerida: ${result.task.title} - develOP`,
        react: ActionRequiredEmail({
          clientName: member.user.name || 'Cliente',
          taskName: result.task.title,
          dashboardUrl: `${baseUrl}/dashboard/project`
        })
      }).catch(console.error)
    }
  }

  revalidatePath('/admin/agency-dashboard')
  return { success: true }
}

export async function createClientAssetAction(
  organizationId: string,
  data: { name: string; url: string; type: AssetType; description?: string }
) {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }

  await prisma.clientAsset.create({
    data: {
      organizationId,
      name: data.name,
      url: data.url,
      type: data.type,
      description: data.description
    }
  })

  revalidatePath('/admin/agency-dashboard')
  return { success: true }
}
