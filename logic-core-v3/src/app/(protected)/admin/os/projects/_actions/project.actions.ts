'use server'

import type { Prisma } from '@prisma/client'
import { LeadStatus, MilestoneType, OsProjectStatus, OsTaskStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  ConvertLeadToProjectSchema,
  CreateProjectSchema,
  ProjectIdSchema,
  UpdateProjectSchema,
  UpdateProjectStatusSchema,
} from './project.schemas'

type ProjectListRecord = Prisma.OsProjectGetPayload<{
  include: {
    _count: {
      select: {
        tasks: true
      }
    }
    lead: {
      select: {
        id: true
        businessName: true
        status: true
      }
    }
    milestones: {
      select: {
        id: true
        paidAt: true
      }
    }
    tasks: {
      select: {
        id: true
        status: true
        timeEntries: {
          select: {
            hours: true
          }
        }
      }
    }
    maintenancePayments: {
      select: {
        id: true
      }
    }
  }
}>

type ProjectDetailRecord = Prisma.OsProjectGetPayload<{
  include: {
    lead: {
      select: {
        id: true
        businessName: true
        contactName: true
        phone: true
        email: true
        industry: true
        zone: true
        source: true
        instagramUrl: true
        currentWebUrl: true
        googleMapsUrl: true
        status: true
        serviceType: true
        nextFollowUpAt: true
        reactivateAt: true
        notes: true
        createdAt: true
        updatedAt: true
      }
    }
    tasks: {
      include: {
        assignedTo: {
          select: {
            id: true
            name: true
            email: true
          }
        }
        timeEntries: {
          include: {
            user: {
              select: {
                id: true
                name: true
                email: true
              }
            }
          }
        }
      }
    }
    milestones: true
    maintenancePayments: true
  }
}>

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null
}

function splitMilestoneAmounts(totalAmount: number): {
  startAmount: number
  deliveryAmount: number
} {
  const totalCents = Math.round(totalAmount * 100)
  const startCents = Math.floor(totalCents / 2)
  const deliveryCents = totalCents - startCents

  return {
    startAmount: startCents / 100,
    deliveryAmount: deliveryCents / 100,
  }
}

function serializeProjectListItem(project: ProjectListRecord) {
  const totalTrackedHours = project.tasks.reduce((projectHours, task) => {
    const taskHours = task.timeEntries.reduce((hours, entry) => hours + entry.hours, 0)
    return projectHours + taskHours
  }, 0)

  const paidMilestones = project.milestones.filter((milestone) => milestone.paidAt).length
  const completedTasks = project.tasks.filter((task) => task.status === OsTaskStatus.COMPLETADA).length

  return {
    id: project.id,
    leadId: project.leadId,
    businessName: project.businessName,
    contactName: project.contactName,
    contactPhone: project.contactPhone,
    contactEmail: project.contactEmail,
    organizationId: project.organizationId,
    name: project.name,
    description: project.description,
    serviceType: project.serviceType,
    status: project.status,
    agreedAmount: project.agreedAmount.toString(),
    monthlyRate: project.monthlyRate?.toString() ?? null,
    maintenanceStartDate: serializeDate(project.maintenanceStartDate),
    startDate: project.startDate.toISOString(),
    estimatedEndDate: serializeDate(project.estimatedEndDate),
    deliveredAt: serializeDate(project.deliveredAt),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    _count: {
      tasks: project._count.tasks,
    },
    completedTasks,
    totalTrackedHours,
    milestoneSummary: {
      total: project.milestones.length,
      paid: paidMilestones,
    },
    maintenancePaymentsCount: project.maintenancePayments.length,
    lead: project.lead,
  }
}

