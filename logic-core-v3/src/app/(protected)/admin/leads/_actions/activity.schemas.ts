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

// SISTEMA es un evento interno (reasignación) — solo lo escribe la maquinaria
// de assignment-trail, nunca el alta manual de actividad comercial.
const CommercialChannelSchema = z
  .nativeEnum(ActivityChannel)
  .refine((channel) => channel !== ActivityChannel.SISTEMA, {
    message: 'Canal inválido',
  })

export const CreateActivitySchema = z.object({
  leadId: LeadIdSchema,
  channel: CommercialChannelSchema,
  result: optionalActivityResultSchema,
  notes: optionalNotesSchema,
})
