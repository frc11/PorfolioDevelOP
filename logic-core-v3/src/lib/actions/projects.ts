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
  const clientId = (formData.get('clientId') as string | null) ?? ''
  const statusRaw = formData.get('status') as string | null

  if (!name) return 'El nombre del proyecto es obligatorio.'
  if (!clientId) return 'Debés seleccionar un cliente.'

  const status: ProjectStatus = isProjectStatus(statusRaw) ? statusRaw : 'PLANNING'

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) return 'Cliente no encontrado.'

  const project = await prisma.project.create({
    data: { name, description, status, clientId },
  })

  revalidatePath('/admin/projects')
  redirect(`/admin/projects/${project.id}`)
}

// ─── Project: Update ──────────────────────────────────────────────────────────

export async function updateProjectAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const projectId = (formData.get('projectId') as string | null) ?? ''
  const name = (formData.get('name') as string | null)?.trim() ?? ''
  const description = (formData.get('description') as string | null)?.trim() || null
  const clientId = (formData.get('clientId') as string | null) ?? ''
  const statusRaw = formData.get('status') as string | null

  if (!projectId) return 'ID de proyecto inválido.'
  if (!name) return 'El nombre del proyecto es obligatorio.'
  if (!clientId) return 'Debés seleccionar un cliente.'

  const status: ProjectStatus = isProjectStatus(statusRaw) ? statusRaw : 'PLANNING'

  const existing = await prisma.project.findUnique({ where: { id: projectId } })
  if (!existing) return 'Proyecto no encontrado.'

  await prisma.project.update({
    where: { id: projectId },
    data: { name, description, status, clientId },
  })

  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${projectId}`)
  redirect(`/admin/projects/${projectId}`)
}

// ─── Project: Delete ──────────────────────────────────────────────────────────

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const projectId = (formData.get('projectId') as string | null) ?? ''
  if (!projectId) return

  await prisma.project.delete({ where: { id: projectId } })

  revalidatePath('/admin/projects')
  redirect('/admin/projects')
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

  await prisma.task.create({
    data: { title, description, status, dueDate, projectId },
  })

  revalidatePath(`/admin/projects/${projectId}`)
  redirect(`/admin/projects/${projectId}`)
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

  revalidatePath(`/admin/projects/${projectId}`)
}

// ─── Task: Delete ─────────────────────────────────────────────────────────────

export async function deleteTaskAction(formData: FormData): Promise<void> {
  const taskId = (formData.get('taskId') as string | null) ?? ''
  const projectId = (formData.get('projectId') as string | null) ?? ''
  if (!taskId) return

  await prisma.task.delete({ where: { id: taskId } })

  revalidatePath(`/admin/projects/${projectId}`)
  redirect(`/admin/projects/${projectId}`)
}