function serializeProjectDetail(project: ProjectDetailRecord) {
  return {
    id: project.id,
    leadId: project.leadId,
    businessName: project.businessName,
    contactName: project.contactName,
    contactPhone: project.contactPhone,
    contactEmail: project.contactEmail,
    organizationId: project.organizationId,
    name: project.name,
    description: project.description,
    serviceType: project.serviceType,
    status: project.status,
    agreedAmount: project.agreedAmount.toString(),
    monthlyRate: project.monthlyRate?.toString() ?? null,
    maintenanceStartDate: serializeDate(project.maintenanceStartDate),
    startDate: project.startDate.toISOString(),
    estimatedEndDate: serializeDate(project.estimatedEndDate),
    deliveredAt: serializeDate(project.deliveredAt),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    lead: project.lead
      ? {
          ...project.lead,
          nextFollowUpAt: serializeDate(project.lead.nextFollowUpAt),
          reactivateAt: serializeDate(project.lead.reactivateAt),
          createdAt: project.lead.createdAt.toISOString(),
          updatedAt: project.lead.updatedAt.toISOString(),
        }
      : null,
    tasks: project.tasks.map((task) => ({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      estimatedHours: task.estimatedHours,
      position: task.position,
      assignedToId: task.assignedToId,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      assignedTo: task.assignedTo,
      timeEntries: task.timeEntries.map((entry) => ({
        id: entry.id,
        taskId: entry.taskId,
        userId: entry.userId,
        hours: entry.hours,
        startedAt: serializeDate(entry.startedAt),
        endedAt: serializeDate(entry.endedAt),
        date: entry.date.toISOString(),
        notes: entry.notes,
        createdAt: entry.createdAt.toISOString(),
        user: entry.user,
      })),
    })),
    milestones: project.milestones.map((milestone) => ({
      id: milestone.id,
      projectId: milestone.projectId,
      type: milestone.type,
      amount: milestone.amount.toString(),
      dueAt: serializeDate(milestone.dueAt),
      paidAt: serializeDate(milestone.paidAt),
      createdAt: milestone.createdAt.toISOString(),
    })),
    maintenancePayments: project.maintenancePayments.map((payment) => ({
      id: payment.id,
      projectId: payment.projectId,
      month: payment.month,
      year: payment.year,
      amount: payment.amount.toString(),
      paidAt: serializeDate(payment.paidAt),
      createdAt: payment.createdAt.toISOString(),
    })),
  }
}

function buildProjectRevalidationPaths(projectId: string, leadId?: string | null): string[] {
  const paths = ['/admin/os/projects', `/admin/os/projects/${projectId}`]

  if (leadId) {
    paths.push('/admin/os/leads', `/admin/os/leads/${leadId}`)
  }

  return paths
}

export async function createProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = CreateProjectSchema.parse(input)
    const { startAmount, deliveryAmount } = splitMilestoneAmounts(parsed.agreedAmount)

    const project = await prisma.osProject.create({
      data: {
        businessName: parsed.businessName,
        contactName: parsed.contactName,
        contactPhone: parsed.contactPhone,
        contactEmail: parsed.contactEmail,
        name: parsed.name,
        description: parsed.description,
        serviceType: parsed.serviceType,
        agreedAmount: parsed.agreedAmount,
        monthlyRate: parsed.monthlyRate,
        estimatedEndDate: parsed.estimatedEndDate,
        leadId: parsed.leadId,
        milestones: {
          create: [
            {
              type: MilestoneType.INICIO,
              amount: startAmount,
            },
            {
              type: MilestoneType.ENTREGA,
              amount: deliveryAmount,
            },
          ],
        },
      },
      select: {
        id: true,
        leadId: true,
      },
    })

    for (const path of buildProjectRevalidationPaths(project.id, project.leadId)) {
      revalidatePath(path)
    }

    return ok({ id: project.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create project')
  }
}

export async function updateProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = UpdateProjectSchema.parse(input)
    const { projectId, ...data } = parsed

    const project = await prisma.osProject.update({
      where: { id: projectId },
      data,
      select: {
        id: true,
        leadId: true,
      },
    })

    for (const path of buildProjectRevalidationPaths(project.id, project.leadId)) {
      revalidatePath(path)
    }

    return ok({ id: project.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to update project')
  }
}

