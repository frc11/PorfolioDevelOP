import {
  OsProjectStatus,
  OsTaskStatus,
  Prisma,
  PrismaClient,
  ProjectStatus,
  TaskStatus,
} from '@prisma/client'

const prisma = new PrismaClient()

type OsProjectRecord = Prisma.OsProjectGetPayload<{
  include: {
    tasks: true
  }
}>

type OsTaskRecord = OsProjectRecord['tasks'][number]

type OsPaymentMilestoneRecord = Prisma.OsPaymentMilestoneGetPayload<{
  select: {
    id: true
    projectId: true
  }
}>

type OsMaintenancePaymentRecord = Prisma.OsMaintenancePaymentGetPayload<{
  select: {
    id: true
    projectId: true
  }
}>

type MigrationStats = {
  osProjectsMigrated: number
  projectsCreated: number
  projectsUpdated: number
  osTasksMigrated: number
  milestonesReassigned: number
  maintenancePaymentsReassigned: number
  timeEntriesReassigned: number
  organizationsCreated: number
}

function normalizeCompanyName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapOsProjectStatusToProjectStatus(status: OsProjectStatus): ProjectStatus {
  switch (status) {
    case OsProjectStatus.EN_DESARROLLO:
      return ProjectStatus.IN_PROGRESS
    case OsProjectStatus.EN_REVISION:
      return ProjectStatus.REVIEW
    case OsProjectStatus.ENTREGADO:
      return ProjectStatus.COMPLETED
    case OsProjectStatus.EN_MANTENIMIENTO:
      return ProjectStatus.COMPLETED
    case OsProjectStatus.CANCELADO:
      return ProjectStatus.PLANNING
  }
}

function mapOsTaskStatusToTaskStatus(status: OsTaskStatus): TaskStatus {
  switch (status) {
    case OsTaskStatus.PENDIENTE:
      return TaskStatus.TODO
    case OsTaskStatus.EN_PROGRESO:
      return TaskStatus.IN_PROGRESS
    case OsTaskStatus.COMPLETADA:
      return TaskStatus.DONE
  }
}

function resolveMaintenanceStartDate(project: OsProjectRecord): Date | null {
  if (project.maintenanceStartDate) {
    return project.maintenanceStartDate
  }

  if (project.status === OsProjectStatus.EN_MANTENIMIENTO) {
    return project.deliveredAt ?? project.startDate
  }

  return null
}

async function resolveOrganizationIdForProject(
  tx: Prisma.TransactionClient,
  project: OsProjectRecord,
  stats: MigrationStats
): Promise<string> {
  if (project.organizationId) {
    return project.organizationId
  }

  const normalizedBusinessName = normalizeCompanyName(project.businessName)
  const organizations = await tx.organization.findMany({
    select: {
      id: true,
      companyName: true,
    },
  })

  const matchingOrganization = organizations.find((organization) => {
    const normalizedOrganizationName = normalizeCompanyName(organization.companyName)

    return (
      normalizedOrganizationName === normalizedBusinessName ||
      normalizedOrganizationName.startsWith(normalizedBusinessName) ||
      normalizedBusinessName.startsWith(normalizedOrganizationName)
    )
  })

  if (matchingOrganization) {
    await tx.osProject.update({
      where: { id: project.id },
      data: {
        organizationId: matchingOrganization.id,
      },
    })

    return matchingOrganization.id
  }

  const organizationId = `os-org-${project.id}`
  await tx.organization.create({
    data: {
      id: organizationId,
      companyName: project.businessName,
      slug: `agency-os-${slugify(project.businessName)}-${project.id.toLowerCase()}`,
      n8nWorkflowIds: [],
      onboardingCompleted: false,
    },
  })

  await tx.osProject.update({
    where: { id: project.id },
    data: {
      organizationId,
    },
  })

  stats.organizationsCreated += 1

  return organizationId
}

