'use server'

import {
  LeadStatus,
  MilestoneType,
  OsProjectStatus,
  OsServiceType,
  OsTaskStatus,
  Prisma,
  ProjectStatus,
  ServiceStatus,
  ServiceType,
  TaskStatus,
} from '@prisma/client'
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

const INTERNAL_ORGANIZATION_SLUG = 'agency-os-internal'
const INTERNAL_ORGANIZATION_NAME = 'Agency OS Internal'

type ProjectListRecord = Prisma.ProjectGetPayload<{
  include: {
    organization: {
      select: {
        id: true
        companyName: true
        slug: true
        services: {
          where: {
            status: 'ACTIVE'
          }
          orderBy: {
            startDate: 'desc'
          }
          take: 1
          select: {
            type: true
          }
        }
      }
    }
    tasks: {
      select: {
        id: true
        status: true
      }
    }
    paymentMilestones: {
      select: {
        id: true
        paidAt: true
        createdAt: true
      }
    }
    maintenancePayments: {
      select: {
        id: true
        createdAt: true
      }
    }
    timeEntries: {
      select: {
        id: true
        hours: true
        date: true
        createdAt: true
      }
    }
    osLead: {
      select: {
        id: true
        businessName: true
        contactName: true
        phone: true
        email: true
        status: true
        serviceType: true
        createdAt: true
        updatedAt: true
      }
    }
    _count: {
      select: {
        tasks: true
        timeEntries: true
      }
    }
  }
}>

