'use server'

import { ActivityChannel, ActivityResult, LeadStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireSuperAdmin } from '@/lib/auth-guards'
import { fail, ok, type ActionResult } from '@/lib/action-utils'
import { calculateNextFollowUp, countFollowUps } from '@/lib/follow-up'

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

    const activity = await prisma.osLeadActivity.create({
      data: {
        leadId: parsed.leadId,
        channel: parsed.channel,
        result: parsed.result,
        notes: parsed.notes,
        performedById: userId,
      },
      select: { id: true },
    })

    if (parsed.result === ActivityResult.SIN_RESPUESTA) {
      const activities = await prisma.osLeadActivity.findMany({
        where: { leadId: parsed.leadId },
        select: { result: true },
      })

      const followUpCount = countFollowUps(activities)
      const nextFollowUpAt = calculateNextFollowUp(followUpCount)

      if (nextFollowUpAt) {
        await prisma.osLead.update({
          where: { id: parsed.leadId },
          data: { nextFollowUpAt },
        })
      }
    }

    if (parsed.result === ActivityResult.RESPONDIO) {
      await prisma.osLead.update({
        where: { id: parsed.leadId },
        data: {
          status: LeadStatus.RESPONDIO,
          nextFollowUpAt: null,
        },
      })
    }

    if (parsed.result === ActivityResult.CALL_AGENDADA) {
      await prisma.osLead.update({
        where: { id: parsed.leadId },
        data: {
          status: LeadStatus.CALL_AGENDADA,
          nextFollowUpAt: null,
        },
      })
    }

    revalidatePath('/admin/os/leads')
    revalidatePath(`/admin/os/leads/${parsed.leadId}`)
    return ok({ id: activity.id })
  } catch (error) {
    return fail(error instanceof Error ? error.message : 'Failed to create activity')
  }
}
