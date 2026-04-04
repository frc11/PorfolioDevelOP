import { z } from 'zod'

const SERVICE_TYPE_VALUES = ['WEB', 'AI_AGENT', 'AUTOMATION', 'CUSTOM_SOFTWARE'] as const
const LEAD_STATUS_VALUES = [
  'PROSPECTO',
  'DEMO_ENVIADA',
  'VIO_VIDEO',
  'RESPONDIO',
  'CALL_AGENDADA',
  'CERRADO',
  'PERDIDO',
  'POSTERGADO',
] as const

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const optionalStringSchema = z.preprocess(emptyStringToUndefined, z.string().optional())
const optionalEmailSchema = z.preprocess(emptyStringToUndefined, z.string().email().optional())
const optionalUrlSchema = z.preprocess(emptyStringToUndefined, z.string().url().optional())
const optionalServiceTypeSchema = z.preprocess(
  emptyStringToUndefined,
  z.enum(SERVICE_TYPE_VALUES).optional()
)

const optionalReactivateAtSchema = z.preprocess(
  (value) => {
    if (value === null || value === undefined || value === '') {
      return undefined
    }

    return value
  },
  z.coerce.date().optional()
)

const leadFieldsSchema = {
  businessName: z.string().trim().min(1, 'Business name is required'),
  contactName: optionalStringSchema,
  phone: optionalStringSchema,
  email: optionalEmailSchema,
  industry: optionalStringSchema,
  zone: optionalStringSchema,
  source: optionalStringSchema,
  serviceType: optionalServiceTypeSchema,
  instagramUrl: optionalUrlSchema,
  currentWebUrl: optionalUrlSchema,
  googleMapsUrl: optionalUrlSchema,
  notes: optionalStringSchema,
}

export const LeadIdSchema = z.string().cuid('Invalid lead id')

export const CreateLeadSchema = z.object(leadFieldsSchema)

export const UpdateLeadSchema = CreateLeadSchema.partial().extend({
  leadId: LeadIdSchema,
})

export const UpdateLeadStatusSchema = z
  .object({
    leadId: LeadIdSchema,
    status: z.enum(LEAD_STATUS_VALUES),
    reactivateAt: optionalReactivateAtSchema,
  })
  .superRefine((value, ctx) => {
    if (value.status === 'POSTERGADO' && !value.reactivateAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'reactivateAt is required when status is POSTERGADO',
        path: ['reactivateAt'],
      })
    }
  })
