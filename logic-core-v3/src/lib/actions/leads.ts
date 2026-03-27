'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { LEAD_STATUS_VALUES, type LeadStatus } from './leads-constants'

export type { LeadStatus } from './leads-constants'

function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUS_VALUES.includes(value as LeadStatus)
}

async function ensureAdmin() {
  const session = await auth()
  return session?.user?.role === 'SUPER_ADMIN'
}

export async function updateLeadStatusAction(input: {
  id: string
  leadStatus: string
}) {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'No autorizado.' }
  }

  if (!input.id || !isLeadStatus(input.leadStatus)) {
    return { success: false, error: 'Lead inválido.' }
  }

  await prisma.contactSubmission.update({
    where: { id: input.id },
    data: {
      leadStatus: input.leadStatus,
      read: input.leadStatus !== 'NUEVO',
    },
  })

  revalidatePath('/admin/leads')
  revalidatePath('/admin', 'layout')

  return { success: true, leadStatus: input.leadStatus }
}

export async function updateLeadNotesAction(input: {
  id: string
  leadNotes: string
}) {
  if (!(await ensureAdmin())) {
    return { success: false, error: 'No autorizado.' }
  }

  if (!input.id) {
    return { success: false, error: 'Lead inválido.' }
  }

  const note = input.leadNotes.trim()

  await prisma.contactSubmission.update({
    where: { id: input.id },
    data: {
      leadNotes: note.length > 0 ? note : null,
    },
  })

  revalidatePath('/admin/leads')
  return { success: true, leadNotes: note }
}
