'use server'

import type { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import {
  CreateTimeEntrySchema,
  DateRangeSchema,
  EntryIdSchema,
  ProjectIdSchema,
  UpdateTimeEntrySchema,
  UserIdSchema,
} from './time-entry.schemas'

type ProjectEntryRecord = Prisma.OsTimeEntryGetPayload<{
  include: {
    task: {
      select: {
        id: true
        title: true
        projectId: true
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
}>

type UserEntryRecord = Prisma.OsTimeEntryGetPayload<{
  include: {
    task: {
      select: {
        id: true
        title: true
        project: {
          select: {
            id: true
            name: true
            status: true
          }
        }
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
}>

function revalidateTimeEntryPaths(projectId: string) {
  revalidatePath(`/admin/os/projects/${projectId}/hours`)
  revalidatePath('/admin/os/team')
}

function serializeProjectEntry(entry: ProjectEntryRecord) {
  return {
    id: entry.id,
    taskId: entry.taskId,
    userId: entry.userId,
    hours: entry.hours,
    date: entry.date.toISOString(),
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
    task: {
      id: entry.task.id,
      title: entry.task.title,
      projectId: entry.task.projectId,
    },
    user: entry.user,
  }
}

function serializeUserEntry(entry: UserEntryRecord) {
  return {
    id: entry.id,
    taskId: entry.taskId,
    userId: entry.userId,
    hours: entry.hours,
    date: entry.date.toISOString(),
    notes: entry.notes,
    createdAt: entry.createdAt.toISOString(),
    task: {
      id: entry.task.id,
      title: entry.task.title,
      project: entry.task.project,
    },
    user: entry.user,
  }
}

function groupEntriesByTask(entries: ProjectEntryRecord[]) {
  const groups = new Map<
    string,
    {
      taskId: string
      taskTitle: string
      projectId: string
      totalHours: number
      entries: ReturnType<typeof serializeProjectEntry>[]
    }
  >()

  for (const entry of entries) {
    const existingGroup = groups.get(entry.taskId)
    const serializedEntry = serializeProjectEntry(entry)

    if (existingGroup) {
      existingGroup.totalHours += entry.hours
      existingGroup.entries.push(serializedEntry)
      continue
    }

    groups.set(entry.taskId, {
      taskId: entry.task.id,
      taskTitle: entry.task.title,
      projectId: entry.task.projectId,
      totalHours: entry.hours,
      entries: [serializedEntry],
    })
  }

  return Array.from(groups.values())
}

export async function createTimeEntry(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireSuperAdmin()
    const parsed = CreateTimeEntrySchema.parse(input)

    const task = await prisma.task.findUnique({
      where: { id: parsed.taskId },
      select: {
        id: true,
        projectId: true,
      },
    })

    if (!task) {
      return fail('Task not found')
    }

    const entry = await prisma.osTimeEntry.create({
      data: {
        taskId: task.id,
        projectId: task.projectId,
        userId,
        hours: parsed.hours,
        date: parsed.date,
        notes: parsed.notes,
      },
      select: {
        id: true,
        projectId: true,
      },
    })

    revalidateTimeEntryPaths(entry.projectId ?? task.projectId)
    return ok({ id: entry.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create time entry')
  }
}

export async function updateTimeEntry(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireSuperAdmin()
    const parsed = UpdateTimeEntrySchema.parse(input)
    const { entryId, ...data } = parsed

    const existingEntry = await prisma.osTimeEntry.findUnique({
      where: { id: entryId },
      select: {
        id: true,
        task: {
          select: {
            projectId: true,
          },
        },
      },
    })

    if (!existingEntry) {
      return fail('Time entry not found')
    }

    const entry = await prisma.osTimeEntry.update({
      where: { id: entryId },
      data: {
        ...data,
        projectId: existingEntry.task.projectId,
      },
      select: {
        id: true,
        projectId: true,
        task: {
          select: {
            projectId: true,
          },
        },
      },
    })

    revalidateTimeEntryPaths(entry.projectId ?? entry.task.projectId)
    return ok({ id: entry.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to update time entry')
  }
}

export async function deleteTimeEntry(
  entryId: string
): Promise<ActionResult<void>> {
  try {
    await requireSuperAdmin()
    const parsedEntryId = EntryIdSchema.parse(entryId)

    const entry = await prisma.osTimeEntry.delete({
      where: { id: parsedEntryId },
      select: {
        id: true,
        projectId: true,
        task: {
          select: {
            projectId: true,
          },
        },
      },
    })

    revalidateTimeEntryPaths(entry.projectId ?? entry.task.projectId)
    return ok<void>(undefined)
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to delete time entry')
  }
}

export async function listTimeEntriesByProject(
  projectId: string
): Promise<ActionResult<ReturnType<typeof groupEntriesByTask>>> {
  try {
    await requireSuperAdmin()
    const parsedProjectId = ProjectIdSchema.parse(projectId)

    const entries = await prisma.osTimeEntry.findMany({
      where: {
        task: {
          projectId: parsedProjectId,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
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
    })

    return ok(groupEntriesByTask(entries))
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : 'Failed to list time entries by project'
    )
  }
}

export async function listTimeEntriesByUser(
  userId: string,
  dateRange?: {
    from?: Date | string | null
    to?: Date | string | null
  }
): Promise<ActionResult<ReturnType<typeof serializeUserEntry>[]>> {
  try {
    await requireSuperAdmin()
    const parsedUserId = UserIdSchema.parse(userId)
    const parsedDateRange = DateRangeSchema.parse(dateRange)

    const dateFilter: Prisma.DateTimeFilter = {}

    if (parsedDateRange?.from) {
      dateFilter.gte = parsedDateRange.from
    }

    if (parsedDateRange?.to) {
      dateFilter.lte = parsedDateRange.to
    }

    const entries = await prisma.osTimeEntry.findMany({
      where: {
        userId: parsedUserId,
        ...(parsedDateRange?.from || parsedDateRange?.to ? { date: dateFilter } : {}),
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
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
    })

    return ok(entries.map(serializeUserEntry))
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to list time entries by user')
  }
}
