'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ServiceType, ServiceStatus } from '@prisma/client'

// ─── Guards ───────────────────────────────────────────────────────────────────

function isServiceType(value: unknown): value is ServiceType {
  return Object.values(ServiceType).includes(value as ServiceType)
}

function isServiceStatus(value: unknown): value is ServiceStatus {
  return Object.values(ServiceStatus).includes(value as ServiceStatus)
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createServiceAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const organizationId = (formData.get('organizationId') as string | null) ?? ''
  const typeRaw = formData.get('type') as string | null
  const statusRaw = formData.get('status') as string | null
  const startDateStr = (formData.get('startDate') as string | null) || null

  if (!organizationId) return 'ID de cliente inválido.'
  if (!isServiceType(typeRaw)) return 'Tipo de servicio inválido.'

  const status: ServiceStatus = isServiceStatus(statusRaw) ? statusRaw : 'ACTIVE'
  const startDate = startDateStr ? new Date(startDateStr) : new Date()

  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org) return 'Cliente no encontrado.'

  try {
    await prisma.service.create({
      data: { type: typeRaw, status, startDate, organizationId },
    })
  } catch {
    return 'Error al crear el servicio. Intentá de nuevo.'
  }

  revalidatePath(`/admin/clients/${organizationId}`)
  redirect(`/admin/clients/${organizationId}`)
}

// ─── Update status (inline) ───────────────────────────────────────────────────

export async function updateServiceStatusAction(formData: FormData): Promise<void> {
  const serviceId = (formData.get('serviceId') as string | null) ?? ''
  const organizationId = (formData.get('organizationId') as string | null) ?? ''
  const statusRaw = formData.get('status') as string | null

  if (!serviceId || !isServiceStatus(statusRaw)) return

  await prisma.service.update({
    where: { id: serviceId },
    data: { status: statusRaw },
  })

  revalidatePath(`/admin/clients/${organizationId}`)
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteServiceAction(formData: FormData): Promise<void> {
  const serviceId = (formData.get('serviceId') as string | null) ?? ''
  const organizationId = (formData.get('organizationId') as string | null) ?? ''
  if (!serviceId) return

  await prisma.service.delete({ where: { id: serviceId } })

  revalidatePath(`/admin/clients/${organizationId}`)
  redirect(`/admin/clients/${organizationId}`)
}