type ProjectDetailRecord = Prisma.ProjectGetPayload<{
  include: {
    organization: {
      select: {
        id: true
        companyName: true
        slug: true
        services: {
          where: {
            status: 'ACTIVE'
          }
          orderBy: {
            startDate: 'desc'
          }
          take: 1
          select: {
            type: true
          }
        }
      }
    }
    tasks: {
      orderBy: {
        position: 'asc'
      }
    }
    paymentMilestones: {
      orderBy: {
        createdAt: 'asc'
      }
    }
    maintenancePayments: {
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    }
    timeEntries: {
      include: {
        task: {
          select: {
            id: true
            title: true
          }
        }
        user: {
          select: {
            id: true
            name: true
            email: true
          }
        }
      }
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    }
    osLead: {
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
  }
}>

type ProjectOrganization = {
  id: string
  companyName: string
  slug: string
}

type LegacyProjectContext = {
  organization: ProjectOrganization
  normalizedServiceType: ServiceType | null
  businessName?: string | null
  contactName?: string | null
  contactPhone?: string | null
  contactEmail?: string | null
}

function serializeDate(value: Date | null): string | null {
  return value ? value.toISOString() : null
}

function splitMilestoneAmounts(totalAmount: number) {
  const totalCents = Math.round(totalAmount * 100)
  const startCents = Math.floor(totalCents / 2)
  const deliveryCents = totalCents - startCents

  return {
    startAmount: startCents / 100,
    deliveryAmount: deliveryCents / 100,
  }
}

function isInternalOrganization(organization: Pick<ProjectOrganization, 'slug'>): boolean {
  return organization.slug === INTERNAL_ORGANIZATION_SLUG
}

function normalizeServiceTypeInput(
  value: ServiceType | OsServiceType | null | undefined
): ServiceType | null {
  if (!value) {
    return null
  }

  switch (value) {
    case ServiceType.WEB_DEV:
    case ServiceType.AI:
    case ServiceType.AUTOMATION:
    case ServiceType.SOFTWARE:
      return value
    case OsServiceType.WEB:
      return ServiceType.WEB_DEV
    case OsServiceType.AI_AGENT:
      return ServiceType.AI
    case OsServiceType.AUTOMATION:
      return ServiceType.AUTOMATION
    case OsServiceType.CUSTOM_SOFTWARE:
      return ServiceType.SOFTWARE
  }
}

function mapPortalServiceTypeToLegacy(type: ServiceType): OsServiceType {
  switch (type) {
    case ServiceType.WEB_DEV:
      return OsServiceType.WEB
    case ServiceType.AI:
      return OsServiceType.AI_AGENT
    case ServiceType.AUTOMATION:
      return OsServiceType.AUTOMATION
    case ServiceType.SOFTWARE:
      return OsServiceType.CUSTOM_SOFTWARE
  }
}

function mapLegacyServiceTypeToPortal(type: OsServiceType | null | undefined): ServiceType | null {
  if (!type) {
    return null
  }

  return normalizeServiceTypeInput(type)
}

function normalizeProjectStatus(value: ProjectStatus | OsProjectStatus): ProjectStatus {
  switch (value) {
    case ProjectStatus.PLANNING:
    case ProjectStatus.IN_PROGRESS:
    case ProjectStatus.REVIEW:
    case ProjectStatus.COMPLETED:
      return value
    case OsProjectStatus.EN_DESARROLLO:
      return ProjectStatus.IN_PROGRESS
    case OsProjectStatus.EN_REVISION:
      return ProjectStatus.REVIEW
    case OsProjectStatus.ENTREGADO:
    case OsProjectStatus.EN_MANTENIMIENTO:
      return ProjectStatus.COMPLETED
    case OsProjectStatus.CANCELADO:
      return ProjectStatus.PLANNING
  }
}

function mapProjectStatusToLegacy(
  status: ProjectStatus,
  maintenanceStartDate: Date | null
): OsProjectStatus {
  switch (status) {
    case ProjectStatus.PLANNING:
    case ProjectStatus.IN_PROGRESS:
      return OsProjectStatus.EN_DESARROLLO
    case ProjectStatus.REVIEW:
      return OsProjectStatus.EN_REVISION
    case ProjectStatus.COMPLETED:
      return maintenanceStartDate
        ? OsProjectStatus.EN_MANTENIMIENTO
        : OsProjectStatus.ENTREGADO
  }
}

function mapTaskStatusToLegacy(status: TaskStatus): OsTaskStatus {
  switch (status) {
    case TaskStatus.TODO:
      return OsTaskStatus.PENDIENTE
    case TaskStatus.IN_PROGRESS:
      return OsTaskStatus.EN_PROGRESO
    case TaskStatus.DONE:
      return OsTaskStatus.COMPLETADA
  }
}

async function ensureInternalOrganization(
  tx: Prisma.TransactionClient
): Promise<ProjectOrganization> {
  const existingOrganization = await tx.organization.findUnique({
    where: {
      slug: INTERNAL_ORGANIZATION_SLUG,
    },
    select: {
      id: true,
      companyName: true,
      slug: true,
    },
  })

  if (existingOrganization) {
    return existingOrganization
  }

  return tx.organization.create({
    data: {
      companyName: INTERNAL_ORGANIZATION_NAME,
      slug: INTERNAL_ORGANIZATION_SLUG,
      n8nWorkflowIds: [],
      onboardingCompleted: false,
    },
    select: {
      id: true,
      companyName: true,
      slug: true,
    },
  })
}

async function resolveProjectOrganization(
  tx: Prisma.TransactionClient,
  organizationId?: string | null
): Promise<ProjectOrganization> {
  if (!organizationId) {
    return ensureInternalOrganization(tx)
  }

  const organization = await tx.organization.findUnique({
    where: {
      id: organizationId,
    },
    select: {
      id: true,
      companyName: true,
      slug: true,
    },
  })

  if (!organization) {
    throw new Error('Organization not found')
  }

  return organization
}

async function syncOrganizationService(
  tx: Prisma.TransactionClient,
  organization: ProjectOrganization,
  serviceType: ServiceType | null
) {
  if (!serviceType || isInternalOrganization(organization)) {
    return
  }

  const existingService = await tx.service.findFirst({
    where: {
      organizationId: organization.id,
      type: serviceType,
    },
    orderBy: {
      startDate: 'desc',
    },
  })

  if (!existingService) {
    await tx.service.create({
      data: {
        organizationId: organization.id,
        type: serviceType,
        status: ServiceStatus.ACTIVE,
      },
    })
    return
  }

  if (existingService.status !== ServiceStatus.ACTIVE) {
    await tx.service.update({
      where: {
        id: existingService.id,
      },
      data: {
        status: ServiceStatus.ACTIVE,
      },
    })
  }
}

async function createDefaultMilestones(
  tx: Prisma.TransactionClient,
  projectId: string,
  agreedAmount: number | Prisma.Decimal | null | undefined
) {
  if (agreedAmount === null || agreedAmount === undefined) {
    return
  }

  const numericAmount =
    typeof agreedAmount === 'number'
      ? agreedAmount
      : Number(agreedAmount.toString())

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return
  }

  const existingMilestones = await tx.osPaymentMilestone.count({
    where: {
      projectId,
    },
  })

  if (existingMilestones > 0) {
    return
  }

  const { startAmount, deliveryAmount } = splitMilestoneAmounts(numericAmount)

  await tx.osPaymentMilestone.createMany({
    data: [
      {
        projectId,
        type: MilestoneType.INICIO,
        amount: startAmount,
      },
      {
        projectId,
        type: MilestoneType.ENTREGA,
        amount: deliveryAmount,
      },
    ],
  })
}

