import { OsServiceType } from '@prisma/client'
import { z } from 'zod'

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

const LeadIdSchema = z.string().trim().min(1, 'Invalid lead id')
const DemoIdSchema = z.string().trim().min(1, 'Invalid demo id')

const optionalUrlSchema = z.preprocess(emptyStringToUndefined, z.string().url().optional())
const optionalStringSchema = z.preprocess(emptyStringToUndefined, z.string().optional())
const optionalServiceTypeSchema = z.preprocess(
  emptyStringToUndefined,
  z.nativeEnum(OsServiceType).optional(),
)

export const CreateDemoSchema = z.object({
  leadId: LeadIdSchema,
  serviceType: optionalServiceTypeSchema,
  demoUrl: z.string().trim().url('A valid demo URL is required'),
  loomUrl: optionalUrlSchema,
  notes: optionalStringSchema,
})

export const MarkDemoViewedSchema = z.object({
  demoId: DemoIdSchema,
})