async function findExistingUnifiedProject(
  tx: Prisma.TransactionClient,
  project: OsProjectRecord,
  organizationId: string
): Promise<{ id: string } | null> {
  const byLegacyId = await tx.project.findUnique({
    where: { id: project.id },
    select: { id: true },
  })

  if (byLegacyId) {
    return byLegacyId
  }

  if (project.leadId) {
    const byLead = await tx.project.findUnique({
      where: { osLeadId: project.leadId },
      select: { id: true },
    })

    if (byLead) {
      return byLead
    }
  }

  return tx.project.findFirst({
    where: {
      organizationId,
      name: project.name,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
    },
  })
}

async function upsertUnifiedProject(
  tx: Prisma.TransactionClient,
  project: OsProjectRecord,
  organizationId: string,
  stats: MigrationStats
) {
  const maintenanceStartDate = resolveMaintenanceStartDate(project)
  const data = {
    name: project.name,
    description: project.description,
    status: mapOsProjectStatusToProjectStatus(project.status),
    organizationId,
    agreedAmount: project.agreedAmount,
    monthlyRate: project.monthlyRate,
    maintenanceStartDate,
    deliveredAt: project.deliveredAt,
    estimatedEndDate: project.estimatedEndDate,
    osLeadId: project.leadId,
  }

  const existingProject = await findExistingUnifiedProject(tx, project, organizationId)

  if (existingProject) {
    stats.projectsUpdated += 1

    return tx.project.update({
      where: { id: existingProject.id },
      data,
      select: { id: true },
    })
  }

  stats.projectsCreated += 1

  return tx.project.create({
    data: {
      id: project.id,
      ...data,
    },
    select: { id: true },
  })
}

async function findExistingUnifiedTask(
  tx: Prisma.TransactionClient,
  task: OsTaskRecord,
  unifiedProjectId: string
): Promise<{ id: string } | null> {
  const byLegacyId = await tx.task.findUnique({
    where: { id: task.id },
    select: { id: true },
  })

  if (byLegacyId) {
    return byLegacyId
  }

  const byTitleAndPosition = await tx.task.findFirst({
    where: {
      projectId: unifiedProjectId,
      title: task.title,
      position: task.position,
      description: task.description,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
    },
  })

  if (byTitleAndPosition) {
    return byTitleAndPosition
  }

  return tx.task.findFirst({
    where: {
      projectId: unifiedProjectId,
      title: task.title,
    },
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
    },
  })
}

async function upsertUnifiedTask(
  tx: Prisma.TransactionClient,
  task: OsTaskRecord,
  unifiedProjectId: string
) {
  const data = {
    title: task.title,
    description: task.description,
    status: mapOsTaskStatusToTaskStatus(task.status),
    projectId: unifiedProjectId,
    estimatedHours: task.estimatedHours,
    position: task.position,
  }

  const existingTask = await findExistingUnifiedTask(tx, task, unifiedProjectId)

  if (existingTask) {
    return tx.task.update({
      where: { id: existingTask.id },
      data,
      select: { id: true },
    })
  }

  return tx.task.create({
    data: {
      id: task.id,
      ...data,
    },
    select: { id: true },
  })
}

async function reassignMilestones(
  tx: Prisma.TransactionClient,
  milestones: OsPaymentMilestoneRecord[],
  unifiedProjectId: string,
  stats: MigrationStats
) {
  for (const milestone of milestones) {
    if (milestone.projectId === unifiedProjectId) {
      continue
    }

    await tx.osPaymentMilestone.update({
      where: { id: milestone.id },
      data: {
        projectId: unifiedProjectId,
      },
    })

    stats.milestonesReassigned += 1
  }
}