async function syncLegacyProjectMirror(
  tx: Prisma.TransactionClient,
  projectId: string,
  context: LegacyProjectContext
) {
  const project = await tx.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      osLead: {
        select: {
          id: true,
          businessName: true,
          contactName: true,
          phone: true,
          email: true,
          serviceType: true,
        },
      },
    },
  })

  if (!project) {
    throw new Error('Project not found')
  }

  const derivedPortalServiceType =
    context.normalizedServiceType ??
    mapLegacyServiceTypeToPortal(project.osLead?.serviceType)
  const legacyServiceType = derivedPortalServiceType
    ? mapPortalServiceTypeToLegacy(derivedPortalServiceType)
    : project.osLead?.serviceType ?? OsServiceType.CUSTOM_SOFTWARE
  const businessName =
    context.businessName?.trim() ||
    project.osLead?.businessName ||
    (isInternalOrganization(context.organization)
      ? 'Proyecto interno Agency OS'
      : context.organization.companyName)
  const contactName =
    context.contactName?.trim() ||
    project.osLead?.contactName ||
    businessName
  const contactPhone = context.contactPhone ?? project.osLead?.phone ?? null
  const contactEmail = context.contactEmail ?? project.osLead?.email ?? null

  await tx.osProject.upsert({
    where: {
      id: project.id,
    },
    create: {
      id: project.id,
      leadId: project.osLeadId,
      businessName,
      contactName,
      contactPhone,
      contactEmail,
      organizationId: isInternalOrganization(context.organization)
        ? null
        : context.organization.id,
      name: project.name,
      description: project.description,
      serviceType: legacyServiceType,
      status: mapProjectStatusToLegacy(project.status, project.maintenanceStartDate),
      agreedAmount: project.agreedAmount ?? new Prisma.Decimal(0),
      monthlyRate: project.monthlyRate,
      maintenanceStartDate: project.maintenanceStartDate,
      estimatedEndDate: project.estimatedEndDate,
      deliveredAt: project.deliveredAt,
    },
    update: {
      leadId: project.osLeadId,
      businessName,
      contactName,
      contactPhone,
      contactEmail,
      organizationId: isInternalOrganization(context.organization)
        ? null
        : context.organization.id,
      name: project.name,
      description: project.description,
      serviceType: legacyServiceType,
      status: mapProjectStatusToLegacy(project.status, project.maintenanceStartDate),
      agreedAmount: project.agreedAmount ?? new Prisma.Decimal(0),
      monthlyRate: project.monthlyRate,
      maintenanceStartDate: project.maintenanceStartDate,
      estimatedEndDate: project.estimatedEndDate,
      deliveredAt: project.deliveredAt,
    },
  })
}

