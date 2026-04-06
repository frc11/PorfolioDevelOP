'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { MilestoneIdSchema } from './milestone.schemas'

function revalidateProjectPaths(projectId: string, organizationId?: string | null) {
  revalidatePath('/admin/os/projects')
  revalidatePath(`/admin/os/projects/${projectId}`)
  revalidatePath(`/admin/os/projects/${projectId}/payments`)

  if (organizationId) {
    revalidatePath('/dashboard/project')
  }
}

export async function markMilestonePaid(
  milestoneId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsedMilestoneId = MilestoneIdSchema.parse(milestoneId)

    const milestone = await prisma.osPaymentMilestone.update({
      where: { id: parsedMilestoneId },
      data: {
        paidAt: new Date(),
      },
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    })

    revalidateProjectPaths(milestone.projectId, milestone.project.organizationId)
    return ok({ id: milestone.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to mark milestone as paid')
  }
}

export async function unmarkMilestonePaid(
  milestoneId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsedMilestoneId = MilestoneIdSchema.parse(milestoneId)

    const milestone = await prisma.osPaymentMilestone.update({
      where: { id: parsedMilestoneId },
      data: {
        paidAt: null,
      },
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    })

    revalidateProjectPaths(milestone.projectId, milestone.project.organizationId)
    return ok({ id: milestone.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to unmark milestone as paid')
  }
}
