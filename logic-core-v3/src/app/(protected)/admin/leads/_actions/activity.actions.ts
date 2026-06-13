'use server'

import { ActivityChannel, ActivityResult } from '@prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { registrarContactoComercial } from '@/lib/os-commercial'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const LeadIdSchema = z.string().trim().min(1, 'Invalid lead id')

const optionalNotesSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().optional()
)

const optionalActivityResultSchema = z.preprocess(
  emptyStringToUndefined,
  z.nativeEnum(ActivityResult).optional()
)

export const CreateActivitySchema = z.object({
  leadId: LeadIdSchema,
  channel: z.nativeEnum(ActivityChannel),
  result: optionalActivityResultSchema,
  notes: optionalNotesSchema,
})

export async function createActivity(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireSuperAdmin()
    const parsed = CreateActivitySchema.parse(input)

    // B6: la lógica de negocio (activity + efectos por resultado) vive en
    // lib/os-commercial, compartida con el panel del setter. Mismo cuerpo.
    const activity = await registrarContactoComercial({
      leadId: parsed.leadId,
      channel: parsed.channel,
      result: parsed.result,
      notes: parsed.notes,
      performedById: userId,
    })

    revalidatePath('/admin/leads')
    revalidatePath(`/admin/leads/${parsed.leadId}`)
    revalidateTag('admin-leads', {})
    return ok({ id: activity.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create activity')
  }
}