function deriveLegacyServiceType(project: {
  osLead: {
    serviceType: OsServiceType | null
  } | null
  organization: {
    services: Array<{
      type: ServiceType
    }>
  }
}): OsServiceType | null {
  if (project.osLead?.serviceType) {
    return project.osLead.serviceType
  }

  const activeServiceType = project.organization.services[0]?.type
  if (!activeServiceType) {
    return null
  }

  return mapPortalServiceTypeToLegacy(activeServiceType)
}

function deriveProjectStartDate(project: {
  osLead: {
    createdAt: Date
  } | null
  paymentMilestones: Array<{
    createdAt: Date
  }>
  timeEntries: Array<{
    date: Date
    createdAt: Date
  }>
  maintenancePayments: Array<{
    createdAt: Date
  }>
}): Date | null {
  const candidates: Date[] = []

  if (project.osLead?.createdAt) {
    candidates.push(project.osLead.createdAt)
  }

  for (const milestone of project.paymentMilestones) {
    candidates.push(milestone.createdAt)
  }

  for (const entry of project.timeEntries) {
    candidates.push(entry.date)
    candidates.push(entry.createdAt)
  }

  for (const payment of project.maintenancePayments) {
    candidates.push(payment.createdAt)
  }

  if (candidates.length === 0) {
    return null
  }

  return new Date(Math.min(...candidates.map((candidate) => candidate.getTime())))
}

function deriveProjectActivityAt(project: ProjectListRecord): number {
  const timestamps = [
    project.deliveredAt?.getTime() ?? 0,
    project.estimatedEndDate?.getTime() ?? 0,
    project.maintenanceStartDate?.getTime() ?? 0,
    project.osLead?.updatedAt.getTime() ?? 0,
    ...project.paymentMilestones.map((milestone) => milestone.createdAt.getTime()),
    ...project.maintenancePayments.map((payment) => payment.createdAt.getTime()),
    ...project.timeEntries.flatMap((entry) => [entry.date.getTime(), entry.createdAt.getTime()]),
  ]

  return Math.max(...timestamps, 0)
}

function buildProjectRevalidationPaths(input: {
  projectId: string
  leadId?: string | null
  organization?: Pick<ProjectOrganization, 'slug'> | null
}) {
  const paths = [
    '/admin/os/projects',
    `/admin/os/projects/${input.projectId}`,
    `/admin/os/projects/${input.projectId}/tasks`,
    `/admin/os/projects/${input.projectId}/hours`,
    `/admin/os/projects/${input.projectId}/payments`,
  ]

  if (input.leadId) {
    paths.push('/admin/os/leads', `/admin/os/leads/${input.leadId}`)
  }

  if (input.organization && !isInternalOrganization(input.organization)) {
    paths.push('/dashboard/project')
  }

  return paths
}

function serializeProjectListItem(project: ProjectListRecord) {
  const normalizedServiceType =
    mapLegacyServiceTypeToPortal(project.osLead?.serviceType) ??
    project.organization.services[0]?.type ??
    null
  const businessName = isInternalOrganization(project.organization)
    ? 'Proyecto interno Agency OS'
    : project.organization.companyName
  const contactName = project.osLead?.contactName ?? businessName
  const completedTasks = project.tasks.filter((task) => task.status === TaskStatus.DONE).length
  const totalTrackedHours = project.timeEntries.reduce((total, entry) => total + entry.hours, 0)

  return {
    id: project.id,
    leadId: project.osLeadId,
    businessName,
    contactName,
    contactPhone: project.osLead?.phone ?? null,
    contactEmail: project.osLead?.email ?? null,
    organizationId: isInternalOrganization(project.organization)
      ? null
      : project.organization.id,
    name: project.name,
    description: project.description,
    serviceType: normalizedServiceType,
    status: project.status,
    legacyStatus: mapProjectStatusToLegacy(project.status, project.maintenanceStartDate),
    agreedAmount: project.agreedAmount?.toString() ?? null,
    monthlyRate: project.monthlyRate?.toString() ?? null,
    maintenanceStartDate: serializeDate(project.maintenanceStartDate),
    startDate: serializeDate(deriveProjectStartDate(project)),
    estimatedEndDate: serializeDate(project.estimatedEndDate),
    deliveredAt: serializeDate(project.deliveredAt),
    _count: {
      tasks: project._count.tasks,
      timeEntries: project._count.timeEntries,
    },
    completedTasks,
    totalTrackedHours,
    milestoneSummary: {
      total: project.paymentMilestones.length,
      paid: project.paymentMilestones.filter((milestone) => milestone.paidAt).length,
    },
    maintenancePaymentsCount: project.maintenancePayments.length,
    lead: project.osLead
      ? {
          id: project.osLead.id,
          businessName: project.osLead.businessName,
          status: project.osLead.status,
          serviceType: mapLegacyServiceTypeToPortal(project.osLead.serviceType),
        }
      : null,
    isInternal: isInternalOrganization(project.organization),
    sortTimestamp: deriveProjectActivityAt(project),
  }
}

