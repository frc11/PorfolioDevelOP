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
  const clientId = (formData.get('clientId') as string | null) ?? ''
  const typeRaw = formData.get('type') as string | null
  const statusRaw = formData.get('status') as string | null
  const startDateStr = (formData.get('startDate') as string | null) || null

  if (!clientId) return 'ID de cliente inválido.'
  if (!isServiceType(typeRaw)) return 'Tipo de servicio inválido.'

  const status: ServiceStatus = isServiceStatus(statusRaw) ? statusRaw : 'ACTIVE'
  const startDate = startDateStr ? new Date(startDateStr) : new Date()

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) return 'Cliente no encontrado.'

  await prisma.service.create({
    data: { type: typeRaw, status, startDate, clientId },
  })

  revalidatePath(`/admin/clients/${clientId}`)
  redirect(`/admin/clients/${clientId}`)
}

// ─── Update status (inline) ───────────────────────────────────────────────────

export async function updateServiceStatusAction(formData: FormData): Promise<void> {
  const serviceId = (formData.get('serviceId') as string | null) ?? ''
  const clientId = (formData.get('clientId') as string | null) ?? ''
  const statusRaw = formData.get('status') as string | null

  if (!serviceId || !isServiceStatus(statusRaw)) return

  await prisma.service.update({
    where: { id: serviceId },
    data: { status: statusRaw },
  })

  revalidatePath(`/admin/clients/${clientId}`)
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteServiceAction(formData: FormData): Promise<void> {
  const serviceId = (formData.get('serviceId') as string | null) ?? ''
  const clientId = (formData.get('clientId') as string | null) ?? ''
  if (!serviceId) return

  await prisma.service.delete({ where: { id: serviceId } })

  revalidatePath(`/admin/clients/${clientId}`)
  redirect(`/admin/clients/${clientId}`)
}
