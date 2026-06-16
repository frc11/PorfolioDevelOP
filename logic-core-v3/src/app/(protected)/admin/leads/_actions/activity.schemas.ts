import { ActivityChannel, ActivityResult } from '@prisma/client'
import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const LeadIdSchema = z.string().trim().min(1, 'Invalid lead id')

const optionalNotesSchema = z.preprocess(emptyStringToUndefined, z.string().optional())

const optionalActivityResultSchema = z.preprocess(
  emptyStringToUndefined,
  z.nativeEnum(ActivityResult).optional(),
)

export const CreateActivitySchema = z.object({
  leadId: LeadIdSchema,
  channel: z.nativeEnum(ActivityChannel),
  result: optionalActivityResultSchema,
  notes: optionalNotesSchema,
})