async function reassignMaintenancePayments(
  tx: Prisma.TransactionClient,
  maintenancePayments: OsMaintenancePaymentRecord[],
  unifiedProjectId: string,
  stats: MigrationStats
) {
  for (const payment of maintenancePayments) {
    if (payment.projectId === unifiedProjectId) {
      continue
    }

    await tx.osMaintenancePayment.update({
      where: { id: payment.id },
      data: {
        projectId: unifiedProjectId,
      },
    })

    stats.maintenancePaymentsReassigned += 1
  }
}

async function reassignTimeEntries(
  tx: Prisma.TransactionClient,
  osTaskId: string,
  unifiedTaskId: string,
  unifiedProjectId: string,
  stats: MigrationStats
) {
  const timeEntries = await tx.osTimeEntry.findMany({
    where: {
      OR: [
        {
          taskId: osTaskId,
        },
        {
          taskId: unifiedTaskId,
          projectId: {
            not: unifiedProjectId,
          },
        },
      ],
    },
    select: {
      id: true,
      taskId: true,
      projectId: true,
    },
  })

  for (const timeEntry of timeEntries) {
    if (
      timeEntry.taskId === unifiedTaskId &&
      timeEntry.projectId === unifiedProjectId
    ) {
      continue
    }

    await tx.osTimeEntry.update({
      where: { id: timeEntry.id },
      data: {
        taskId: unifiedTaskId,
        projectId: unifiedProjectId,
      },
    })

    stats.timeEntriesReassigned += 1
  }
}

async function migrate() {
  const stats: MigrationStats = {
    osProjectsMigrated: 0,
    projectsCreated: 0,
    projectsUpdated: 0,
    osTasksMigrated: 0,
    milestonesReassigned: 0,
    maintenancePaymentsReassigned: 0,
    timeEntriesReassigned: 0,
    organizationsCreated: 0,
  }

  await prisma.$transaction(
    async (tx) => {
      const osProjects = await tx.osProject.findMany({
        include: {
          tasks: true,
        },
      })

      for (const osProject of osProjects) {
        const milestones = await tx.osPaymentMilestone.findMany({
          where: {
            projectId: osProject.id,
          },
          select: {
            id: true,
            projectId: true,
          },
        })
        const maintenancePayments = await tx.osMaintenancePayment.findMany({
          where: {
            projectId: osProject.id,
          },
          select: {
            id: true,
            projectId: true,
          },
        })
        const organizationId = await resolveOrganizationIdForProject(tx, osProject, stats)
        const unifiedProject = await upsertUnifiedProject(
          tx,
          osProject,
          organizationId,
          stats
        )

        stats.osProjectsMigrated += 1

        await reassignMilestones(tx, milestones, unifiedProject.id, stats)
        await reassignMaintenancePayments(
          tx,
          maintenancePayments,
          unifiedProject.id,
          stats
        )

        for (const osTask of osProject.tasks) {
          const unifiedTask = await upsertUnifiedTask(tx, osTask, unifiedProject.id)

          stats.osTasksMigrated += 1

          await reassignTimeEntries(
            tx,
            osTask.id,
            unifiedTask.id,
            unifiedProject.id,
            stats
          )
        }
      }
    },
    {
      maxWait: 10_000,
      timeout: 600_000,
    }
  )

  console.log('Migracion OsProject/OsTask -> Project/Task completada')
  console.log(`- ${stats.osProjectsMigrated} OsProjects migrados`)
  console.log(`- ${stats.projectsCreated} projects creados`)
  console.log(`- ${stats.projectsUpdated} projects actualizados`)
  console.log(`- ${stats.osTasksMigrated} OsTasks migrados a tasks`)
  console.log(`- ${stats.milestonesReassigned} milestones reasignados`)
  console.log(
    `- ${stats.maintenancePaymentsReassigned} maintenance payments reasignados`
  )
  console.log(`- ${stats.timeEntriesReassigned} time entries reasignadas`)
  console.log(`- ${stats.organizationsCreated} organizations creadas en fallback`)
}

migrate()
  .catch((error: unknown) => {
    console.error('Error migrando datos de OsProject/OsTask al modelo unificado:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
