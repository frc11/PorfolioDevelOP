'use server'

import type { Prisma } from '@prisma/client'
import { TaskStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  CreateTaskSchema,
  ProjectIdSchema,
  ReorderTasksSchema,
  TaskIdSchema,
  UpdateTaskSchema,
  UserIdSchema,
} from './task.schemas'

type ProjectTaskRecord = Prisma.TaskGetPayload<{
  select: {
    id: true
    projectId: true
    title: true
    description: true
    status: true
    estimatedHours: true
    position: true
    assignedToId: true
    createdAt: true
    updatedAt: true
    approvalStatus: true
    rejectionReason: true
    assignedTo: {
      select: {
        id: true
        name: true
        email: true
      }
    }
    osTimeEntries: {
      select: {
        id: true
        hours: true
        date: true
        notes: true
        createdAt: true
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
}>

type UserTaskRecord = Prisma.TaskGetPayload<{
  select: {
    id: true
    projectId: true
    title: true
    description: true
    status: true
    estimatedHours: true
    position: true
    assignedToId: true
    createdAt: true
    updatedAt: true
    osTimeEntries: {
      select: {
        hours: true
      }
    }
    project: {
      select: {
        id: true
        name: true
        status: true
      }
    }
  }
}>

function shouldRevalidateDashboard(organizationId: string | null | undefined) {
  return Boolean(organizationId)
}

function revalidateTaskPaths(projectId: string, organizationId?: string | null) {
  revalidatePath('/admin/os/projects')
  revalidatePath(`/admin/os/projects/${projectId}`)
  revalidatePath(`/admin/os/projects/${projectId}/tasks`)
  revalidatePath(`/admin/os/projects/${projectId}/hours`)
  revalidatePath('/admin/os/team')

  if (shouldRevalidateDashboard(organizationId)) {
    revalidatePath('/dashboard/project')
  }
}

function serializeProjectTask(task: ProjectTaskRecord) {
  const totalHours = task.osTimeEntries.reduce((sum, entry) => sum + entry.hours, 0)

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    estimatedHours: task.estimatedHours,
    position: task.position ?? 0,
    assignedToId: task.assignedToId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    assignedTo: task.assignedTo,
    approvalStatus: task.approvalStatus ?? null,
    rejectionReason: task.rejectionReason ?? null,
    _count: {
      timeEntries: task.osTimeEntries.length,
    },
    totalHours,
    timeEntries: task.osTimeEntries.map((entry) => ({
      id: entry.id,
      hours: entry.hours,
      date: entry.date.toISOString(),
      notes: entry.notes,
      createdAt: entry.createdAt.toISOString(),
      user: entry.user,
    })),
  }
}

function serializeUserTask(task: UserTaskRecord) {
  const totalHours = task.osTimeEntries.reduce((sum, entry) => sum + entry.hours, 0)

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    estimatedHours: task.estimatedHours,
    position: task.position ?? 0,
    assignedToId: task.assignedToId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    _count: {
      timeEntries: task.osTimeEntries.length,
    },
    totalHours,
    project: task.project,
  }
}

export async function createTask(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = CreateTaskSchema.parse(input)

    const task = await prisma.$transaction(async (tx) => {
      const positionAggregate = await tx.task.aggregate({
        where: { projectId: parsed.projectId },
        _max: {
          position: true,
        },
      })

      return tx.task.create({
        data: {
          projectId: parsed.projectId,
          title: parsed.title,
          description: parsed.description ?? null,
          status: parsed.status ?? TaskStatus.TODO,
          estimatedHours: parsed.estimatedHours,
          assignedToId: parsed.assignedToId ?? null,
          position: (positionAggregate._max.position ?? -1) + 1,
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
    })

    revalidateTaskPaths(task.projectId, task.project.organizationId)
    return ok({ id: task.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create task')
  }
}

export async function updateTask(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = UpdateTaskSchema.parse(input)
    const { taskId, title, description, status, estimatedHours, assignedToId, position } = parsed

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(estimatedHours !== undefined ? { estimatedHours } : {}),
        ...(assignedToId !== undefined ? { assignedToId } : {}),
        ...(position !== undefined ? { position } : {}),
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

    revalidateTaskPaths(task.projectId, task.project.organizationId)
    return ok({ id: task.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to update task')
  }
}

export async function deleteTask(taskId: string): Promise<ActionResult<void>> {
  try {
    await requireSuperAdmin()
    const parsedTaskId = TaskIdSchema.parse(taskId)

    const task = await prisma.task.findUnique({
      where: { id: parsedTaskId },
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

    if (!task) {
      return fail('Task not found')
    }

    await prisma.task.delete({
      where: { id: parsedTaskId },
    })

    revalidateTaskPaths(task.projectId, task.project.organizationId)
    return ok<void>(undefined)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to delete task')
  }
}

export async function reorderTasks(
  input: unknown
): Promise<ActionResult<{ count: number }>> {
  try {
    await requireSuperAdmin()
    const parsed = ReorderTasksSchema.parse(input)
    const taskIds = parsed.tasks.map((task) => task.id)

    const existingTasks = await prisma.task.findMany({
      where: {
        id: {
          in: taskIds,
        },
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

    if (existingTasks.length !== parsed.tasks.length) {
      return fail('One or more tasks were not found')
    }

    const projectIds = new Set(existingTasks.map((task) => task.projectId))
    if (projectIds.size !== 1) {
      return fail('Tasks must belong to the same project')
    }

    const projectId = existingTasks[0]?.projectId
    if (!projectId) {
      return fail('Project not found')
    }

    await prisma.$transaction(
      parsed.tasks.map((task) =>
        prisma.task.update({
          where: { id: task.id },
          data: {
            position: task.position,
          },
        })
      )
    )

    revalidateTaskPaths(projectId, existingTasks[0]?.project.organizationId)
    return ok({ count: parsed.tasks.length })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to reorder tasks')
  }
}

export async function listTasksByProject(
  projectId: string
): Promise<ActionResult<ReturnType<typeof serializeProjectTask>[]>> {
  try {
    await requireSuperAdmin()
    const parsedProjectId = ProjectIdSchema.parse(projectId)

    const tasks = await prisma.task.findMany({
      where: { projectId: parsedProjectId },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        status: true,
        estimatedHours: true,
        position: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
        approvalStatus: true,
        rejectionReason: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        osTimeEntries: {
          select: {
            id: true,
            hours: true,
            date: true,
            notes: true,
            createdAt: true,
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
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    })

    return ok(tasks.map((task) => serializeProjectTask(task)))
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to list tasks by project')
  }
}

export async function listTasksByUser(
  userId: string
): Promise<ActionResult<ReturnType<typeof serializeUserTask>[]>> {
  try {
    await requireSuperAdmin()
    const parsedUserId = UserIdSchema.parse(userId)

    const tasks = await prisma.task.findMany({
      where: { assignedToId: parsedUserId },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        status: true,
        estimatedHours: true,
        position: true,
        assignedToId: true,
        createdAt: true,
        updatedAt: true,
        osTimeEntries: {
          select: {
            hours: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { position: 'asc' }],
    })

    return ok(tasks.map((task) => serializeUserTask(task)))
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to list tasks by user')
  }
}
