'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ─── Admin: Send ──────────────────────────────────────────────────────────────

export async function sendMessageAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const clientId = (formData.get('clientId') as string | null) ?? ''
  const content = ((formData.get('content') as string | null) ?? '').trim()

  if (!clientId) return 'Cliente no especificado.'
  if (!content) return 'El mensaje no puede estar vacío.'

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) return 'Cliente no encontrado.'

  await prisma.message.create({
    data: { clientId, content, fromAdmin: true },
  })

  revalidatePath(`/admin/messages/${clientId}`)
  revalidatePath('/admin/messages')
  revalidatePath('/admin')
  return null
}

// ─── Mark as read ─────────────────────────────────────────────────────────────

export async function markMessagesAsReadAction(clientId: string): Promise<void> {
  if (!clientId) return

  await prisma.message.updateMany({
    where: { clientId, fromAdmin: false, read: false },
    data: { read: true },
  })

  revalidatePath(`/admin/messages/${clientId}`)
  revalidatePath('/admin/messages')
  revalidatePath('/admin')
}

// ─── Client: Send ─────────────────────────────────────────────────────────────

export async function sendClientMessageAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const session = await auth()
  const clientId = session?.user?.clientId
  if (!clientId) return 'Sesión inválida.'

  const content = ((formData.get('content') as string | null) ?? '').trim()
  if (!content) return 'El mensaje no puede estar vacío.'

  await prisma.message.create({
    data: { clientId, content, fromAdmin: false },
  })

  revalidatePath('/dashboard/messages')
  revalidatePath(`/admin/messages/${clientId}`)
  revalidatePath('/admin/messages')
  return null
}