export async function updateProjectStatus(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = UpdateProjectStatusSchema.parse(input)

    const currentProject = await prisma.osProject.findUnique({
      where: { id: parsed.projectId },
      select: {
        id: true,
        leadId: true,
        maintenanceStartDate: true,
      },
    })

    if (!currentProject) {
      return fail('Project not found')
    }

    const now = new Date()
    const data: Prisma.OsProjectUpdateInput = {
      status: parsed.status,
    }

    if (parsed.status === OsProjectStatus.ENTREGADO) {
      data.deliveredAt = now
    }

    if (
      parsed.status === OsProjectStatus.EN_MANTENIMIENTO &&
      !currentProject.maintenanceStartDate
    ) {
      data.maintenanceStartDate = now
    }

    const project = await prisma.osProject.update({
      where: { id: parsed.projectId },
      data,
      select: {
        id: true,
        leadId: true,
      },
    })

    for (const path of buildProjectRevalidationPaths(project.id, project.leadId)) {
      revalidatePath(path)
    }

    return ok({ id: project.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to update project status')
  }
}

export async function convertLeadToProject(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = ConvertLeadToProjectSchema.parse(input)

    const project = await prisma.$transaction(async (tx) => {
      const lead = await tx.osLead.findUnique({
        where: { id: parsed.leadId },
        include: {
          project: {
            select: {
              id: true,
            },
          },
        },
      })

      if (!lead) {
        throw new Error('Lead not found')
      }

      if (lead.project) {
        throw new Error('Lead already has a linked project')
      }

      if (!lead.serviceType) {
        throw new Error('Lead must have a service type before converting to project')
      }

      const { startAmount, deliveryAmount } = splitMilestoneAmounts(parsed.agreedAmount)

      const createdProject = await tx.osProject.create({
        data: {
          leadId: lead.id,
          businessName: lead.businessName,
          contactName: lead.contactName ?? lead.businessName,
          contactPhone: lead.phone,
          contactEmail: lead.email,
          name: parsed.name,
          description: parsed.description,
          serviceType: lead.serviceType,
          agreedAmount: parsed.agreedAmount,
          monthlyRate: parsed.monthlyRate,
          estimatedEndDate: parsed.estimatedEndDate,
          milestones: {
            create: [
              {
                type: MilestoneType.INICIO,
                amount: startAmount,
              },
              {
                type: MilestoneType.ENTREGA,
                amount: deliveryAmount,
              },
            ],
          },
        },
        select: {
          id: true,
          leadId: true,
        },
      })

      if (lead.status !== LeadStatus.CERRADO) {
        await tx.osLead.update({
          where: { id: lead.id },
          data: {
            status: LeadStatus.CERRADO,
          },
        })
      }

      return createdProject
    })

    for (const path of buildProjectRevalidationPaths(project.id, project.leadId)) {
      revalidatePath(path)
    }

    return ok({ id: project.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to convert lead to project')
  }
}

export async function listProjects(): Promise<ActionResult<ReturnType<typeof serializeProjectListItem>[]>> {
  try {
    await requireSuperAdmin()

    const projects = await prisma.osProject.findMany({
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
        lead: {
          select: {
            id: true,
            businessName: true,
            status: true,
          },
        },
        milestones: {
          select: {
            id: true,
            paidAt: true,
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
            timeEntries: {
              select: {
                hours: true,
              },
            },
          },
        },
        maintenancePayments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return ok(projects.map(serializeProjectListItem))
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to list projects')
  }
}

export async function getProjectById(
  id: string
): Promise<ActionResult<ReturnType<typeof serializeProjectDetail>>> {
  try {
    await requireSuperAdmin()
    const projectId = ProjectIdSchema.parse(id)

    const project = await prisma.osProject.findUnique({
      where: { id: projectId },
      include: {
        lead: {
          select: {
            id: true,
            businessName: true,
            contactName: true,
            phone: true,
            email: true,
            industry: true,
            zone: true,
            source: true,
            instagramUrl: true,
            currentWebUrl: true,
            googleMapsUrl: true,
            status: true,
            serviceType: true,
            nextFollowUpAt: true,
            reactivateAt: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            timeEntries: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                date: 'desc',
              },
            },
          },
          orderBy: [
            {
              position: 'asc',
            },
            {
              createdAt: 'asc',
            },
          ],
        },
        milestones: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        maintenancePayments: {
          orderBy: [
            {
              year: 'desc',
            },
            {
              month: 'desc',
            },
          ],
        },
      },
    })

    if (!project) {
      return fail('Project not found')
    }

    return ok(serializeProjectDetail(project))
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to get project')
  }
}
