'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ProjectStatus, TaskStatus } from '@prisma/client'

// ─── Guards ───────────────────────────────────────────────────────────────────

function isProjectStatus(value: unknown): value is ProjectStatus {
  return Object.values(ProjectStatus).includes(value as ProjectStatus)
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus)
}

// ─── Project: Create ──────────────────────────────────────────────────────────

export async function createProjectAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const description = (formData.get('description') as string | null)?.trim() || null
  const organizationId = (formData.get('organizationId') as string | null) ?? ''
  const statusRaw = formData.get('status') as string | null

  if (!name) return 'El nombre del proyecto es obligatorio.'
  if (!organizationId) return 'Debés seleccionar un cliente.'

  const status: ProjectStatus = isProjectStatus(statusRaw) ? statusRaw : 'PLANNING'

  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org) return 'Cliente no encontrado.'

  let project: { id: string }
  try {
    project = await prisma.project.create({
      data: { name, description, status, organizationId },
    })
  } catch {
    return 'Error al crear el proyecto. Intentá de nuevo.'
  }

  revalidatePath('/admin/os/projects')
  redirect(`/admin/os/projects/${project.id}`)
}

// ─── Project: Update ──────────────────────────────────────────────────────────

export async function updateProjectAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const projectId = (formData.get('projectId') as string | null) ?? ''
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const description = (formData.get('description') as string | null)?.trim() || null
  const organizationId = (formData.get('organizationId') as string | null) ?? ''
  const statusRaw = formData.get('status') as string | null

  if (!projectId) return 'ID de proyecto inválido.'
  if (!name) return 'El nombre del proyecto es obligatorio.'
  if (!organizationId) return 'Debés seleccionar un cliente.'

  const status: ProjectStatus = isProjectStatus(statusRaw) ? statusRaw : 'PLANNING'

  const existing = await prisma.project.findUnique({ where: { id: projectId } })
  if (!existing) return 'Proyecto no encontrado.'

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { name, description, status, organizationId },
    })
  } catch {
    return 'Error al actualizar el proyecto. Intentá de nuevo.'
  }

  revalidatePath('/admin/os/projects')
  revalidatePath(`/admin/os/projects/${projectId}`)
  redirect(`/admin/os/projects/${projectId}`)
}

// ─── Project: Delete ──────────────────────────────────────────────────────────

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const projectId = (formData.get('projectId') as string | null) ?? ''
  if (!projectId) return

  await prisma.project.delete({ where: { id: projectId } })

  revalidatePath('/admin/os/projects')
  redirect('/admin/os/projects')
}

// ─── Task: Create ─────────────────────────────────────────────────────────────

export async function createTaskAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const projectId = (formData.get('projectId') as string | null) ?? ''
  const title = (formData.get('title') as string | null)?.trim() ?? ''
  const description = (formData.get('description') as string | null)?.trim() || null
  const statusRaw = formData.get('status') as string | null
  const dueDateStr = (formData.get('dueDate') as string | null) || null

  if (!projectId) return 'ID de proyecto inválido.'
  if (!title) return 'El título de la tarea es obligatorio.'

  const status: TaskStatus = isTaskStatus(statusRaw) ? statusRaw : 'TODO'
  const dueDate = dueDateStr ? new Date(dueDateStr) : null

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return 'Proyecto no encontrado.'

  try {
    await prisma.task.create({
      data: { title, description, status, dueDate, projectId },
    })
  } catch {
    return 'Error al crear la tarea. Intentá de nuevo.'
  }

  revalidatePath(`/admin/os/projects/${projectId}`)
  redirect(`/admin/os/projects/${projectId}`)
}

// ─── Task: Update status (inline) ─────────────────────────────────────────────

export async function updateTaskStatusAction(formData: FormData): Promise<void> {
  const taskId = (formData.get('taskId') as string | null) ?? ''
  const projectId = (formData.get('projectId') as string | null) ?? ''
  const statusRaw = formData.get('status') as string | null

  if (!taskId || !isTaskStatus(statusRaw)) return

  await prisma.task.update({
    where: { id: taskId },
    data: { status: statusRaw },
  })

  revalidatePath(`/admin/os/projects/${projectId}`)
}

// ─── Task: Send for client approval ───────────────────────────────────────────

export async function sendTaskForApprovalAction(formData: FormData): Promise<void> {
  const taskId = (formData.get('taskId') as string | null) ?? ''
  const projectId = (formData.get('projectId') as string | null) ?? ''
  if (!taskId) return

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  })
  if (!task?.project.organizationId) return
  const organizationId = task.project.organizationId

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { approvalStatus: 'PENDING_APPROVAL' },
    })

    await tx.message.create({
      data: {
        content: `📋 Tu entrega "${task.title}" está lista para revisión. Por favor, revisá y aprobá o solicitá cambios desde tu panel de proyecto.`,
        fromAdmin: true,
        organizationId,
      },
    })
  })

  revalidatePath(`/admin/os/projects/${projectId}`)
  revalidatePath('/dashboard/project')
  revalidatePath('/dashboard')
}

// ─── Task: Delete ─────────────────────────────────────────────────────────────

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const taskId = (formData.get('taskId') as string | null) ?? ''
  const projectId = (formData.get('projectId') as string | null) ?? ''
  if (!taskId) return

  await prisma.task.delete({ where: { id: taskId } })

  revalidatePath(`/admin/os/projects/${projectId}`)
  redirect(`/admin/os/projects/${projectId}`)
}
