'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  CreateMaintenancePaymentSchema,
  MarkMaintenancePaidSchema,
  ProjectIdSchema,
} from './maintenance.schemas'

const INTERNAL_ORGANIZATION_SLUG = 'agency-os-internal'

function revalidateProjectPaths(projectId: string, organizationSlug?: string | null) {
  revalidatePath('/admin/os/projects')
  revalidatePath(`/admin/os/projects/${projectId}`)
  revalidatePath(`/admin/os/projects/${projectId}/payments`)

  if (organizationSlug && organizationSlug !== INTERNAL_ORGANIZATION_SLUG) {
    revalidatePath('/dashboard/project')
  }
}

function firstDayOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function nextUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
}

export async function createMaintenancePayment(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = CreateMaintenancePaymentSchema.parse(input)

    const payment = await prisma.osMaintenancePayment.create({
      data: parsed,
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            organization: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    })

    revalidateProjectPaths(payment.projectId, payment.project.organization.slug)
    return ok({ id: payment.id })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'Failed to create maintenance payment'
    )
  }
}

export async function markMaintenancePaid(
  paymentId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = MarkMaintenancePaidSchema.parse({ paymentId })

    const payment = await prisma.osMaintenancePayment.update({
      where: { id: parsed.paymentId },
      data: {
        paidAt: new Date(),
      },
      select: {
        id: true,
        projectId: true,
        project: {
          select: {
            organization: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    })

    revalidateProjectPaths(payment.projectId, payment.project.organization.slug)
    return ok({ id: payment.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to mark payment as paid')
  }
}

export async function generatePendingMaintenance(
  projectId: string
): Promise<ActionResult<{ createdCount: number }>> {
  try {
    await requireSuperAdmin()
    const parsedProjectId = ProjectIdSchema.parse(projectId)

    const [project, maintenancePayments] = await Promise.all([
      prisma.project.findUnique({
        where: { id: parsedProjectId },
        select: {
          id: true,
          organization: {
            select: {
              slug: true,
            },
          },
          monthlyRate: true,
          maintenanceStartDate: true,
        },
      }),
      prisma.osMaintenancePayment.findMany({
        where: { projectId: parsedProjectId },
        select: {
          month: true,
          year: true,
        },
      }),
    ])

    if (!project) {
      return fail('Project not found')
    }

    if (!project.maintenanceStartDate) {
      return fail('Project has no maintenance start date')
    }

    if (!project.monthlyRate) {
      return fail('Project has no monthly rate configured')
    }

    const existingPeriods = new Set(
      maintenancePayments.map((payment) => `${payment.year}-${payment.month}`)
    )

    const today = new Date()
    const finalMonth = firstDayOfUtcMonth(today)
    let currentMonth = firstDayOfUtcMonth(project.maintenanceStartDate)

    const missingPayments: Array<{
      projectId: string
      month: number
      year: number
      amount: string
    }> = []

    while (currentMonth.getTime() <= finalMonth.getTime()) {
      const month = currentMonth.getUTCMonth() + 1
      const year = currentMonth.getUTCFullYear()
      const periodKey = `${year}-${month}`

      if (!existingPeriods.has(periodKey)) {
        missingPayments.push({
          projectId: project.id,
          month,
          year,
          amount: project.monthlyRate.toString(),
        })
      }

      currentMonth = nextUtcMonth(currentMonth)
    }

    if (missingPayments.length > 0) {
      await prisma.osMaintenancePayment.createMany({
        data: missingPayments,
        skipDuplicates: true,
      })
    }

    revalidateProjectPaths(project.id, project.organization.slug)
    return ok({ createdCount: missingPayments.length })
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'Failed to generate maintenance payments'
    )
  }
}