function serializeProjectDetail(project: ProjectDetailRecord) {
  const normalizedServiceType =
    mapLegacyServiceTypeToPortal(project.osLead?.serviceType) ??
    project.organization.services[0]?.type ??
    null
  const businessName = isInternalOrganization(project.organization)
    ? 'Proyecto interno Agency OS'
    : project.organization.companyName

  return {
    id: project.id,
    leadId: project.osLeadId,
    businessName,
    contactName: project.osLead?.contactName ?? businessName,
    contactPhone: project.osLead?.phone ?? null,
    contactEmail: project.osLead?.email ?? null,
    organization: {
      id: isInternalOrganization(project.organization) ? null : project.organization.id,
      companyName: project.organization.companyName,
      slug: project.organization.slug,
      isInternal: isInternalOrganization(project.organization),
    },
    name: project.name,
    description: project.description,
    serviceType: normalizedServiceType,
    status: project.status,
    legacyStatus: mapProjectStatusToLegacy(project.status, project.maintenanceStartDate),
    agreedAmount: project.agreedAmount?.toString() ?? null,
    monthlyRate: project.monthlyRate?.toString() ?? null,
    maintenanceStartDate: serializeDate(project.maintenanceStartDate),
    startDate: serializeDate(deriveProjectStartDate(project)),
    estimatedEndDate: serializeDate(project.estimatedEndDate),
    deliveredAt: serializeDate(project.deliveredAt),
    lead: project.osLead
      ? {
          ...project.osLead,
          nextFollowUpAt: serializeDate(project.osLead.nextFollowUpAt),
          reactivateAt: serializeDate(project.osLead.reactivateAt),
          createdAt: project.osLead.createdAt.toISOString(),
          updatedAt: project.osLead.updatedAt.toISOString(),
        }
      : null,
    tasks: project.tasks.map((task) => ({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      legacyStatus: mapTaskStatusToLegacy(task.status),
      dueDate: serializeDate(task.dueDate),
      approvalStatus: task.approvalStatus,
      estimatedHours: task.estimatedHours,
      position: task.position ?? 0,
    })),
    milestones: project.paymentMilestones.map((milestone) => ({
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
    timeEntries: project.timeEntries.map((entry) => ({
      id: entry.id,
      taskId: entry.taskId,
      projectId: entry.projectId,
      userId: entry.userId,
      hours: entry.hours,
      startedAt: serializeDate(entry.startedAt),
      endedAt: serializeDate(entry.endedAt),
      date: entry.date.toISOString(),
      notes: entry.notes,
      createdAt: entry.createdAt.toISOString(),
      task: entry.task,
      user: entry.user,
    })),
    totalHoursWorked: project.timeEntries.reduce((total, entry) => total + entry.hours, 0),
  }
}

export async function createProject(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = CreateProjectSchema.parse(input)

    const project = await prisma.$transaction(async (tx) => {
      const organization = await resolveProjectOrganization(tx, parsed.organizationId)
      const normalizedServiceType = normalizeServiceTypeInput(parsed.serviceType)

      await syncOrganizationService(tx, organization, normalizedServiceType)

      const createdProject = await tx.project.create({
        data: {
          name: parsed.name,
          description: parsed.description,
          organizationId: organization.id,
          agreedAmount: parsed.agreedAmount,
          monthlyRate: parsed.monthlyRate,
          estimatedEndDate: parsed.estimatedEndDate,
          osLeadId: parsed.leadId,
        },
        select: {
          id: true,
          osLeadId: true,
        },
      })

      await syncLegacyProjectMirror(tx, createdProject.id, {
        organization,
        normalizedServiceType,
        businessName: parsed.businessName ?? null,
        contactName: parsed.contactName ?? null,
        contactPhone: parsed.contactPhone ?? null,
        contactEmail: parsed.contactEmail ?? null,
      })

      await createDefaultMilestones(tx, createdProject.id, parsed.agreedAmount)

      return {
        id: createdProject.id,
        leadId: createdProject.osLeadId,
        organization,
      }
    })

    for (const path of buildProjectRevalidationPaths({
      projectId: project.id,
      leadId: project.leadId,
      organization: project.organization,
    })) {
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

    const project = await prisma.$transaction(async (tx) => {
      const currentProject = await tx.project.findUnique({
        where: {
          id: projectId,
        },
        select: {
          id: true,
          osLeadId: true,
          organizationId: true,
        },
      })

      if (!currentProject) {
        throw new Error('Project not found')
      }

      const organization = await resolveProjectOrganization(
        tx,
        data.organizationId !== undefined
          ? data.organizationId
          : currentProject.organizationId
      )
      const normalizedServiceType = normalizeServiceTypeInput(data.serviceType)

      await syncOrganizationService(tx, organization, normalizedServiceType)

      const updatedProject = await tx.project.update({
        where: {
          id: projectId,
        },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.organizationId !== undefined ? { organizationId: organization.id } : {}),
          ...(data.agreedAmount !== undefined ? { agreedAmount: data.agreedAmount } : {}),
          ...(data.monthlyRate !== undefined ? { monthlyRate: data.monthlyRate } : {}),
          ...(data.estimatedEndDate !== undefined
            ? { estimatedEndDate: data.estimatedEndDate }
            : {}),
          ...(data.leadId !== undefined ? { osLeadId: data.leadId } : {}),
        },
        select: {
          id: true,
          osLeadId: true,
        },
      })

      await syncLegacyProjectMirror(tx, updatedProject.id, {
        organization,
        normalizedServiceType,
        businessName: data.businessName ?? null,
        contactName: data.contactName ?? null,
        contactPhone: data.contactPhone ?? null,
        contactEmail: data.contactEmail ?? null,
      })

      return {
        id: updatedProject.id,
        leadId: updatedProject.osLeadId,
        organization,
      }
    })

    for (const path of buildProjectRevalidationPaths({
      projectId: project.id,
      leadId: project.leadId,
      organization: project.organization,
    })) {
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

    const project = await prisma.$transaction(async (tx) => {
      const currentProject = await tx.project.findUnique({
        where: {
          id: parsed.projectId,
        },
        include: {
          organization: {
            select: {
              id: true,
              companyName: true,
              slug: true,
            },
          },
        },
      })

      if (!currentProject) {
        throw new Error('Project not found')
      }

      const normalizedStatus = normalizeProjectStatus(parsed.status)
      const updatedProject = await tx.project.update({
        where: {
          id: parsed.projectId,
        },
        data: {
          status: normalizedStatus,
          ...(normalizedStatus === ProjectStatus.COMPLETED
            ? { deliveredAt: new Date() }
            : {}),
        },
        select: {
          id: true,
          osLeadId: true,
        },
      })

      await syncLegacyProjectMirror(tx, updatedProject.id, {
        organization: currentProject.organization,
        normalizedServiceType: null,
      })

      return {
        id: updatedProject.id,
        leadId: updatedProject.osLeadId,
        organization: currentProject.organization,
      }
    })

    for (const path of buildProjectRevalidationPaths({
      projectId: project.id,
      leadId: project.leadId,
      organization: project.organization,
    })) {
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
        where: {
          id: parsed.leadId,
        },
        include: {
          project: {
            select: {
              id: true,
            },
          },
          osProject: {
            select: {
              id: true,
            },
          },
        },
      })

      if (!lead) {
        throw new Error('Lead not found')
      }

      if (lead.project || lead.osProject) {
        throw new Error('Lead already has a linked project')
      }

      const organization = await resolveProjectOrganization(tx, parsed.organizationId)
      const normalizedServiceType = mapLegacyServiceTypeToPortal(lead.serviceType)

      await syncOrganizationService(tx, organization, normalizedServiceType)

      const createdProject = await tx.project.create({
        data: {
          name: parsed.name,
          description: parsed.description,
          organizationId: organization.id,
          agreedAmount: parsed.agreedAmount,
          monthlyRate: parsed.monthlyRate,
          estimatedEndDate: parsed.estimatedEndDate,
        },
        select: {
          id: true,
        },
      })

      const linkedProject = await tx.project.update({
        where: {
          id: createdProject.id,
        },
        data: {
          osLeadId: lead.id,
        },
        select: {
          id: true,
          osLeadId: true,
        },
      })

      await tx.osLead.update({
        where: {
          id: lead.id,
        },
        data: {
          status: LeadStatus.CERRADO,
        },
      })

      await syncLegacyProjectMirror(tx, linkedProject.id, {
        organization,
        normalizedServiceType,
        businessName: lead.businessName,
        contactName: lead.contactName,
        contactPhone: lead.phone,
        contactEmail: lead.email,
      })

      await createDefaultMilestones(tx, linkedProject.id, parsed.agreedAmount)

      return {
        id: linkedProject.id,
        leadId: linkedProject.osLeadId,
        organization,
      }
    })

    for (const path of buildProjectRevalidationPaths({
      projectId: project.id,
      leadId: project.leadId,
      organization: project.organization,
    })) {
      revalidatePath(path)
    }

    return ok({ id: project.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to convert lead to project')
  }
}

export async function listProjects(): Promise<
  ActionResult<
    Array<
      Omit<ReturnType<typeof serializeProjectListItem>, 'sortTimestamp'>
    >
  >
> {
  try {
    await requireSuperAdmin()

    const projects = await prisma.project.findMany({
      include: {
        organization: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            services: {
              where: {
                status: ServiceStatus.ACTIVE,
              },
              orderBy: {
                startDate: 'desc',
              },
              take: 1,
              select: {
                type: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        paymentMilestones: {
          select: {
            id: true,
            paidAt: true,
            createdAt: true,
          },
        },
        maintenancePayments: {
          select: {
            id: true,
            createdAt: true,
          },
        },
        timeEntries: {
          select: {
            id: true,
            hours: true,
            date: true,
            createdAt: true,
          },
        },
        osLead: {
          select: {
            id: true,
            businessName: true,
            contactName: true,
            phone: true,
            email: true,
            status: true,
            serviceType: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            timeEntries: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const serializedProjects = projects
      .map(serializeProjectListItem)
      .sort((left, right) => right.sortTimestamp - left.sortTimestamp)
      .map(({ sortTimestamp, ...project }) => project)

    return ok(serializedProjects)
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

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        organization: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            services: {
              where: {
                status: ServiceStatus.ACTIVE,
              },
              orderBy: {
                startDate: 'desc',
              },
              take: 1,
              select: {
                type: true,
              },
            },
          },
        },
        tasks: {
          orderBy: {
            position: 'asc',
          },
        },
        paymentMilestones: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        maintenancePayments: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        },
        timeEntries: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        },
        osLead: {
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
