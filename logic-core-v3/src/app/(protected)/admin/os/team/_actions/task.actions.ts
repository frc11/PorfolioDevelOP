'use server'

import type { Prisma } from '@prisma/client'
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

type ProjectTaskRecord = Prisma.OsTaskGetPayload<{
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
    assignedTo: {
      select: {
        id: true
        name: true
        email: true
      }
    }
    _count: {
      select: {
        timeEntries: true
      }
    }
    timeEntries: {
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

type UserTaskRecord = Prisma.OsTaskGetPayload<{
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
    _count: {
      select: {
        timeEntries: true
      }
    }
    timeEntries: {
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

function revalidateTaskPaths(projectId: string) {
  revalidatePath('/admin/os/projects')
  revalidatePath(`/admin/os/projects/${projectId}`)
  revalidatePath(`/admin/os/projects/${projectId}/tasks`)
  revalidatePath(`/admin/os/projects/${projectId}/hours`)
  revalidatePath('/admin/os/team')
}

function serializeProjectTask(task: ProjectTaskRecord) {
  const totalHours = task.timeEntries.reduce((sum, entry) => sum + entry.hours, 0)

  return {
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
    _count: {
      timeEntries: task._count.timeEntries,
    },
    totalHours,
    timeEntries: task.timeEntries.map((entry) => ({
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
  const totalHours = task.timeEntries.reduce((sum, entry) => sum + entry.hours, 0)

  return {
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
    _count: {
      timeEntries: task._count.timeEntries,
    },
    totalHours,
    project: task.project,
  }
}

export async function createTask(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = CreateTaskSchema.parse(input)

    const positionAggregate = await prisma.osTask.aggregate({
      where: { projectId: parsed.projectId },
      _max: {
        position: true,
      },
    })

    const task = await prisma.osTask.create({
      data: {
        projectId: parsed.projectId,
        title: parsed.title,
        description: parsed.description,
        status: parsed.status,
        estimatedHours: parsed.estimatedHours,
        assignedToId: parsed.assignedToId,
        position: (positionAggregate._max.position ?? -1) + 1,
      },
      select: {
        id: true,
        projectId: true,
      },
    })

    revalidateTaskPaths(task.projectId)
    return ok({ id: task.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create task')
  }
}

export async function updateTask(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = UpdateTaskSchema.parse(input)
    const { taskId, ...data } = parsed

    const task = await prisma.osTask.update({
      where: { id: taskId },
      data,
      select: {
        id: true,
        projectId: true,
      },
    })

    revalidateTaskPaths(task.projectId)
    return ok({ id: task.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to update task')
  }
}

export async function deleteTask(taskId: string): Promise<ActionResult<void>> {
  try {
    await requireSuperAdmin()
    const parsedTaskId = TaskIdSchema.parse(taskId)

    const task = await prisma.osTask.delete({
      where: { id: parsedTaskId },
      select: {
        id: true,
        projectId: true,
      },
    })

    revalidateTaskPaths(task.projectId)
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

    const existingTasks = await prisma.osTask.findMany({
      where: {
        id: {
          in: taskIds,
        },
      },
      select: {
        id: true,
        projectId: true,
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
        prisma.osTask.update({
          where: { id: task.id },
          data: {
            position: task.position,
          },
        })
      )
    )

    revalidateTaskPaths(projectId)
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

    const tasks = await prisma.osTask.findMany({
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
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            timeEntries: true,
          },
        },
        timeEntries: {
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
        },
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    })

    return ok(tasks.map(serializeProjectTask))
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

    const tasks = await prisma.osTask.findMany({
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
        _count: {
          select: {
            timeEntries: true,
          },
        },
        timeEntries: {
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

    return ok(tasks.map(serializeUserTask))
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to list tasks by user')
  }
}
